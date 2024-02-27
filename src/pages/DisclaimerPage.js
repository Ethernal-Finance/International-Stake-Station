// DisclaimerPage.js
import React from 'react';
import '../App.css'

function DisclaimerPage() {
  return (
    <div className="disclaimer-page">
      <h2>Disclaimer for International Stake Station</h2>
      <p>Last updated {new Date().getMonth()}/{new Date().getDay()}/{new Date().getFullYear()}</p>
      
      <p>The information and services provided by International Stake Station ("we," "us," or "our") on https://modularity.pro and our mobile application are for general informational and educational purposes only. International Stake Station operates on a decentralized network and is not governed by any central authority.</p>
      
      <h3>Decentralization and Autonomy</h3>
      <p>International Stake Station is a decentralized application (dApp) that operates on blockchain technology. This means that it is managed by smart contracts and operates on a peer-to-peer network. As such, International Stake Station does not have the ability to reverse transactions, access users' private keys, or recover lost funds. Users are solely responsible for managing their own private keys and ensuring the security of their wallets.</p>
      
      <h3>Financial Risks</h3>
      <p>The financial services and products provided through International Stake Station, including but not limited to cryptocurrency trading, staking, lending, and borrowing, involve a high level of risk. The value of cryptocurrencies and blockchain assets is volatile and may fluctuate significantly. You should be prepared to lose all the money you invest in these assets.</p>
      
      <p>We do not provide financial advice, and nothing on https://modularity.pro/ or our mobile application should be construed as such. We strongly advise you to conduct your own research and consult with a qualified financial advisor before making any financial decisions.</p>
      
      <h3>No Guarantee</h3>
      <p>We make no guarantees regarding the performance or reliability of International Stake Station's services or the blockchain network. Transactions on the blockchain are irreversible, and we are not responsible for any losses or damages incurred as a result of using International Stake Station.</p>
      
      <h3>Regulatory and Legal Considerations</h3>
      <p>The regulatory status of cryptocurrencies and blockchain technologies is uncertain and may change in the future. It is your responsibility to ensure that your use of International Stake Station complies with all relevant laws and regulations in your jurisdiction.</p>
      
      <h3>External Links Disclaimer</h3>
      <p>International Stake Station may contain links to external websites that are not provided or maintained by or in any way affiliated with us. Please note that we do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.</p>
      
      <h3>Consent</h3>
      <p>By using our website or mobile application, you hereby consent to our disclaimer and agree to its terms.</p>
    </div>
  );
}

export default DisclaimerPage;
