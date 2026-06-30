import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { NETWORK_CONFIG } from '../constants/network';
import './NetworkBanner.css';

function NetworkBanner() {
  const { isConnected, isCorrectNetwork, switchNetwork } = useWeb3();

  if (!isConnected || isCorrectNetwork) return null;

  return (
    <div className="network-banner">
      <span>
        Wrong network detected. Switch to {NETWORK_CONFIG.chainName} to use International Stake Station.
      </span>
      <button type="button" onClick={switchNetwork}>
        Switch Network
      </button>
    </div>
  );
}

export default NetworkBanner;
