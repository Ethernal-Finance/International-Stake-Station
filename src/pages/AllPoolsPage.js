import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import FactoryContract from '../Blockchain/Abi/Factory.json'; // Adjust path as necessary
import StakingPools from '../utils/stakingpools/StakingPools';

function AllPoolsPage() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          setWeb3(web3);

          const networkId = await web3.eth.net.getId();
          const networkData = FactoryContract.networks[networkId];
          if (networkData) {
            const contract = new web3.eth.Contract(FactoryContract.abi, networkData.address);
            setContract(contract);
          } else {
            console.error('Smart contract not deployed to detected network.');
            // Implement a more user-friendly feedback mechanism here
          }
        } catch (error) {
          console.error('Error loading blockchain data:', error);
          // Implement error handling UI feedback
        }
      }
    };

    loadBlockchainData();
  }, []);

  return (
    <div>
      <h2>Staking Pools</h2>
      <StakingPools web3={web3} contract={contract}/>
    </div>
  );
}

export default AllPoolsPage;
