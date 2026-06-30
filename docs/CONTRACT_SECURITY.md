# Contract Security Review — International Stake Station

**Review date:** June 30, 2026  
**Polygon Factory:** `0x682Ca32c82BCF42F2275068B2f03854E8203D768`  
**Status:** ⚠️ **NOT VERIFIED on Polygonscan**

---

## Executive Summary

The deployed Factory contract on Polygon **does not have verified source code** on Polygonscan. Users and developers cannot independently confirm that on-chain bytecode matches intended behavior.

This repository now includes:

- **Reference Solidity implementations** in `contracts/src/` (ABI-compatible)
- **Foundry test suite** covering core flows and access control
- **Frontend safety checks** before users stake or create pools

**Recommendation:** Do not promote this as fully audited for production until the deployer verifies source on Polygonscan and completes a third-party audit.

---

## On-Chain Findings (Bytecode Analysis)

From embedded revert strings in deployed bytecode:

| Finding | Severity | Detail |
|---------|----------|--------|
| Unverified source | **Critical** | No public Solidity source; users trust bytecode blindly |
| Permissionless pool creation | **High** | Anyone can deploy pools with arbitrary token addresses |
| Centralized admin controls | **High** | Admins can update fees, referral %, withdraw MATIC |
| Pool owner privileges | **High** | Owners can `changeOwner`, `destroy`, `withdrawERC20`, `withdrawETH` |
| Reward transfer fee | **Medium** | Pool owners set fee deducted on `getReward()` |
| `withdrawBNB` naming | **Low** | Native withdrawal function misnamed (BSC legacy) |
| SafeMath on Solidity 0.8 | **Info** | Redundant; suggests older template code |
| ReentrancyGuard present | **Positive** | Staking contract includes reentrancy protection |

---

## Architecture

```
StakingFactory (singleton on Polygon)
  ├── createStakingRewards() → deploys new StakingRewards via CREATE
  ├── Referral system (codes, earnings in native MATIC)
  └── Admin / moderator roles

StakingRewards (one per pool)
  ├── Synthetix-style reward accounting
  ├── stake / withdraw / getReward
  ├── notifyRewardAmount (owner funds rewards)
  └── Owner rescue: withdrawERC20, withdrawETH, destroy
```

---

## User Risks

1. **Malicious pools** — Scammers can create pools with worthless "reward" tokens or honeypot staking tokens.
2. **Underfunded rewards** — Pool owner may never call `notifyRewardAmount`; stakers earn nothing.
3. **Owner rug** — Pool owner can drain leftover reward tokens via `withdrawERC20` after period ends.
4. **Fee skimming** — `rewardTransferFee` sends portion of claims to pool owner.
5. **No pause mechanism** — Users cannot exit via emergency pause if exploit is found.

---

## Reference Implementation Tests

Run from `contracts/`:

```bash
forge test
```

Tests cover:

- Pool registration and referral payouts
- Full stake → earn → claim → withdraw flow
- Access control on pool metadata changes
- Destroy blocked while stake remains
- Fuzz: referral payout never exceeds creation payment

---

## Required Actions Before Mainnet Promotion

### Deployer / Protocol team

- [ ] **Verify Factory source** on [Polygonscan](https://polygonscan.com/address/0x682Ca32c82BCF42F2275068B2f03854E8203D768#code)
- [ ] **Verify StakingRewards template** (or publish creation bytecode match)
- [ ] Commission **third-party audit** (Cyfrin, OpenZeppelin, Trail of Bits, etc.)
- [ ] Publish **deployment addresses** and constructor args for all chains
- [ ] Consider **timelock** on admin functions
- [ ] Add **pool allowlist** or curation for official frontend

### Frontend (implemented in this repo)

- [x] Unverified pool warnings
- [x] Factory registry check (`isStakingRewards`) before interactions
- [x] Token contract code-existence checks
- [x] Polygonscan links on all contracts and transactions

---

## Verification Command

Once source is published, confirm ABI match:

```bash
cd contracts
forge build
# Compare compiled bytecode metadata against Polygonscan verified contract
```

---

## Disclaimer

The reference contracts in `contracts/src/` are reconstructed from ABIs and bytecode strings. They are **not guaranteed to be byte-identical** to the deployed contracts. Only verified source from the original deployer constitutes ground truth.
