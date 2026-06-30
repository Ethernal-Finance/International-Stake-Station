# International Stake Station — Smart Contracts

Reference Solidity implementations and tests for the ISS staking factory pattern.

## Structure

```
src/
├── StakingFactory.sol    # Factory + referral system
├── StakingRewards.sol    # Per-pool Synthetix-style staking
├── interfaces/IERC20.sol
└── mocks/MockERC20.sol
test/
└── StakingFactory.t.sol
```

## Requirements

- [Foundry](https://book.getfoundry.sh/getting-started/installation)

Install dependencies:

```bash
cd contracts
forge install foundry-rs/forge-std --no-commit
forge test
```

## Commands

```bash
# Run tests
forge test

# Build
forge build

# Gas report
forge test --gas-report
```

## Deployed Addresses

| Network | Factory | Verified |
|---------|---------|----------|
| Polygon (137) | `0x682Ca32c82BCF42F2275068B2f03854E8203D768` | ❌ No |

## Security

See [../docs/CONTRACT_SECURITY.md](../docs/CONTRACT_SECURITY.md) for the full audit report and required actions before mainnet use.

**Important:** Reference contracts are reconstructed from ABIs and bytecode analysis. They are not guaranteed byte-identical to production deployments until the deployer verifies source on Polygonscan.

## Verification (Deployer)

1. Publish exact source used for deployment in this directory
2. Verify on Polygonscan: Contract → Verify and Publish
3. Confirm compiled bytecode hash matches on-chain code
4. Run `forge test` against verified source before any upgrade
