import React from 'react';
import './PageLayout.css';

function PageLayout({ title, subtitle, children }) {
  return (
    <section className="page-layout">
      {title && <h2 className="page-title">{title}</h2>}
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
      {children}
    </section>
  );
}

export default PageLayout;
