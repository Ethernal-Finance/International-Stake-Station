import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useWeb3 } from '../../context/Web3Context';
import { truncateAddress, formatCountdown } from '../../utils/format';
import './StakingPools.css';

function StakingPools() {
  const { contract, isCorrectNetwork } = useWeb3();
  const [stakingPools, setStakingPools] = useState([]);
  const [countdowns, setCountdowns] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStakingPools = useCallback(async () => {
    if (!contract) return;

    setIsLoading(true);
    setError('');
    try {
      const poolCount = Number(await contract.methods.getStakingRewardsCount().call());
      const pools = [];
      const nextCountdowns = {};

      for (let i = 0; i < poolCount; i += 1) {
        const pool = await contract.methods.allStakingRewards(i).call();
        pools.push(pool);

        try {
          const countdown = await contract.methods
            .getStakingRewardsCountdown(pool.contractAddress)
            .call();
          nextCountdowns[pool.contractAddress] = countdown;
        } catch {
          nextCountdowns[pool.contractAddress] = null;
        }
      }

      setStakingPools(pools);
      setCountdowns(nextCountdowns);
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to fetch staking pools.');
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    fetchStakingPools();
  }, [fetchStakingPools]);

  if (!isCorrectNetwork) {
    return (
      <div className="empty-state">
        <p>Connect to Polygon Mainnet to browse available staking pools.</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner label="Loading staking pools..." />;
  }

  if (error) {
    return (
      <div className="empty-state">
        <p>{error}</p>
        <button type="button" className="secondary-button" onClick={fetchStakingPools}>
          Retry
        </button>
      </div>
    );
  }

  if (!stakingPools.length) {
    return (
      <div className="empty-state">
        <p>No staking pools available yet.</p>
        <Link to="/create" className="primary-link">
          Create the first pool
        </Link>
      </div>
    );
  }

  return (
    <div className="staking-pools-container">
      {stakingPools.map((pool) => {
        const countdown = countdowns[pool.contractAddress];
        return (
          <article className="pool-card" key={pool.contractAddress}>
            <div className="pool-card-header">
              {pool.link ? (
                <img src={pool.link} alt={`${pool.name} logo`} className="pool-logo-image" />
              ) : (
                <div className="pool-logo-placeholder">{pool.name?.charAt(0) || '?'}</div>
              )}
              <div>
                <h3>{pool.name || 'Unnamed Pool'}</h3>
                <p className="pool-address">{truncateAddress(pool.contractAddress, 6)}</p>
              </div>
            </div>

            <dl className="pool-details">
              <div>
                <dt>Staking Token</dt>
                <dd>{truncateAddress(pool.stakingToken, 6)}</dd>
              </div>
              <div>
                <dt>Reward Token</dt>
                <dd>{truncateAddress(pool.rewardToken, 6)}</dd>
              </div>
              {countdown && (
                <div>
                  <dt>Time Remaining</dt>
                  <dd>
                    {formatCountdown(
                      countdown.daysRemaining,
                      countdown.hoursRemaining,
                      countdown.minutesRemaining,
                      countdown.secondsRemaining
                    )}
                  </dd>
                </div>
              )}
            </dl>

            <Link to={`/pool/${pool.contractAddress}`} className="primary-button">
              View Pool
            </Link>
          </article>
        );
      })}
    </div>
  );
}

export default StakingPools;
