import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getUserOrders,
  getOrderById,
} from '../controllers/order.controller.js';
import authenticate from '../middlewares/auth.middleware.js';

const router = express.Router();

// All order operations require customer authentication
router.use(authenticate);

// Task 4: Create Order API endpoint
router.post('/create-payment-order', createPaymentOrder);

// Payment Verification endpoint
router.post('/verify-payment', verifyPayment);

// Customer order retrieval
router.get('/', getUserOrders);
router.get('/:orderId', getOrderById);

export default router;
