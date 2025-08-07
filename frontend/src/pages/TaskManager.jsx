import React from 'react';
import Sidebar from '../Components/Sidebar';
import Tasks from '../components/Tasks';

export default function TaskManager() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar/>
      <div style={{ flex: 1, padding: '20px' }}>
        <Tasks/>
      </div>
    </div>
  );
}
