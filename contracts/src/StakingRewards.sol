// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "./interfaces/IERC20.sol";

/// @notice Reference implementation matching the deployed ISS StakingRewards ABI.
/// @dev Based on Synthetix StakingRewards with owner controls and transfer fees.
contract StakingRewards {
    error Unauthorized();
    error ZeroAmount();
    error RewardsStillAvailable();
    error InsufficientBalance();

    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardsToken;
    address public owner;
    uint256 public rewardTransferFee;

    uint256 public duration;
    uint256 public startTime;
    uint256 public finishAt;
    uint256 public updatedAt;
    uint256 public rewardRate;
    uint256 public rewardPerTokenStored;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    uint256 private constant ONE = 1e18;
    bool private _entered;

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier nonReentrant() {
        if (_entered) revert();
        _entered = true;
        _;
        _entered = false;
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        updatedAt = lastTimeRewardApplicable();

        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    constructor(address _owner, address _stakingToken, address _rewardToken, uint256 _rewardTransferFee) {
        owner = _owner;
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardToken);
        rewardTransferFee = _rewardTransferFee;
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return finishAt < block.timestamp ? finishAt : block.timestamp;
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return rewardPerTokenStored
            + ((rewardRate * (lastTimeRewardApplicable() - updatedAt) * ONE) / totalSupply);
    }

    function earned(address account) public view returns (uint256) {
        return ((balanceOf[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) / ONE)
            + rewards[account];
    }

    function getCountDown()
        external
        view
        returns (uint256 Days, uint256 Hours, uint256 Minutes, uint256 Seconds)
    {
        if (finishAt <= block.timestamp) {
            return (0, 0, 0, 0);
        }
        uint256 remaining = finishAt - block.timestamp;
        Days = remaining / 1 days;
        remaining %= 1 days;
        Hours = remaining / 1 hours;
        remaining %= 1 hours;
        Minutes = remaining / 1 minutes;
        Seconds = remaining % 1 minutes;
    }

    function setRewardsDuration(uint256 _duration) external onlyOwner {
        if (block.timestamp <= finishAt) revert RewardsStillAvailable();
        duration = _duration;
    }

    function notifyRewardAmount(uint256 _amount, bool _update) external onlyOwner updateReward(address(0)) {
        if (_update) {
            rewardPerTokenStored = rewardPerToken();
            updatedAt = lastTimeRewardApplicable();
        }

        if (block.timestamp >= finishAt) {
            rewardRate = _amount / duration;
        } else {
            uint256 remaining = finishAt - block.timestamp;
            uint256 leftover = remaining * rewardRate;
            rewardRate = (_amount + leftover) / duration;
        }

        if (!rewardsToken.transferFrom(msg.sender, address(this), _amount)) revert InsufficientBalance();

        updatedAt = block.timestamp;
        if (duration == 0) revert();
        startTime = block.timestamp;
        finishAt = block.timestamp + duration;
    }

    function stake(uint256 _amount) external nonReentrant updateReward(msg.sender) {
        if (_amount == 0) revert ZeroAmount();
        totalSupply += _amount;
        balanceOf[msg.sender] += _amount;
        if (!stakingToken.transferFrom(msg.sender, address(this), _amount)) revert InsufficientBalance();
    }

    function withdraw(uint256 _amount) external nonReentrant updateReward(msg.sender) {
        if (_amount == 0) revert ZeroAmount();
        if (balanceOf[msg.sender] < _amount) revert InsufficientBalance();
        totalSupply -= _amount;
        balanceOf[msg.sender] -= _amount;
        if (!stakingToken.transfer(msg.sender, _amount)) revert InsufficientBalance();
    }

    function getReward() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward == 0) return;
        rewards[msg.sender] = 0;

        if (rewardTransferFee > 0) {
            if (reward <= rewardTransferFee) revert InsufficientBalance();
            if (!rewardsToken.transfer(owner, rewardTransferFee)) revert InsufficientBalance();
            reward -= rewardTransferFee;
        }

        if (!rewardsToken.transfer(msg.sender, reward)) revert InsufficientBalance();
    }

    function changeOwner(address _newOwner) external onlyOwner {
        owner = _newOwner;
    }

    function withdrawERC20(address _tokenAddress, uint256 _amount) external onlyOwner {
        if (!IERC20(_tokenAddress).transfer(owner, _amount)) revert InsufficientBalance();
    }

    function withdrawETH(uint256 _amount) external onlyOwner {
        (bool ok,) = owner.call{value: _amount}("");
        if (!ok) revert();
    }

    function destroy() external onlyOwner {
        if (totalSupply != 0) revert RewardsStillAvailable();
        selfdestruct(payable(owner));
    }

    receive() external payable {}
}
