import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import StakingAbi from '../Blockchain/Abi/Staking.json';
import { useWeb3 } from './Web3Context';

const PoolContext = createContext(null);

export function PoolProvider({ children }) {
  const { web3, contract } = useWeb3();
  const [pools, setPools] = useState([]);
  const [countdowns, setCountdowns] = useState({});
  const [totalStaked, setTotalStaked] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const poolIndexRef = useRef(new Map());

  const fetchPools = useCallback(async () => {
    if (!contract) {
      setPools([]);
      setCountdowns({});
      setTotalStaked({});
      poolIndexRef.current = new Map();
      return { pools: [], countdowns: {}, totalStaked: {}, index: new Map() };
    }

    setIsLoading(true);
    setError('');

    try {
      const poolCount = Number(await contract.methods.getStakingRewardsCount().call());

      const poolResults = await Promise.all(
        Array.from({ length: poolCount }, (_, index) =>
          contract.methods.allStakingRewards(index).call()
        )
      );

      const [countdownResults, totalSupplyResults] = await Promise.all([
        Promise.all(
          poolResults.map((pool) =>
            contract.methods
              .getStakingRewardsCountdown(pool.contractAddress)
              .call()
              .catch(() => null)
          )
        ),
        Promise.all(
          poolResults.map((pool) => {
            if (!web3) return '0';
            const stakingContract = new web3.eth.Contract(StakingAbi.abi, pool.contractAddress);
            return stakingContract.methods.totalSupply().call().catch(() => '0');
          })
        ),
      ]);

      const index = new Map();
      const nextCountdowns = {};
      const nextTotalStaked = {};

      poolResults.forEach((pool, poolIndex) => {
        index.set(pool.contractAddress.toLowerCase(), pool);
        nextCountdowns[pool.contractAddress] = countdownResults[poolIndex];
        nextTotalStaked[pool.contractAddress] = totalSupplyResults[poolIndex];
      });

      poolIndexRef.current = index;
      setPools(poolResults);
      setCountdowns(nextCountdowns);
      setTotalStaked(nextTotalStaked);

      return {
        pools: poolResults,
        countdowns: nextCountdowns,
        totalStaked: nextTotalStaked,
        index,
      };
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to fetch staking pools.');
      return { pools: [], countdowns: {}, totalStaked: {}, index: new Map() };
    } finally {
      setIsLoading(false);
    }
  }, [contract, web3]);

  const resolvePool = useCallback(
    async (address) => {
      if (!address || !contract) return null;

      const normalized = address.toLowerCase();
      if (poolIndexRef.current.has(normalized)) {
        return poolIndexRef.current.get(normalized);
      }

      const isRegistered = await contract.methods.isStakingRewards(address).call();
      if (!isRegistered) return null;

      const { index } = await fetchPools();
      return index.get(normalized) || null;
    },
    [contract, fetchPools]
  );

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  const value = useMemo(
    () => ({
      pools,
      countdowns,
      totalStaked,
      isLoading,
      error,
      fetchPools,
      resolvePool,
      getPoolFromCache: (address) => poolIndexRef.current.get(address?.toLowerCase()) || null,
    }),
    [pools, countdowns, totalStaked, isLoading, error, fetchPools, resolvePool]
  );

  return <PoolContext.Provider value={value}>{children}</PoolContext.Provider>;
}

export function usePools() {
  const context = useContext(PoolContext);
  if (!context) {
    throw new Error('usePools must be used within PoolProvider');
  }
  return context;
}
