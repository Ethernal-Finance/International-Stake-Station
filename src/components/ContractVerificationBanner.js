import React, { useEffect, useState } from 'react';
import ExplorerLink from './ExplorerLink';
import { DEPLOYED_CONTRACTS, checkContractVerification } from '../utils/contractSafety';
import './ContractVerificationBanner.css';

function ContractVerificationBanner() {
  const [isVerified, setIsVerified] = useState(null);
  const { address, explorerUrl } = DEPLOYED_CONTRACTS.factory;

  useEffect(() => {
    checkContractVerification(address).then(({ isVerified: verified }) => {
      setIsVerified(verified);
    });
  }, [address]);

  if (isVerified === null || isVerified) return null;

  return (
    <div className="verification-banner" role="alert">
      <strong>Factory contract source is not verified on Polygonscan.</strong>
      <p>
        Users cannot independently audit the deployed bytecode. Review{' '}
        <a href="https://github.com/Ethernal-Finance/International-Stake-Station/blob/master/docs/CONTRACT_SECURITY.md">
          CONTRACT_SECURITY.md
        </a>{' '}
        before depositing funds.
      </p>
      <ExplorerLink type="address" value={address} label="View Factory on Polygonscan" />
    </div>
  );
}

export default ContractVerificationBanner;
