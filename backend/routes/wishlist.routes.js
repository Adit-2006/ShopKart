import express from 'express';
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from '../controllers/wishlist.controller.js';
import authenticate from '../middlewares/auth.middleware.js';

const router = express.Router();

// All wishlist operations require authenticated user
router.use(authenticate);

router.get('/', getWishlist);
router.post('/:productId', addToWishlist);
router.delete('/:productId', removeFromWishlist);

export default router;
