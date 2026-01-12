import axios from 'axios'

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' }
})

// Add token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = token;
    }
    return config;
});

// Products
export const fetchProducts = (params) => API.get('/products', { params })
export const fetchProduct = (id) => API.get(`/products/${id}`)
export const createProduct = (data) => API.post('/products', data)
export const updateProduct = (id, data) => API.put(`/products/${id}`, data)
export const deleteProduct = (id) => API.delete(`/products/${id}`)

// Orders
export const fetchOrders = (params) => API.get('/orders', { params })
export const fetchOrder = (id) => API.get(`/orders/${id}`)
export const createOrder = (data) => API.post('/orders', data)
export const updateOrder = (id, data) => API.put(`/orders/${id}`, data)
export const deleteOrder = (id) => API.delete(`/orders/${id}`)

// Auth
export const login = (password) => API.post('/auth/login', { password })

export default API;
