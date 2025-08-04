import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api", // Change to your backend URL
    withCredentials: true // Allows sending and receiving cookies
});

export default axiosInstance;