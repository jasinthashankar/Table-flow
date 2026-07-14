import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to format responses and handle errors
api.interceptors.response.use(
  (response) => {
    // If the backend returns a response with `{ success: true, data: ... }`
    return response.data;
  },
  (error) => {
    // 5. Ensure response interceptors reject errors rather than swallowing them
    const formattedError = {
      message: error.response?.data?.message || error.message || 'An unknown network error occurred',
      status: error.response?.status || 500,
      errors: error.response?.data?.errors || [],
      raw: error
    };

    console.error('[API Error Interceptor]', formattedError);
    return Promise.reject(formattedError);
  }
);

export default api;
