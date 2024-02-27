import React, { useState, useEffect } from 'react';
import './StakingPools.css'

function StakingPools({ web3, contract }) {
    const [stakingPools, setStakingPools] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchStakingPools = async () => {
            setIsLoading(true);
            try {
                // Hypothetical function to get the number of staking pools
                const poolCount = await contract.methods.getStakingRewardsCount().call();
                const pools = [];
                for (let i = 0; i < poolCount; i++) {
                    const pool = await contract.methods.allStakingRewards(i).call();
                    pools.push(pool);
                }
                setStakingPools(pools);
            } catch (error) {
                console.error('Failed to fetch staking pools:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (web3 && contract) {
            fetchStakingPools();
        }
    }, [web3, contract]);

    if (isLoading) {
        return <div>Loading staking pools...</div>;
    }

    return (

        <div className='staking-pools-container'>
        {stakingPools.length ? (
            stakingPools.map((pool, index) => (
                <div className="pool-row" key={index}>
                    <div className="pool-cell">
                        <p>{pool.name}</p>
                    </div>
                    <div className="pool-cell pool-logo">
                        <img src={pool.link} alt={`${pool.name} logo`} />
                    </div>
                    <div className="pool-cell">
                        <p>{pool.stakingToken}</p>
                    </div>
                </div>
            ))
        ) : (
            <p>No staking pools available.</p>
        )}
    </div>
    );
}

export default StakingPools;
