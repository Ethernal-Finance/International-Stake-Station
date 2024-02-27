import React, { useState, useEffect } from 'react';
import './ReferralSystem.css';


function ReferralSystem({ web3, contract }) {
  const [referralCode, setReferralCode] = useState('');
  const [_referralCode, set_ReferralCode] = useState('');
  const [earnings, setEarnings] = useState('');
  const [referredNames, setReferredNames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAccountAndReferralInfo = async () => {
      setIsLoading(true);
      setError('');
      try {
        if (web3 && contract) {
          const accounts = await web3.eth.getAccounts();
          if (accounts.length > 0) {
            const userAddress = accounts[0];
            await handleFetchReferralCode(userAddress);
          }
        } else {
          console.error("Web3 or contract not initialized.");
          setError("Web3 or contract not initialized.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountAndReferralInfo();
  }, [web3, contract]);

  const handleCreateReferralCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (!contract) {
        throw new Error("Contract is not initialized.");
      }
      const accounts = await web3.eth.getAccounts();
      await contract.methods.createReferralCode(referralCode).send({ from: accounts[0] });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchReferralCode = async (userAddress) => {
    if (!contract) {
      console.error("Contract is not initialized.");
      return;
    }
    const code = await contract.methods.getReferralCode(userAddress).call();
    set_ReferralCode(code);
    handleFetchEarnings(code);
    handleFetchReferredNames(code);
  };

  const handleFetchEarnings = async (code) => {
    if (!contract) {
      console.error("Contract is not initialized.");
      return;
    }
    const earnings = await contract.methods.getReferralEarnings(code).call();
    setEarnings(earnings);
  };

  const handleFetchReferredNames = async (code) => {
    if (!contract) {
      console.error("Contract is not initialized.");
      return;
    }
    const names = await contract.methods.getReferrednames(code).call();
    setReferredNames(names);
  };

  return (
    <div className="referral-system">
      
      {error && <p className="error">{error}</p>}
      {_referralCode ? (
        <div>
          <p>Your Referral Code: {_referralCode}</p>
        </div>
      ) : (
        <form onSubmit={handleCreateReferralCode}>
          <input
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            placeholder="Enter referral code"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>Create Referral Code</button>
        </form>
      )}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <p>Earnings: {earnings}</p>
          <p>Referred Names: {referredNames.join(', ')}</p>
        </div>
      )}
    </div>
  );
}

export default ReferralSystem;
