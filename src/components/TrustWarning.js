import React from 'react';
import ExplorerLink from './ExplorerLink';
import './TrustWarning.css';

function TrustWarning({ poolAddress, compact = false }) {
  return (
    <div className={`trust-warning${compact ? ' trust-warning-compact' : ''}`} role="alert">
      <strong>Unverified user-created pool.</strong>
      {!compact && (
        <p>
          Pools are deployed by third parties without review. Verify token contracts, check reward
          funding, and inspect the smart contract before staking any assets.
        </p>
      )}
      {poolAddress && (
        <ExplorerLink
          type="address"
          value={poolAddress}
          label="View pool on Polygonscan"
          className="explorer-link-inline"
        />
      )}
    </div>
  );
}

export default TrustWarning;
