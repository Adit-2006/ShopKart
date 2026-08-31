import express from 'express';
import { getUser, logoutUser, registerUser } from '../controllers/customer.controller.js';
import { loginUser } from '../controllers/customer.controller.js';
import authenticate from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authenticate, getUser);
router.post('/logout', logoutUser);



export default router