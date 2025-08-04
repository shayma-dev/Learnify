import axios from "./axiosInstance";

const API_URL = 'http://localhost:5000/api/auth'; // Replace with your backend URL

const authService = {
    signup: async (email, password, username) => {
        const response = await axios.post("/auth/signup", { email, password, username });
        return response.data;
    },
    login: async (email, password) => {
        const response = await axios.post("/auth/login", { email, password });
        return response.data;
    },
    logout: async () => {
        await axios.get("/auth/logout"); // Call your logout endpoint
    },
    getProfile: async () => {
        const response = await axios.get("/profile");
        return response.data;
    }
};

export default authService;