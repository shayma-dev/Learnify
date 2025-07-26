import React from 'react';

export default function Navbar() {
  return (
    <nav style={{ padding: 16, borderBottom: '1px solid #ccc' }}>
      <span style={{ fontWeight: 600, fontSize: 24 }}>Learnify</span>
      {' | '}
      <a href="/">Dashboard</a>
      {' | '}
      <a href="/welcome">Welcome</a>
      {/* add more links later */}
    </nav>
  );
}