import React from 'react';
import PageLayout from '../components/PageLayout';
import CreateStakingRewards from '../utils/createpool/CreateStakingRewards';

function CreatePage() {
  return (
    <PageLayout
      title="Create Staking Pool"
      subtitle="Launch a new rewards pool on Polygon Mainnet."
    >
      <CreateStakingRewards />
    </PageLayout>
  );
}

export default CreatePage;
