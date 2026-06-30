import React from 'react';
import PageLayout from '../components/PageLayout';
import ReferralSystem from '../utils/referralsystem/ReferralSystem';

function ReferralPage() {
  return (
    <PageLayout
      title="Referral Program"
      subtitle="Create your referral code and track earnings from referred pools."
    >
      <ReferralSystem />
    </PageLayout>
  );
}

export default ReferralPage;
