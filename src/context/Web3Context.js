import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Web3 from 'web3';
import FactoryContract from '../Blockchain/Abi/Factory.json';
import { NETWORK_CONFIG, SUPPORTED_CHAIN_ID } from '../constants/network';
import { useToast } from './ToastContext';

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const { addToast } = useToast();
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasMetaMask, setHasMetaMask] = useState(false);

  const isCorrectNetwork = networkId === SUPPORTED_CHAIN_ID;

  const loadContract = useCallback((instance, chainId) => {
    const networkData = FactoryContract.networks[chainId];
    if (networkData) {
      setContract(new instance.eth.Contract(FactoryContract.abi, networkData.address));
    } else {
      setContract(null);
    }
  }, []);

  const refreshAccount = useCallback(async (instance) => {
    const accounts = await instance.eth.getAccounts();
    setAccount(accounts[0] || null);
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      addToast('MetaMask is required to use this app.', 'error');
      return;
    }

    setIsConnecting(true);
    try {
      const instance = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = Number(await instance.eth.getId());

      setWeb3(instance);
      setAccount(accounts[0] || null);
      setNetworkId(chainId);
      loadContract(instance, chainId);

      if (chainId !== SUPPORTED_CHAIN_ID) {
        addToast('Please switch to Polygon Mainnet to interact with staking pools.', 'warning');
      } else {
        addToast('Wallet connected successfully.', 'success');
      }
    } catch (error) {
      addToast(error.message || 'Failed to connect wallet.', 'error');
    } finally {
      setIsConnecting(false);
    }
  }, [addToast, loadContract]);

  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_CONFIG.chainIdHex }],
      });
    } catch (error) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [NETWORK_CONFIG],
        });
      } else {
        addToast(error.message || 'Failed to switch network.', 'error');
      }
    }
  }, [addToast]);

  useEffect(() => {
    setHasMetaMask(Boolean(window.ethereum));

    if (!window.ethereum) return undefined;

    const handleAccountsChanged = (accounts) => {
      setAccount(accounts[0] || null);
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    const init = async () => {
      const instance = new Web3(window.ethereum);
      const chainId = Number(await instance.eth.getId());
      setWeb3(instance);
      setNetworkId(chainId);
      loadContract(instance, chainId);
      await refreshAccount(instance);
    };

    init().catch(() => {});

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [loadContract, refreshAccount]);

  const value = useMemo(
    () => ({
      web3,
      account,
      contract,
      networkId,
      isConnecting,
      hasMetaMask,
      isConnected: Boolean(account),
      isCorrectNetwork,
      connectWallet,
      switchNetwork,
    }),
    [web3, account, contract, networkId, isConnecting, hasMetaMask, isCorrectNetwork, connectWallet, switchNetwork]
  );

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
}
