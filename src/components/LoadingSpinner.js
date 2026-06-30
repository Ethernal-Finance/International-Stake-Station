import React from 'react';
import './LoadingSpinner.css';

function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="loading-spinner" role="status">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  );
}

export default LoadingSpinner;
