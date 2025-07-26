import React, { useState, useEffect } from 'react';
import { fetchApiRoot } from '../api';

export default function Dashboard() {
  const [apiMsg, setApiMsg] = useState('');

  useEffect(() => {
    fetchApiRoot()
      .then((data) => setApiMsg(data.message))
      .catch(() => setApiMsg('Backend not responding.'));
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h1>Dashboard</h1>
      <p>API says: {apiMsg}</p>
    </div>
  );
}