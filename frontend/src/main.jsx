import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; // Ensure you're importing the Router
import { UserProvider } from "./context/UserContext.jsx";
import App from './App'; // Import App

// Import Mantine styles
import '@mantine/core/styles.css'; 
import { createTheme, MantineProvider } from '@mantine/core';

// Create a theme for Mantine components (customize as needed)
const theme = createTheme({
  // Add custom theme settings here, if required
});

// Render the application
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <UserProvider> {/* Wrap the app with UserProvider for context */}
        <Router> {/* Wrap the App with Router */}
          <App /> 
        </Router>
      </UserProvider>
    </MantineProvider>
  </StrictMode>,
);