// NavBar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css'; // Make sure the path is correct

function NavBar() {
  return (
    <nav className="nav-bar"> {/* Updated to use nav-bar class */}
      <ul>
        {/* Added nav-link class to each Link component */}
        <li><Link className="nav-link" to="/">Home</Link></li>
        <li><Link className="nav-link" to="/create">Create Pool</Link></li>
        <li><Link className="nav-link" to="/referral">Referral</Link></li>
      </ul>
    </nav>
  );
}

export default NavBar;
