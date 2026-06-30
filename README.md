# International Stake Station

A production-ready Web3 staking dApp for browsing, creating, and interacting with staking pools on **Polygon Mainnet**.

Built with React, web3.js, and MetaMask.

## Features

- **Browse Pools** — View all active staking pools with countdown timers and token details
- **Stake & Earn** — Stake tokens, withdraw, and claim rewards with correct token decimals
- **Pool Safety Warnings** — Unverified pool alerts with Polygonscan contract links
- **Transaction Tracking** — Toast notifications link directly to Polygonscan
- **Create Pools** — Launch new staking reward pools with optional referral codes
- **Referral Program** — Create referral codes and track earnings from referred pools
- **Wallet Integration** — Connect MetaMask with network detection and switching
- **Transaction Feedback** — Toast notifications for wallet and on-chain actions

## Network

| Property | Value |
|----------|-------|
| Chain | Polygon Mainnet |
| Chain ID | 137 |
| Factory Contract | `0x682Ca32c82BCF42F2275068B2f03854E8203D768` |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [MetaMask](https://metamask.io/) browser extension
- Polygon Mainnet configured in MetaMask

### Install

```bash
npm install
```

### Development

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
```

### Tests

```bash
npm test
```

## Project Structure

```
src/
├── components/       # Shared UI (wallet button, toasts, loading)
├── context/          # Web3 and toast providers
├── pages/            # Route-level pages
├── utils/            # Feature modules (pools, referrals, create)
├── constants/        # Network configuration
└── Blockchain/Abi/   # Smart contract ABIs
```

## Usage

1. Connect your MetaMask wallet using the button in the header
2. Switch to Polygon Mainnet if prompted
3. Browse pools on the home page and click **View Pool** to stake
4. Use **Create Pool** to deploy a new staking rewards contract
5. Use **Referrals** to create a referral code and track earnings

## Smart Contracts

Reference implementations and security review live in:

- [`contracts/`](contracts/) — Foundry project with Factory + StakingRewards source and tests
- [`docs/CONTRACT_SECURITY.md`](docs/CONTRACT_SECURITY.md) — Full security audit and required actions

**⚠️ The deployed Factory on Polygon is currently unverified on Polygonscan.** Run `forge test` in `contracts/` to validate the reference implementation.

```bash
cd contracts && forge test
```

## Disclaimer

This application interacts with smart contracts on a public blockchain. Use at your own risk.
See the in-app [Disclaimer](/disclaimer) page for full terms.

## License

Private — © Modularity
