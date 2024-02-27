import React, { useState } from 'react';
import './CreateStakingRewards.css';

function CreateStakingRewards({ web3, contract }) {
  const [stakingToken, setStakingToken] = useState('');
  const [rewardToken, setRewardToken] = useState('');
  const [rewardTransferFee, setRewardTransferFee] = useState('');
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [referralCode, setReferralCode] = useState('');

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const accounts = await web3.eth.getAccounts(); // Make sure you've requested access to accounts
      const feeInWei = web3.utils.toWei(rewardTransferFee, 'ether'); // Convert fee to Wei if necessary
  
      await contract.methods.createStakingRewards(stakingToken, rewardToken, feeInWei, name, link, referralCode)
        .send({ from: accounts[0] });
        // Handle additional logic like resetting the form or notifying the user of success
    } catch (error) {
      console.error("Error creating staking rewards:", error);
      // Handle errors, for example, show an error message to the user
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <input className="input-field" type="text" placeholder="Staking Token Address" value={stakingToken} onChange={e => setStakingToken(e.target.value)} />
      <input className="input-field" type="text" placeholder="Reward Token Address" value={rewardToken} onChange={e => setRewardToken(e.target.value)} />
      <input className="input-field" type="number" placeholder="Reward Transfer Fee" value={rewardTransferFee} onChange={e => setRewardTransferFee(e.target.value)} />
      <input className="input-field" type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input className="input-field" type="text" placeholder="Link" value={link} onChange={e => setLink(e.target.value)} />
      <input className="input-field" type="text" placeholder="Referral Code" value={referralCode} onChange={e => setReferralCode(e.target.value)} />
      <button className="submit-button" type="submit">Create Staking Rewards</button>
    </form>
  );
}

export default CreateStakingRewards;
