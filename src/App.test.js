import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./context/Web3Context', () => ({
  Web3Provider: ({ children }) => children,
  useWeb3: () => ({
    web3: null,
    account: null,
    contract: null,
    networkId: null,
    isConnecting: false,
    hasMetaMask: false,
    isConnected: false,
    isCorrectNetwork: false,
    connectWallet: jest.fn(),
    switchNetwork: jest.fn(),
  }),
}));

jest.mock('./context/PoolContext', () => ({
  PoolProvider: ({ children }) => children,
  usePools: () => ({
    pools: [],
    countdowns: {},
    totalStaked: {},
    isLoading: false,
    error: '',
    fetchPools: jest.fn(),
    resolvePool: jest.fn(),
    getPoolFromCache: jest.fn(),
  }),
}));

test('renders International Stake Station branding', () => {
  render(<App />);
  expect(screen.getByText(/International Stake Station/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Staking Pools/i })).toBeInTheDocument();
});
