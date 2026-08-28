import express from 'express';
import mongoose  from 'mongoose';
import dotenv from 'dotenv';
import router from './routes/customer.routes';


const app = express();
const port = 8083

app.use(express.json());
app.use('/customers', router);


mongoose.connect(process.env.dbUrl).then(() => {
    console.log("DB connected");
}).catch((err) => {
    console.error(err + ' occured')
})



app.listen(port, () => {
    console.log("Server started.")
})

