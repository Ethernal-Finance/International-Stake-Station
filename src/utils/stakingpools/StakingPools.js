import React from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import TokenAmount from '../../components/TokenAmount';
import TrustWarning from '../../components/TrustWarning';
import ExplorerLink from '../../components/ExplorerLink';
import { usePools } from '../../context/PoolContext';
import { useWeb3 } from '../../context/Web3Context';
import { formatCountdown } from '../../utils/format';
import './StakingPools.css';

function StakingPools() {
  const { web3, isCorrectNetwork } = useWeb3();
  const { pools, countdowns, totalStaked, isLoading, error, fetchPools } = usePools();

  if (!isCorrectNetwork) {
    return (
      <div className="empty-state">
        <p>Switch to Polygon Mainnet to browse available staking pools.</p>
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
        <button type="button" className="secondary-button" onClick={fetchPools}>
          Retry
        </button>
      </div>
    );
  }

  if (!pools.length) {
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
      <TrustWarning compact />
      {pools.map((pool) => {
        const countdown = countdowns[pool.contractAddress];
        return (
          <article className="pool-card" key={pool.contractAddress}>
            <div className="pool-card-header">
              {pool.link ? (
                <img
                  src={pool.link}
                  alt={`${pool.name} logo`}
                  className="pool-logo-image"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="pool-logo-placeholder">{pool.name?.charAt(0) || '?'}</div>
              )}
              <div>
                <h3>{pool.name || 'Unnamed Pool'}</h3>
                <ExplorerLink type="address" value={pool.contractAddress} />
              </div>
            </div>

            <dl className="pool-details">
              <div>
                <dt>Staking Token</dt>
                <dd>
                  <ExplorerLink type="address" value={pool.stakingToken} />
                </dd>
              </div>
              <div>
                <dt>Reward Token</dt>
                <dd>
                  <ExplorerLink type="address" value={pool.rewardToken} />
                </dd>
              </div>
              <div>
                <dt>Total Staked</dt>
                <dd>
                  <TokenAmount
                    web3={web3}
                    tokenAddress={pool.stakingToken}
                    amount={totalStaked[pool.contractAddress] || '0'}
                  />
                </dd>
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
