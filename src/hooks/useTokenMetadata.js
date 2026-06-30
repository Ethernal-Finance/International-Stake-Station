import { useEffect, useState } from 'react';
import { getTokenMetadata } from '../utils/token';

export function useTokenMetadata(web3, tokenAddress) {
  const [metadata, setMetadata] = useState({ decimals: 18, symbol: 'TOKEN', loading: Boolean(tokenAddress) });

  useEffect(() => {
    if (!web3 || !tokenAddress) {
      setMetadata({ decimals: 18, symbol: 'TOKEN', loading: false });
      return;
    }

    let cancelled = false;
    setMetadata((current) => ({ ...current, loading: true }));

    getTokenMetadata(web3, tokenAddress).then((result) => {
      if (!cancelled) {
        setMetadata({ ...result, loading: false });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [web3, tokenAddress]);

  return metadata;
}
