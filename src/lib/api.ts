import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://budget-app-backend-nm21.onrender.com',
});

export default api;
