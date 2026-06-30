import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import IERC20Abi from '../Blockchain/Abi/IERC20.json';
import StakingAbi from '../Blockchain/Abi/Staking.json';
import ExplorerLink from '../components/ExplorerLink';
import LoadingSpinner from '../components/LoadingSpinner';
import PageLayout from '../components/PageLayout';
import TokenAmount from '../components/TokenAmount';
import TrustWarning from '../components/TrustWarning';
import { usePools } from '../context/PoolContext';
import { useToast } from '../context/ToastContext';
import { useWeb3 } from '../context/Web3Context';
import { useTokenMetadata } from '../hooks/useTokenMetadata';
import { formatCountdown, formatTokenAmount, parseTokenAmount, truncateAddress } from '../utils/format';
import { validatePoolSafety } from '../utils/contractSafety';
import './PoolDetailPage.css';

function PoolDetailPage() {
  const { address } = useParams();
  const { web3, account, contract, isConnected, isCorrectNetwork } = useWeb3();
  const { resolvePool } = usePools();
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
  const [safety, setSafety] = useState({ warnings: [], blockers: [], canInteract: true });

  const stakingContract = useMemo(() => {
    if (!web3 || !address || !web3.utils.isAddress(address)) return null;
    return new web3.eth.Contract(StakingAbi.abi, address);
  }, [web3, address]);

  const stakingTokenMeta = useTokenMetadata(web3, poolStats?.stakingTokenAddress);
  const rewardTokenMeta = useTokenMetadata(web3, poolStats?.rewardTokenAddress);

  const loadPoolData = useCallback(async () => {
    if (!contract || !stakingContract || !web3) return;

    if (!web3.utils.isAddress(address)) {
      setError('Invalid pool address.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const matchedPool = await resolvePool(address);
      if (!matchedPool) {
        setError('Staking pool not found or not registered with the factory.');
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
        const tokenContract = new web3.eth.Contract(IERC20Abi.abi, stakingTokenAddress);
        const [stakedBalance, earnedRewards, balance, tokenAllowance] = await Promise.all([
          stakingContract.methods.balanceOf(account).call(),
          stakingContract.methods.earned(account).call(),
          tokenContract.methods.balanceOf(account).call(),
          tokenContract.methods.allowance(account, address).call(),
        ]);

        setUserStats({ stakedBalance, earnedRewards });
        setWalletBalance(balance);
        setAllowance(tokenAllowance);
      } else {
        setUserStats(null);
        setWalletBalance('0');
        setAllowance('0');
      }

      const safetyResult = await validatePoolSafety(web3, contract, address, account);
      setSafety(safetyResult);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load pool details.');
    } finally {
      setIsLoading(false);
    }
  }, [account, address, contract, resolvePool, stakingContract, web3]);

  useEffect(() => {
    loadPoolData();
  }, [loadPoolData]);

  const needsApproval = useMemo(() => {
    if (!stakeAmount || stakingTokenMeta.loading) return false;
    try {
      const amount = BigInt(parseTokenAmount(stakeAmount, stakingTokenMeta.decimals));
      return amount > BigInt(allowance || '0');
    } catch {
      return true;
    }
  }, [allowance, stakeAmount, stakingTokenMeta.decimals, stakingTokenMeta.loading]);

  const showTxToast = (message, receipt) => {
    addToast(message, 'success', { txHash: receipt?.transactionHash });
  };

  const handleApprove = async () => {
    if (!web3 || !account || !poolStats) return;
    setIsSubmitting(true);
    try {
      const tokenContract = new web3.eth.Contract(IERC20Abi.abi, poolStats.stakingTokenAddress);
      const amount = parseTokenAmount(stakeAmount || '0', stakingTokenMeta.decimals);
      const receipt = await tokenContract.methods.approve(address, amount).send({ from: account });
      showTxToast('Token approval confirmed.', receipt);
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
      const amount = parseTokenAmount(stakeAmount, stakingTokenMeta.decimals);
      const receipt = await stakingContract.methods.stake(amount).send({ from: account });
      showTxToast('Stake successful.', receipt);
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
      const amount = parseTokenAmount(withdrawAmount, stakingTokenMeta.decimals);
      const receipt = await stakingContract.methods.withdraw(amount).send({ from: account });
      showTxToast('Withdrawal successful.', receipt);
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
      const receipt = await stakingContract.methods.getReward().send({ from: account });
      showTxToast('Rewards claimed successfully.', receipt);
      await loadPoolData();
    } catch (submitError) {
      addToast(submitError.message || 'Claim failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setMaxStake = () => {
    if (!walletBalance || stakingTokenMeta.loading) return;
    setStakeAmount(formatTokenAmount(walletBalance, stakingTokenMeta.decimals, 8));
  };

  const setMaxWithdraw = () => {
    if (!userStats?.stakedBalance || stakingTokenMeta.loading) return;
    setWithdrawAmount(formatTokenAmount(userStats.stakedBalance, stakingTokenMeta.decimals, 8));
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
      subtitle={
        <>
          Contract: <ExplorerLink type="address" value={address} label={truncateAddress(address, 8)} />
        </>
      }
    >
      <TrustWarning poolAddress={address} />

      {safety.blockers.length > 0 && (
        <ul className="safety-list safety-blockers">
          {safety.blockers.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {safety.warnings.length > 0 && (
        <ul className="safety-list safety-warnings">
          {safety.warnings.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      <div className="pool-detail-grid">
        <section className="detail-card">
          <h3>Pool Overview</h3>
          <ul>
            <li>
              <span>Total Staked</span>
              <strong>
                <TokenAmount
                  web3={web3}
                  tokenAddress={poolStats.stakingTokenAddress}
                  amount={poolStats.totalSupply}
                />
              </strong>
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
              <ExplorerLink type="address" value={poolStats.stakingTokenAddress} />
            </li>
            <li>
              <span>Reward Token</span>
              <ExplorerLink type="address" value={poolStats.rewardTokenAddress} />
            </li>
            <li>
              <span>Pool Owner</span>
              <ExplorerLink type="address" value={poolMeta.owner} />
            </li>
          </ul>
        </section>

        <section className="detail-card">
          <h3>Your Position</h3>
          {!isConnected ? (
            <p className="hint-text">Connect your wallet to stake, withdraw, or claim rewards.</p>
          ) : !isCorrectNetwork ? (
            <p className="hint-text">Switch to Polygon Mainnet to interact with this pool.</p>
          ) : !safety.canInteract ? (
            <p className="hint-text">This pool failed safety checks and cannot be used.</p>
          ) : (
            <>
              <ul>
                <li>
                  <span>Wallet Balance</span>
                  <strong>
                    {formatTokenAmount(walletBalance, stakingTokenMeta.decimals)} {stakingTokenMeta.symbol}
                  </strong>
                </li>
                <li>
                  <span>Staked</span>
                  <strong>
                    {formatTokenAmount(userStats?.stakedBalance || '0', stakingTokenMeta.decimals)}{' '}
                    {stakingTokenMeta.symbol}
                  </strong>
                </li>
                <li>
                  <span>Pending Rewards</span>
                  <strong>
                    {formatTokenAmount(userStats?.earnedRewards || '0', rewardTokenMeta.decimals)}{' '}
                    {rewardTokenMeta.symbol}
                  </strong>
                </li>
              </ul>

              <div className="action-group">
                <label htmlFor="stake-amount">Stake Amount ({stakingTokenMeta.symbol})</label>
                <div className="input-with-max">
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
                  <button type="button" className="max-button" onClick={setMaxStake} disabled={isSubmitting}>
                    Max
                  </button>
                </div>
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
                <label htmlFor="withdraw-amount">Withdraw Amount ({stakingTokenMeta.symbol})</label>
                <div className="input-with-max">
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
                  <button type="button" className="max-button" onClick={setMaxWithdraw} disabled={isSubmitting}>
                    Max
                  </button>
                </div>
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
