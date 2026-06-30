import React from 'react';
import './Toast.css';

function Toast({ message, type, onClose }) {
  return (
    <div className={`toast toast-${type}`} role="status">
      <span>{message}</span>
      <button type="button" className="toast-close" onClick={onClose} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}

export default Toast;
