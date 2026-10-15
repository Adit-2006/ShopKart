import axios from 'axios';

// Backend base URL. Local development falls back to the original localhost
// port; production is configured with VITE_API_URL (e.g. the Render URL).
// The path prefixes below (/customers, /products, ...) already match the
// backend routes, so no extra /api prefix is added here.
//
// - VITE_API_URL unset            -> http://localhost:8083 (local development)
// - VITE_API_URL=https://...      -> direct requests to that backend
// - VITE_API_URL= (empty string)  -> same-origin relative requests
//   (used when the API is reverse-proxied through the frontend host)
const configuredApiUrl = import.meta.env.VITE_API_URL;
const baseURL = (
  configuredApiUrl !== undefined ? configuredApiUrl : 'http://localhost:8083'
).replace(/\/+$/, '');

const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const registerCustomer = async (customerData) => {
  const response = await API.post('/customers/register', customerData);
  return response.data;
};

export const loginCustomer = async (customerData) => {
  const response = await API.post('/customers/login', customerData);
  return response.data;
};

export const getUser = async () => {
  const response = await API.get('/customers/me');
  return response.data;
};

export const logoutCustomer = async () => {
  const response = await API.post('/customers/logout');
  return response.data;
};

export const getProducts = async (params = {}) => {
  const response = await API.get('/products', { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await API.get(`/products/${id}`);
  return response.data;
};

export const getWishlist = async () => {
  const response = await API.get('/wishlist');
  return response.data;
};

export const addToWishlist = async (productId) => {
  const response = await API.post(`/wishlist/${productId}`);
  return response.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await API.delete(`/wishlist/${productId}`);
  return response.data;
};

export const getCart = async () => {
  const response = await API.get('/cart');
  return response.data;
};

export const addToCart = async (productId) => {
  const response = await API.post(`/cart/${productId}`);
  return response.data;
};

export const updateCartQuantity = async (productId, quantity) => {
  const response = await API.patch(`/cart/${productId}`, { quantity });
  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await API.delete(`/cart/${productId}`);
  return response.data;
};

export const createPaymentOrder = async (shippingAddress) => {
  const response = await API.post('/orders/create-payment-order', { shippingAddress });
  return response.data;
};

export const verifyPayment = async (paymentData) => {
  const response = await API.post('/orders/verify-payment', paymentData);
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await API.get(`/orders/${orderId}`);
  return response.data;
};

export const getUserOrders = async () => {
  const response = await API.get('/orders');
  return response.data;
};

export default API;
