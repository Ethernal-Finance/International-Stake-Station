// FooterNavbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './FooterNavBar.css'; 

function FooterNavbar() {

    

  return (
    <div className="footer-navbar">
      <li><Link className="nav-link" to="/">Home</Link></li>
      <Link to="/disclaimer">Disclaimer</Link>
      <a href="https://Modularity.pro" target="_blank" rel="noopener noreferrer">Modularity</a>
      
    </div>
  );
}

export default FooterNavbar;
