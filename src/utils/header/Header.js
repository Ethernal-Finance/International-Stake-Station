import React from 'react';
import WalletButton from '../../components/WalletButton';
import logo from './assets/logo512.png';
import './Header.css';

function Header() {
  return (
    <header className="app-header">
      <div className="header-brand">
        <img src={logo} alt="International Stake Station logo" className="app-logo" />
        <h1 className="app-title">International Stake Station</h1>
      </div>
      <WalletButton />
    </header>
  );
}

export default Header;
