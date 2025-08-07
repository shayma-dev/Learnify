import React from 'react';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';

// import Sidebar from './Components/Sidebar'
import Header from './Components/Header'
function App() {

  
  return (
       <MantineProvider withGlobalStyles withNormalizeCSS>
        <ModalsProvider>
        <Header/> 
        {/* <Tasks/>      */}
        </ModalsProvider>   
     </MantineProvider>

  );
}

export default App;
