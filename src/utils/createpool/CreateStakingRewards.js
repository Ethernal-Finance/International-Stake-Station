import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useToast } from '../../context/ToastContext';
import { formatTokenAmount } from '../../utils/format';
import './CreateStakingRewards.css';

function CreateStakingRewards() {
  const { web3, account, contract, isConnected, isCorrectNetwork } = useWeb3();
  const { addToast } = useToast();

  const [stakingToken, setStakingToken] = useState('');
  const [rewardToken, setRewardToken] = useState('');
  const [rewardTransferFee, setRewardTransferFee] = useState('');
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [requiredPayment, setRequiredPayment] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRequiredPayment = async () => {
      if (!contract) return;
      try {
        const amount = await contract.methods.requiredPaymentAmount().call();
        setRequiredPayment(amount);
      } catch {
        setRequiredPayment('0');
      }
    };

    fetchRequiredPayment();
  }, [contract]);

  const resetForm = () => {
    setStakingToken('');
    setRewardToken('');
    setRewardTransferFee('');
    setName('');
    setLink('');
    setReferralCode('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isConnected) {
      addToast('Connect your wallet before creating a pool.', 'warning');
      return;
    }

    if (!isCorrectNetwork) {
      addToast('Switch to Polygon Mainnet to create a pool.', 'warning');
      return;
    }

    if (!web3.utils.isAddress(stakingToken) || !web3.utils.isAddress(rewardToken)) {
      addToast('Enter valid token contract addresses.', 'error');
      return;
    }

    if (!name.trim()) {
      addToast('Pool name is required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const feeInWei = web3.utils.toWei(rewardTransferFee || '0', 'ether');
      const receipt = await contract.methods
        .createStakingRewards(stakingToken, rewardToken, feeInWei, name.trim(), link.trim(), referralCode.trim())
        .send({ from: account, value: requiredPayment });

      addToast('Staking pool created successfully.', 'success', { txHash: receipt.transactionHash });
      resetForm();
    } catch (error) {
      addToast(error.message || 'Failed to create staking pool.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {!isConnected && (
        <p className="form-note">Connect your wallet to create a new staking pool.</p>
      )}
      {isConnected && !isCorrectNetwork && (
        <p className="form-note warning">Switch to Polygon Mainnet to create a pool.</p>
      )}
      {requiredPayment !== '0' && (
        <p className="form-note">
          Creation fee: {formatTokenAmount(requiredPayment)} MATIC
        </p>
      )}

      <input
        className="input-field"
        type="text"
        placeholder="Staking Token Address"
        value={stakingToken}
        onChange={(event) => setStakingToken(event.target.value)}
        disabled={isSubmitting}
      />
      <input
        className="input-field"
        type="text"
        placeholder="Reward Token Address"
        value={rewardToken}
        onChange={(event) => setRewardToken(event.target.value)}
        disabled={isSubmitting}
      />
      <input
        className="input-field"
        type="number"
        min="0"
        step="any"
        placeholder="Reward Transfer Fee (MATIC)"
        value={rewardTransferFee}
        onChange={(event) => setRewardTransferFee(event.target.value)}
        disabled={isSubmitting}
      />
      <input
        className="input-field"
        type="text"
        placeholder="Pool Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        disabled={isSubmitting}
      />
      <input
        className="input-field"
        type="url"
        placeholder="Logo URL"
        value={link}
        onChange={(event) => setLink(event.target.value)}
        disabled={isSubmitting}
      />
      <input
        className="input-field"
        type="text"
        placeholder="Referral Code (optional)"
        value={referralCode}
        onChange={(event) => setReferralCode(event.target.value)}
        disabled={isSubmitting}
      />
      <button className="submit-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating Pool...' : 'Create Staking Pool'}
      </button>
    </form>
  );
}

export default CreateStakingRewards;
