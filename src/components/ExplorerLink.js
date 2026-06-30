import React from 'react';
import { getAddressUrl, getTxUrl } from '../utils/explorer';
import { truncateAddress } from '../utils/format';
import './ExplorerLink.css';

function ExplorerLink({ type = 'address', value, label, className = '' }) {
  if (!value) return null;

  const href = type === 'tx' ? getTxUrl(value) : getAddressUrl(value);
  const text = label || (type === 'tx' ? 'View transaction' : truncateAddress(value, 6));

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`explorer-link ${className}`.trim()}
    >
      {text}
    </a>
  );
}

export default ExplorerLink;
