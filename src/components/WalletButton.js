import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { truncateAddress } from '../utils/format';
import './WalletButton.css';

function WalletButton() {
  const { account, isConnecting, hasMetaMask, isConnected, connectWallet } = useWeb3();

  if (!hasMetaMask) {
    return (
      <a
        className="wallet-button wallet-button-disabled"
        href="https://metamask.io/download/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Install MetaMask
      </a>
    );
  }

  return (
    <button
      type="button"
      className="wallet-button"
      onClick={connectWallet}
      disabled={isConnecting || isConnected}
    >
      {isConnecting ? 'Connecting...' : isConnected ? truncateAddress(account) : 'Connect Wallet'}
    </button>
  );
}

export default WalletButton;
