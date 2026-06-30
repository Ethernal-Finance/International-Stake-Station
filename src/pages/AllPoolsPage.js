import React from 'react';
import PageLayout from '../components/PageLayout';
import StakingPools from '../utils/stakingpools/StakingPools';

function AllPoolsPage() {
  return (
    <PageLayout
      title="Staking Pools"
      subtitle="Browse active pools on Polygon and start earning rewards."
    >
      <StakingPools />
    </PageLayout>
  );
}

export default AllPoolsPage;
