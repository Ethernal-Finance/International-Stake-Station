import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import IERC20Abi from '../Blockchain/Abi/IERC20.json';
import StakingAbi from '../Blockchain/Abi/Staking.json';
import LoadingSpinner from '../components/LoadingSpinner';
import PageLayout from '../components/PageLayout';
import { useToast } from '../context/ToastContext';
import { useWeb3 } from '../context/Web3Context';
import { EXPLORER_URL } from '../constants/network';
import { formatCountdown, formatTokenAmount, parseTokenAmount, truncateAddress } from '../utils/format';
import './PoolDetailPage.css';

function PoolDetailPage() {
  const { address } = useParams();
  const { web3, account, contract, isConnected, isCorrectNetwork } = useWeb3();
  const { addToast } = useToast();

  const [poolMeta, setPoolMeta] = useState(null);
  const [poolStats, setPoolStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [walletBalance, setWalletBalance] = useState('0');
  const [allowance, setAllowance] = useState('0');
  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const stakingContract = useMemo(() => {
    if (!web3 || !address) return null;
    return new web3.eth.Contract(StakingAbi.abi, address);
  }, [web3, address]);

  const loadPoolData = useCallback(async () => {
    if (!contract || !stakingContract) return;

    setIsLoading(true);
    setError('');
    try {
      const poolCount = Number(await contract.methods.getStakingRewardsCount().call());
      let matchedPool = null;

      for (let i = 0; i < poolCount; i += 1) {
        const pool = await contract.methods.allStakingRewards(i).call();
        if (pool.contractAddress.toLowerCase() === address.toLowerCase()) {
          matchedPool = pool;
          break;
        }
      }

      if (!matchedPool) {
        setError('Staking pool not found.');
        return;
      }

      const [totalSupply, countdown, stakingTokenAddress, rewardTokenAddress] = await Promise.all([
        stakingContract.methods.totalSupply().call(),
        contract.methods.getStakingRewardsCountdown(address).call(),
        stakingContract.methods.stakingToken().call(),
        stakingContract.methods.rewardsToken().call(),
      ]);

      setPoolMeta(matchedPool);
      setPoolStats({
        totalSupply,
        countdown,
        stakingTokenAddress,
        rewardTokenAddress,
      });

      if (account) {
        const [stakedBalance, earnedRewards, balance, tokenAllowance] = await Promise.all([
          stakingContract.methods.balanceOf(account).call(),
          stakingContract.methods.earned(account).call(),
          new web3.eth.Contract(IERC20Abi.abi, stakingTokenAddress).methods.balanceOf(account).call(),
          new web3.eth.Contract(IERC20Abi.abi, stakingTokenAddress).methods.allowance(account, address).call(),
        ]);

        setUserStats({ stakedBalance, earnedRewards });
        setWalletBalance(balance);
        setAllowance(tokenAllowance);
      } else {
        setUserStats(null);
        setWalletBalance('0');
        setAllowance('0');
      }
    } catch (loadError) {
      setError(loadError.message || 'Failed to load pool details.');
    } finally {
      setIsLoading(false);
    }
  }, [account, address, contract, stakingContract, web3]);

  useEffect(() => {
    loadPoolData();
  }, [loadPoolData]);

  const needsApproval = useMemo(() => {
    if (!stakeAmount) return false;
    try {
      const amount = BigInt(parseTokenAmount(stakeAmount));
      return amount > BigInt(allowance || '0');
    } catch {
      return true;
    }
  }, [allowance, stakeAmount]);

  const handleApprove = async () => {
    if (!web3 || !account || !poolStats) return;
    setIsSubmitting(true);
    try {
      const tokenContract = new web3.eth.Contract(IERC20Abi.abi, poolStats.stakingTokenAddress);
      const amount = parseTokenAmount(stakeAmount || '0');
      await tokenContract.methods.approve(address, amount).send({ from: account });
      addToast('Token approval confirmed.', 'success');
      await loadPoolData();
    } catch (submitError) {
      addToast(submitError.message || 'Approval failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStake = async () => {
    if (!account || !stakingContract || !stakeAmount) return;
    setIsSubmitting(true);
    try {
      const amount = parseTokenAmount(stakeAmount);
      await stakingContract.methods.stake(amount).send({ from: account });
      addToast('Stake successful.', 'success');
      setStakeAmount('');
      await loadPoolData();
    } catch (submitError) {
      addToast(submitError.message || 'Stake failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!account || !stakingContract || !withdrawAmount) return;
    setIsSubmitting(true);
    try {
      const amount = parseTokenAmount(withdrawAmount);
      await stakingContract.methods.withdraw(amount).send({ from: account });
      addToast('Withdrawal successful.', 'success');
      setWithdrawAmount('');
      await loadPoolData();
    } catch (submitError) {
      addToast(submitError.message || 'Withdraw failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaim = async () => {
    if (!account || !stakingContract) return;
    setIsSubmitting(true);
    try {
      await stakingContract.methods.getReward().send({ from: account });
      addToast('Rewards claimed successfully.', 'success');
      await loadPoolData();
    } catch (submitError) {
      addToast(submitError.message || 'Claim failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Pool Details">
        <LoadingSpinner label="Loading pool..." />
      </PageLayout>
    );
  }

  if (error || !poolMeta || !poolStats) {
    return (
      <PageLayout title="Pool Details">
        <div className="pool-detail-empty">
          <p>{error || 'Unable to load this pool.'}</p>
          <Link to="/" className="back-link">
            Back to pools
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={poolMeta.name || 'Staking Pool'}
      subtitle={`Contract: ${truncateAddress(address, 8)}`}
    >
      <div className="pool-detail-grid">
        <section className="detail-card">
          <h3>Pool Overview</h3>
          <ul>
            <li>
              <span>Total Staked</span>
              <strong>{formatTokenAmount(poolStats.totalSupply)}</strong>
            </li>
            <li>
              <span>Time Remaining</span>
              <strong>
                {formatCountdown(
                  poolStats.countdown.daysRemaining,
                  poolStats.countdown.hoursRemaining,
                  poolStats.countdown.minutesRemaining,
                  poolStats.countdown.secondsRemaining
                )}
              </strong>
            </li>
            <li>
              <span>Staking Token</span>
              <a
                href={`${EXPLORER_URL}/address/${poolStats.stakingTokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {truncateAddress(poolStats.stakingTokenAddress, 6)}
              </a>
            </li>
            <li>
              <span>Reward Token</span>
              <a
                href={`${EXPLORER_URL}/address/${poolStats.rewardTokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {truncateAddress(poolStats.rewardTokenAddress, 6)}
              </a>
            </li>
          </ul>
        </section>

        <section className="detail-card">
          <h3>Your Position</h3>
          {!isConnected ? (
            <p className="hint-text">Connect your wallet to stake, withdraw, or claim rewards.</p>
          ) : !isCorrectNetwork ? (
            <p className="hint-text">Switch to Polygon Mainnet to interact with this pool.</p>
          ) : (
            <>
              <ul>
                <li>
                  <span>Wallet Balance</span>
                  <strong>{formatTokenAmount(walletBalance)}</strong>
                </li>
                <li>
                  <span>Staked</span>
                  <strong>{formatTokenAmount(userStats?.stakedBalance || '0')}</strong>
                </li>
                <li>
                  <span>Pending Rewards</span>
                  <strong>{formatTokenAmount(userStats?.earnedRewards || '0')}</strong>
                </li>
              </ul>

              <div className="action-group">
                <label htmlFor="stake-amount">Stake Amount</label>
                <input
                  id="stake-amount"
                  type="number"
                  min="0"
                  step="any"
                  value={stakeAmount}
                  onChange={(event) => setStakeAmount(event.target.value)}
                  placeholder="0.0"
                  disabled={isSubmitting}
                />
                <div className="action-buttons">
                  {needsApproval ? (
                    <button type="button" onClick={handleApprove} disabled={isSubmitting || !stakeAmount}>
                      Approve
                    </button>
                  ) : (
                    <button type="button" onClick={handleStake} disabled={isSubmitting || !stakeAmount}>
                      Stake
                    </button>
                  )}
                </div>
              </div>

              <div className="action-group">
                <label htmlFor="withdraw-amount">Withdraw Amount</label>
                <input
                  id="withdraw-amount"
                  type="number"
                  min="0"
                  step="any"
                  value={withdrawAmount}
                  onChange={(event) => setWithdrawAmount(event.target.value)}
                  placeholder="0.0"
                  disabled={isSubmitting}
                />
                <div className="action-buttons">
                  <button type="button" onClick={handleWithdraw} disabled={isSubmitting || !withdrawAmount}>
                    Withdraw
                  </button>
                  <button type="button" onClick={handleClaim} disabled={isSubmitting}>
                    Claim Rewards
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      <Link to="/" className="back-link">
        ← Back to all pools
      </Link>
    </PageLayout>
  );
}

export default PoolDetailPage;
