import React, { useCallback, useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { useWeb3 } from '../../context/Web3Context';
import { formatTokenAmount } from '../../utils/format';
import './ReferralSystem.css';

function ReferralSystem() {
  const { account, contract, isConnected, isCorrectNetwork } = useWeb3();
  const { addToast } = useToast();

  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [existingReferralCode, setExistingReferralCode] = useState('');
  const [earnings, setEarnings] = useState('0');
  const [referredNames, setReferredNames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReferralInfo = useCallback(async (userAddress) => {
    if (!contract) return;

    setIsLoading(true);
    try {
      const code = await contract.methods.getReferralCode(userAddress).call();
      setExistingReferralCode(code);

      if (code) {
        const [referralEarnings, names] = await Promise.all([
          contract.methods.getReferralEarnings(code).call(),
          contract.methods.getReferrednames(code).call(),
        ]);
        setEarnings(referralEarnings);
        setReferredNames(names);
      } else {
        setEarnings('0');
        setReferredNames([]);
      }
    } catch (error) {
      addToast(error.message || 'Failed to load referral data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast, contract]);

  useEffect(() => {
    if (account && contract && isCorrectNetwork) {
      fetchReferralInfo(account);
    } else {
      setExistingReferralCode('');
      setEarnings('0');
      setReferredNames([]);
    }
  }, [account, contract, fetchReferralInfo, isCorrectNetwork]);

  const handleCreateReferralCode = async (event) => {
    event.preventDefault();

    if (!isConnected) {
      addToast('Connect your wallet to create a referral code.', 'warning');
      return;
    }

    if (!referralCodeInput.trim()) {
      addToast('Enter a referral code.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await contract.methods.createReferralCode(referralCodeInput.trim()).send({ from: account });
      addToast('Referral code created successfully.', 'success');
      setReferralCodeInput('');
      await fetchReferralInfo(account);
    } catch (error) {
      addToast(error.message || 'Failed to create referral code.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="referral-system">
        <p className="referral-message">Connect your wallet to view or create a referral code.</p>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="referral-system">
        <p className="referral-message">Switch to Polygon Mainnet to use the referral program.</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner label="Loading referral data..." />;
  }

  return (
    <div className="referral-system">
      {existingReferralCode ? (
        <div className="referral-card">
          <h3>Your Referral Code</h3>
          <p className="referral-code">{existingReferralCode}</p>
          <p>Total Earnings: {formatTokenAmount(earnings)} MATIC</p>
          <div>
            <h4>Referred Pools</h4>
            {referredNames.length ? (
              <ul>
                {referredNames.map((poolName) => (
                  <li key={poolName}>{poolName}</li>
                ))}
              </ul>
            ) : (
              <p className="referral-message">No referred pools yet.</p>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreateReferralCode}>
          <label htmlFor="referral-code">Create Referral Code</label>
          <input
            id="referral-code"
            type="text"
            value={referralCodeInput}
            onChange={(event) => setReferralCodeInput(event.target.value)}
            placeholder="Enter a unique referral code"
            disabled={isSubmitting}
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Referral Code'}
          </button>
        </form>
      )}
    </div>
  );
}

export default ReferralSystem;
