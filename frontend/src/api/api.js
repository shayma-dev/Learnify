// src/api/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Change this to your API base URL
    withCredentials: true, // This allows cookies to be sent with CORS requests
});

export default api;