// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {StakingFactory} from "../src/StakingFactory.sol";
import {StakingRewards} from "../src/StakingRewards.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";

contract StakingFactoryTest is Test {
    StakingFactory internal factory;
    MockERC20 internal stakeToken;
    MockERC20 internal rewardToken;

    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);
    address internal referrer = address(0xBEEF);

    function setUp() public {
        factory = new StakingFactory(0.1 ether, 10);
        stakeToken = new MockERC20("Stake", "STK", 18);
        rewardToken = new MockERC20("Reward", "RWD", 6);

        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.deal(referrer, 1 ether);

        stakeToken.mint(alice, 1_000 ether);
        stakeToken.mint(bob, 1_000 ether);
        rewardToken.mint(alice, 1_000_000);
    }

    function test_createPool_registersWithFactory() public {
        vm.startPrank(referrer);
        factory.createReferralCode("REF123");
        vm.stopPrank();

        uint256 referrerBefore = referrer.balance;

        vm.startPrank(alice);
        factory.createStakingRewards{value: 0.1 ether}(
            address(stakeToken), address(rewardToken), 0, "Alice Pool", "https://logo", "REF123"
        );
        vm.stopPrank();

        assertEq(factory.getStakingRewardsCount(), 1);
        (address pool,,,,,) = factory.allStakingRewards(0);
        assertTrue(factory.isStakingRewards(pool));
        assertEq(factory.getReferralEarnings("REF123"), 0.01 ether);
        assertEq(referrer.balance, referrerBefore + 0.01 ether);
    }

    function _poolAt(uint256 index) internal view returns (address) {
        (address pool,,,,,) = factory.allStakingRewards(index);
        return pool;
    }

    function test_stakeWithdrawAndClaimFlow() public {
        vm.prank(alice);
        factory.createStakingRewards{value: 0.1 ether}(
            address(stakeToken), address(rewardToken), 0, "Pool", "", ""
        );

        address pool = _poolAt(0);
        StakingRewards staking = StakingRewards(payable(pool));

        vm.startPrank(alice);
        staking.setRewardsDuration(7 days);
        rewardToken.approve(pool, 1_000_000);
        staking.notifyRewardAmount(1_000_000, true);

        stakeToken.approve(pool, 100 ether);
        staking.stake(100 ether);
        assertEq(staking.balanceOf(alice), 100 ether);

        vm.warp(block.timestamp + 1 days);
        assertGt(staking.earned(alice), 0);

        staking.getReward();
        assertGt(rewardToken.balanceOf(alice), 0);

        staking.withdraw(100 ether);
        assertEq(staking.balanceOf(alice), 0);
        vm.stopPrank();
    }

    function test_revertWhen_stakeWithoutApproval() public {
        vm.prank(alice);
        factory.createStakingRewards{value: 0.1 ether}(
            address(stakeToken), address(rewardToken), 0, "Pool", "", ""
        );
        StakingRewards staking = StakingRewards(payable(_poolAt(0)));

        vm.prank(alice);
        vm.expectRevert(StakingRewards.InsufficientBalance.selector);
        staking.stake(1 ether);
    }

    function test_revertWhen_invalidReferralCode() public {
        vm.startPrank(alice);
        vm.expectRevert(StakingFactory.InvalidReferralCode.selector);
        factory.createStakingRewards{value: 0.1 ether}(
            address(stakeToken), address(rewardToken), 0, "Pool", "", "MISSING"
        );
        vm.stopPrank();
    }

    function test_revertWhen_nonOwnerChangesPoolName() public {
        vm.prank(alice);
        factory.createStakingRewards{value: 0.1 ether}(
            address(stakeToken), address(rewardToken), 0, "Pool", "", ""
        );
        address pool = _poolAt(0);

        vm.prank(bob);
        vm.expectRevert(StakingFactory.Unauthorized.selector);
        factory.changeStakingRewardName(pool, "Hijacked");
    }

    function test_revertWhen_destroyWithActiveStake() public {
        vm.prank(alice);
        factory.createStakingRewards{value: 0.1 ether}(
            address(stakeToken), address(rewardToken), 0, "Pool", "", ""
        );
        StakingRewards staking = StakingRewards(payable(_poolAt(0)));

        vm.startPrank(alice);
        stakeToken.approve(address(staking), 1 ether);
        staking.stake(1 ether);
        vm.expectRevert(StakingRewards.RewardsStillAvailable.selector);
        staking.destroy();
        vm.stopPrank();
    }

    function testFuzz_referralPercentageNeverExceedsPayment(uint256 payment) public {
        payment = bound(payment, 0.1 ether, 100 ether);
        vm.deal(alice, payment);

        vm.prank(referrer);
        factory.createReferralCode("REF");

        uint256 before = referrer.balance;
        vm.prank(alice);
        factory.createStakingRewards{value: payment}(
            address(stakeToken), address(rewardToken), 0, "Pool", "", "REF"
        );

        assertLe(referrer.balance - before, payment);
    }
}
