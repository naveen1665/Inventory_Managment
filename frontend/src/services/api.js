import axios from 'axios';

// Vite proxies /api to port 5001 as defined in vite.config.js for dev
// In production, we need an absolute URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://inventory-managment-oi0v.onrender.com/api',
});

// Interceptor to attach the bearer token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Optional: Interceptor to handle global 401 response (session expiry)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Optional: automatically handle logout if not authorized
            // localStorage.removeItem('token');
            // localStorage.removeItem('user');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
