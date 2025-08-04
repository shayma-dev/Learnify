import React from 'react';
import AuthModal from '../components/AuthModal'; // Adjust import path if needed

const LandingPage = () => {
  return (
    <div style={{ height: '100vh' }}>
      <AuthModal /> {/* Render the AuthModal component */}
    </div>
  );
};

export default LandingPage;