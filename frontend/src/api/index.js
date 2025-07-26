const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

export async function fetchApiRoot() {
  const res = await fetch(`${API_BASE}/`);
  if (!res.ok) throw new Error('Failed to load API');
  return res.json();
}