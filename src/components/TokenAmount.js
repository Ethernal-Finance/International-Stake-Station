import React from 'react';
import { useTokenMetadata } from '../hooks/useTokenMetadata';
import { formatTokenAmount } from '../utils/format';

function TokenAmount({ web3, tokenAddress, amount, loadingLabel = '...' }) {
  const { decimals, symbol, loading } = useTokenMetadata(web3, tokenAddress);

  if (loading) {
    return <span>{loadingLabel}</span>;
  }

  return (
    <span>
      {formatTokenAmount(amount, decimals)} {symbol}
    </span>
  );
}

export default TokenAmount;
