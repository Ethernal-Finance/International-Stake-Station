// Header.js
import React from 'react';
import logo from '../header/assets/logo512.png'
import './Header.css'; 

function Header() {
  return (
    <header className="app-header">
      <img src={logo} alt="App Logo" className="app-logo" />
      <h1 className="app-title">International Stake Station</h1>
    </header>
  );
}

export default Header;
