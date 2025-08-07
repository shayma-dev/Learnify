import React from 'react';
import './FirstSection.css';
import { Button } from '@mantine/core';
import smallogo from '../assets/smallLogo.png';

export default function FirstSection({ openModal }) {
  return (
    <div className="first-section">
      <img src={smallogo} alt="Logo" />
      <h1>Learn, track and achieve</h1>
      <h6>Streamline your study routine and reach your goals</h6>
      <Button 
      className="get-start" 
      onClick={openModal}
      variant="filled"
      color="blue"
      size="lg" 
       
        >
        Get Started
      </Button>
    </div>
  );
}