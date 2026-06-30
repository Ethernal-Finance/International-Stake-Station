// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {StakingRewards} from "./StakingRewards.sol";

/// @notice Reference factory matching the deployed ISS Factory ABI.
contract StakingFactory {
    error Unauthorized();
    error InvalidReferralCode();
    error ReferralCodeEmpty();
    error ReferralCodeExists();
    error InvalidReferralPercentage();
    error InvalidStakingRewards();
    error ReferralTransferFailed();
    error InsufficientPayment();

    struct StakingPoolInfo {
        address contractAddress;
        string name;
        string link;
        address owner;
        address stakingToken;
        address rewardToken;
    }

    event StakingPoolCreated(address indexed stakingRewards, address indexed stakingToken, address indexed rewardsToken);
    event ReferralCodeCreated(address indexed user, string referralCode);
    event ReferrerEarned(address indexed referrer, uint256 amount);

    address public owner;
    uint256 public requiredPaymentAmount;
    uint256 public referralPercentage;

    StakingPoolInfo[] public allStakingRewards;
    mapping(address => bool) public isStakingRewards;
    mapping(address => bool) public isAdmin;
    mapping(address => bool) public isModerator;
    mapping(address => string) public userReferralCodes;
    mapping(string => address) public referralCodeToAddress;
    mapping(string => uint256) public referralEarnings;
    mapping(string => mapping(uint256 => address)) public referralStakingRewards;
    mapping(string => string[]) private _referredNames;

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyAdmin() {
        if (!isAdmin[msg.sender]) revert Unauthorized();
        _;
    }

    modifier onlyOwnerOrModerator(address pool) {
        StakingPoolInfo memory info = _findPool(pool);
        if (msg.sender != info.owner && !isModerator[msg.sender]) revert Unauthorized();
        _;
    }

    constructor(uint256 _requiredPaymentAmount, uint256 _referralPercentage) {
        if (_referralPercentage > 100) revert InvalidReferralPercentage();
        owner = msg.sender;
        isAdmin[msg.sender] = true;
        requiredPaymentAmount = _requiredPaymentAmount;
        referralPercentage = _referralPercentage;
    }

    function getStakingRewardsCount() external view returns (uint256) {
        return allStakingRewards.length;
    }

    function createReferralCode(string calldata _referralCode) external {
        if (bytes(_referralCode).length == 0) revert ReferralCodeEmpty();
        if (referralCodeToAddress[_referralCode] != address(0)) revert ReferralCodeExists();
        if (bytes(userReferralCodes[msg.sender]).length != 0) revert ReferralCodeExists();

        referralCodeToAddress[_referralCode] = msg.sender;
        userReferralCodes[msg.sender] = _referralCode;
        emit ReferralCodeCreated(msg.sender, _referralCode);
    }

    function createStakingRewards(
        address _stakingToken,
        address _rewardToken,
        uint256 _rewardTransferFee,
        string calldata _name,
        string calldata _link,
        string calldata _referralCode
    ) external payable {
        if (msg.value < requiredPaymentAmount) revert InsufficientPayment();

        StakingRewards staking = new StakingRewards(msg.sender, _stakingToken, _rewardToken, _rewardTransferFee);
        address poolAddress = address(staking);

        isStakingRewards[poolAddress] = true;
        allStakingRewards.push(
            StakingPoolInfo({
                contractAddress: poolAddress,
                name: _name,
                link: _link,
                owner: msg.sender,
                stakingToken: _stakingToken,
                rewardToken: _rewardToken
            })
        );

        if (bytes(_referralCode).length > 0) {
            address referrer = referralCodeToAddress[_referralCode];
            if (referrer == address(0)) revert InvalidReferralCode();

            uint256 referralAmount = (msg.value * referralPercentage) / 100;
            referralEarnings[_referralCode] += referralAmount;
            _referredNames[_referralCode].push(_name);
            referralStakingRewards[_referralCode][allStakingRewards.length - 1] = poolAddress;

            (bool ok,) = referrer.call{value: referralAmount}("");
            if (!ok) revert ReferralTransferFailed();
            emit ReferrerEarned(referrer, referralAmount);
        }

        emit StakingPoolCreated(poolAddress, _stakingToken, _rewardToken);
    }

    function getReferralCode(address _user) external view returns (string memory) {
        return userReferralCodes[_user];
    }

    function getReferralEarnings(string calldata _referralCode) external view returns (uint256) {
        return referralEarnings[_referralCode];
    }

    function getReferrednames(string calldata _referralCode) external view returns (string[] memory) {
        return _referredNames[_referralCode];
    }

    function getStakingRewardsCountdown(address _stakingRewards)
        external
        view
        returns (uint256 daysRemaining, uint256 hoursRemaining, uint256 minutesRemaining, uint256 secondsRemaining)
    {
        if (!isStakingRewards[_stakingRewards]) revert InvalidStakingRewards();
        return StakingRewards(payable(_stakingRewards)).getCountDown();
    }

    function changeStakingRewardName(address _stakingRewards, string calldata _newName)
        external
        onlyOwnerOrModerator(_stakingRewards)
    {
        _findPool(_stakingRewards).name = _newName;
    }

    function changeStakingRewardLink(address _stakingRewards, string calldata _newLink)
        external
        onlyOwnerOrModerator(_stakingRewards)
    {
        _findPool(_stakingRewards).link = _newLink;
    }

    function setAdmin(address _newAdmin) external onlyOwner {
        isAdmin[_newAdmin] = true;
    }

    function removeAdmin(address _admin) external onlyOwner {
        isAdmin[_admin] = false;
    }

    function addModerator(address _moderator) external onlyAdmin {
        isModerator[_moderator] = true;
    }

    function removeModerator(address _moderator) external onlyAdmin {
        isModerator[_moderator] = false;
    }

    function updateRequiredPaymentAmount(uint256 _newAmount) external onlyAdmin {
        requiredPaymentAmount = _newAmount;
    }

    function setReferralPercentage(uint256 _newPercentage) external onlyAdmin {
        if (_newPercentage > 100) revert InvalidReferralPercentage();
        referralPercentage = _newPercentage;
    }

    function updateReferralPercentage(uint256 _newPercentage) external onlyAdmin {
        if (_newPercentage > 100) revert InvalidReferralPercentage();
        referralPercentage = _newPercentage;
    }

    function withdrawBNB() external onlyAdmin {
        if (address(this).balance == 0) revert();
        (bool ok,) = owner.call{value: address(this).balance}("");
        if (!ok) revert();
    }

    function _findPool(address pool) internal view returns (StakingPoolInfo storage info) {
        for (uint256 i = 0; i < allStakingRewards.length; i++) {
            if (allStakingRewards[i].contractAddress == pool) {
                return allStakingRewards[i];
            }
        }
        revert InvalidStakingRewards();
    }
}
