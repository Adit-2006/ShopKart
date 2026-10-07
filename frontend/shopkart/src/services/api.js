import axios from 'axios';

const API = axios.create({
  baseURL: "http://localhost:8083/",
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

export default API;
