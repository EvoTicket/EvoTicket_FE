import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api-gateway-85z7.onrender.com',
    headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
    },
});

export default api;
