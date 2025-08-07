import React from 'react'
import { SimpleGrid } from '@mantine/core';
import logo from '../assets/Logo.png'
import './Footer.css'

export default function Footer() {
  return (
    <footer>
    <SimpleGrid cols={2} spacing="lg" verticalSpacing="xl">
      <div>
         <img src={logo} alt="Logo" className="footer-logo"></img>
      </div>
      <div>
     <div className="footer-description">
        <h3 className="footer-title">Learnify</h3>
        <p className="footer-subtext">Smart platform to help you organize your study tasks, habits, and notes all in one place.</p>
        <p className="footer-footer">&copy; 2025 Learnify — All rights reserved to Learnify developers</p>
       </div>
      </div>
    </SimpleGrid>
    </footer>

  )
}
