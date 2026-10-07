import express from 'express';
import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} from '../controllers/cart.controller.js';
import authenticate from '../middlewares/auth.middleware.js';

const router = express.Router();

// All cart operations require an authenticated user session
router.use(authenticate);

router.get('/', getCart);
router.post('/:productId', addToCart);
router.patch('/:productId', updateCartQuantity);
router.delete('/:productId', removeFromCart);

export default router;
