import express from 'express';
import "dotenv/config";
import connectDB from './config/db.js';
import authRouter from './Routers/authRoute.js';
import dairyRouter from './Routers/dairyRoute.js';
import reviewRouter from './Routers/reviewRoute.js';
import orderRouter from './Routers/orderRoute.js';
import paymentRouter from './Routers/paymentRoute.js';
import notificationRouter from './Routers/notificationRoute.js';
import milkRouter from './Routers/milkRoute.js';

const app = express();

app.use(express.json());

connectDB();

const port = 3000;


app.use('/api/user', authRouter);
app.use('/api/dairies', dairyRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/orders', orderRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/milk', milkRouter);

app.listen(port, ()=> {
    console.log(`Server is running on port ${port}`);
})