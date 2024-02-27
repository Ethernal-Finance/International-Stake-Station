import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import FactoryContract from '../Blockchain/Abi/Factory.json';
import ReferralSystem from '../utils/referralsystem/ReferralSystem';

function ReferralPage() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable(); // Request account access
        setWeb3(web3);

        const networkId = await web3.eth.net.getId();
        const networkData = FactoryContract.networks[networkId];
        if (networkData) {
          const contract = new web3.eth.Contract(FactoryContract.abi, networkData.address);
          setContract(contract);
        } else {
          alert('Smart contract not deployed to detected network.');
        }
      }
    };

    loadBlockchainData();
  }, []);
  return (
    <div>
      <h2>Referral Page</h2>
      <ReferralSystem web3={web3} contract={contract}/>
    </div>
  );
}

export default ReferralPage;
