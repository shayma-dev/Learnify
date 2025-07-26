import React from 'react';

export default function Welcome() {
  return (
    <div style={{ padding: 32 }}>
      <h1>Welcome to Learnify!</h1>
      <p>Your beginner-friendly student productivity app.</p>
      <a href="/dashboard">
        <button>Get Started</button>
      </a>
    </div>
  );
}