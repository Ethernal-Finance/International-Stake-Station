import FactoryAbi from '../Blockchain/Abi/Factory.json';
import StakingAbi from '../Blockchain/Abi/Staking.json';
import IERC20Abi from '../Blockchain/Abi/IERC20.json';
import { EXPLORER_URL, SUPPORTED_CHAIN_ID } from '../constants/network';

export const FACTORY_ADDRESS = FactoryAbi.networks[SUPPORTED_CHAIN_ID]?.address;

export const DEPLOYED_CONTRACTS = {
  factory: {
    address: FACTORY_ADDRESS,
    chainId: SUPPORTED_CHAIN_ID,
    verified: false,
    explorerUrl: `${EXPLORER_URL}/address/${FACTORY_ADDRESS}`,
  },
};

export async function checkContractVerification(address) {
  try {
    const response = await fetch(`${EXPLORER_URL}/address/${address}#code`);
    const html = await response.text();
    const isVerified = /Contract Source Code Verified/i.test(html);
    return { address, isVerified };
  } catch {
    return { address, isVerified: false, error: 'Unable to check verification status' };
  }
}

export async function validatePoolSafety(web3, factoryContract, poolAddress, account) {
  const warnings = [];
  const blockers = [];

  if (!web3.utils.isAddress(poolAddress)) {
    blockers.push('Invalid pool address.');
    return { warnings, blockers, canInteract: false };
  }

  const isRegistered = await factoryContract.methods.isStakingRewards(poolAddress).call();
  if (!isRegistered) {
    blockers.push('This address is not a pool registered with the official Factory.');
    return { warnings, blockers, canInteract: false };
  }

  const code = await web3.eth.getCode(poolAddress);
  if (code === '0x' || code === '0x0') {
    blockers.push('No contract code found at this address.');
    return { warnings, blockers, canInteract: false };
  }

  warnings.push('Pool source code is not verified on Polygonscan. Only stake tokens you can afford to lose.');
  warnings.push('Pools are created by third parties. Verify staking and reward token contracts independently.');

  try {
    const stakingContract = new web3.eth.Contract(StakingAbi.abi, poolAddress);
    const [stakingToken, rewardToken] = await Promise.all([
      stakingContract.methods.stakingToken().call(),
      stakingContract.methods.rewardsToken().call(),
    ]);

    if (stakingToken.toLowerCase() === rewardToken.toLowerCase()) {
      warnings.push('Staking and reward token are the same address. Confirm this is intentional.');
    }

    for (const tokenAddress of [stakingToken, rewardToken]) {
      const tokenCode = await web3.eth.getCode(tokenAddress);
      if (tokenCode === '0x' || tokenCode === '0x0') {
        blockers.push(`Token ${tokenAddress} is not a contract.`);
      }
    }

    if (account) {
      const tokenContract = new web3.eth.Contract(IERC20Abi.abi, rewardToken);
      const rewardBalance = await tokenContract.methods.balanceOf(poolAddress).call();
      if (BigInt(rewardBalance || '0') === 0n) {
        warnings.push('This pool currently holds no reward tokens. Claims may fail until the owner funds rewards.');
      }
    }
  } catch {
    warnings.push('Unable to fully validate pool token configuration.');
  }

  return { warnings, blockers, canInteract: blockers.length === 0 };
}

export async function validateCreatePoolInputs(web3, stakingToken, rewardToken) {
  const blockers = [];

  if (!web3.utils.isAddress(stakingToken) || !web3.utils.isAddress(rewardToken)) {
    blockers.push('Enter valid token contract addresses.');
    return blockers;
  }

  if (stakingToken.toLowerCase() === rewardToken.toLowerCase()) {
    blockers.push('Staking and reward tokens must be different addresses.');
  }

  for (const [label, address] of [['Staking', stakingToken], ['Reward', rewardToken]]) {
    const code = await web3.eth.getCode(address);
    if (code === '0x' || code === '0x0') {
      blockers.push(`${label} token is not a contract on this network.`);
    }
  }

  return blockers;
}
