import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import customerRouter from './routes/customer.routes.js';
import productRouter from './routes/product.routes.js';
import wishlistRouter from './routes/wishlist.routes.js';
import cartRouter from './routes/cart.routes.js';
import orderRouter from './routes/order.routes.js';

dotenv.config();

const app = express();
const port = 8083;

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/customers', customerRouter);
app.use('/products', productRouter);
app.use('/wishlist', wishlistRouter);
app.use('/cart', cartRouter);
app.use('/orders', orderRouter);

mongoose.connect(process.env.dbUrl).then(() => {
    console.log("DB connected");
}).catch((err) => {
    console.error(err + ' occured');
});

app.listen(port, () => {
    console.log("Server started.");
});
