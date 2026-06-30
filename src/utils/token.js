import IERC20Abi from '../Blockchain/Abi/IERC20.json';

const METADATA_ABI = [
  ...IERC20Abi.abi,
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
];

const metadataCache = new Map();

const DEFAULT_METADATA = { decimals: 18, symbol: 'TOKEN' };

export async function getTokenMetadata(web3, tokenAddress) {
  if (!web3 || !tokenAddress) return DEFAULT_METADATA;

  const cacheKey = tokenAddress.toLowerCase();
  if (metadataCache.has(cacheKey)) {
    return metadataCache.get(cacheKey);
  }

  try {
    const contract = new web3.eth.Contract(METADATA_ABI, tokenAddress);
    const [decimals, symbol] = await Promise.all([
      contract.methods.decimals().call().catch(() => 18),
      contract.methods.symbol().call().catch(() => 'TOKEN'),
    ]);

    const metadata = {
      decimals: Number(decimals),
      symbol: symbol || 'TOKEN',
    };
    metadataCache.set(cacheKey, metadata);
    return metadata;
  } catch {
    return DEFAULT_METADATA;
  }
}

export async function getTokenMetadataBatch(web3, addresses) {
  const unique = [...new Set(addresses.filter(Boolean).map((a) => a.toLowerCase()))];
  const results = await Promise.all(
    unique.map((address) => getTokenMetadata(web3, address))
  );
  return Object.fromEntries(unique.map((address, index) => [address, results[index]]));
}

export function clearTokenMetadataCache() {
  metadataCache.clear();
}
