import React from 'react';
import PageLayout from '../components/PageLayout';
import { formatDate } from '../utils/format';
import '../App.css';

function DisclaimerPage() {
  return (
    <PageLayout title="Disclaimer">
      <div className="disclaimer-page">
        <p>Last updated {formatDate()}</p>

        <p>
          The information and services provided by International Stake Station on this application
          are for general informational and educational purposes only. International Stake Station
          operates on a decentralized network and is not governed by any central authority.
        </p>

        <h3>Decentralization and Autonomy</h3>
        <p>
          International Stake Station is a decentralized application (dApp) that operates on
          blockchain technology through smart contracts on a peer-to-peer network. We cannot reverse
          transactions, access private keys, or recover lost funds. Users are solely responsible for
          securing their wallets.
        </p>

        <h3>Financial Risks</h3>
        <p>
          Staking, token transfers, and other DeFi activities involve significant risk. Cryptocurrency
          values are volatile and you may lose some or all of your funds. Nothing in this application
          constitutes financial advice.
        </p>

        <h3>No Guarantee</h3>
        <p>
          We make no guarantees regarding the performance or reliability of the platform or underlying
          blockchain network. On-chain transactions are irreversible.
        </p>

        <h3>Regulatory and Legal Considerations</h3>
        <p>
          Cryptocurrency regulations vary by jurisdiction. You are responsible for ensuring your use
          of this application complies with applicable laws.
        </p>

        <h3>Consent</h3>
        <p>By using International Stake Station, you consent to this disclaimer and agree to its terms.</p>
      </div>
    </PageLayout>
  );
}

export default DisclaimerPage;
