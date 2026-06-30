import React from 'react';
import ExplorerLink from './ExplorerLink';
import './Toast.css';

function Toast({ message, type, txHash, onClose }) {
  return (
    <div className={`toast toast-${type}`} role="status">
      <div className="toast-content">
        <span>{message}</span>
        {txHash && (
          <ExplorerLink type="tx" value={txHash} label="View on Polygonscan" className="toast-link" />
        )}
      </div>
      <button type="button" className="toast-close" onClick={onClose} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}

export default Toast;
