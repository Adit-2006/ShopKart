import express from 'express';
import { registerUser } from '../controllers/customer.controller';
import { loginUser } from '../controllers/customer.controller';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', )



export default router