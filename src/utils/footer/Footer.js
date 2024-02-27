// Footer.js
import React from 'react';
import './Footer.css'; // Assuming you'll create a CSS file for styling
import FooterNavBar from '../footernavbar/FooterNavBar';

function Footer() {
  return (
    <footer className="app-footer">
        <FooterNavBar />
      <p>&copy; {new Date().getFullYear()} Modularity. All rights reserved.</p>
      
    </footer>
  );
}

export default Footer;
