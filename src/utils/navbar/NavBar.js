import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';

const NAV_ITEMS = [
  { to: '/', label: 'Pools' },
  { to: '/create', label: 'Create Pool' },
  { to: '/referral', label: 'Referrals' },
];

function NavBar() {
  const location = useLocation();

  return (
    <nav className="nav-bar">
      <ul>
        {NAV_ITEMS.map(({ to, label }) => (
          <li key={to}>
            <Link
              className={`nav-link${location.pathname === to ? ' active' : ''}`}
              to={to}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default NavBar;
