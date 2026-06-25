import express from 'express';
import "dotenv/config";
import connectDB from './config/db.js';
import mongoSantize from 'express-mongo-sanitize';

// ─── Security ─────────────────────────────────────────────────────
import {
    helmetMiddleware,
    corsMiddleware,
    globalRateLimiter,
    authRateLimiter,
    otpRateLimiter,
    mongoSanitizeMiddleware,
} from './middlewares/security.js';

// ─── Routers ──────────────────────────────────────────────────────
import authRouter         from './Routers/authRoute.js';
import dairyRouter        from './Routers/dairyRoute.js';
import reviewRouter       from './Routers/reviewRoute.js';
import orderRouter        from './Routers/orderRoute.js';
import paymentRouter      from './Routers/paymentRoute.js';
import notificationRouter from './Routers/notificationRoute.js';
import milkRouter         from './Routers/milkRoute.js';
import otpRouter          from './Routers/otpRoute.js';
import deliveryRouter     from './Routers/deliveryRoute.js';
import couponRouter       from './Routers/couponRoute.js';
import walletRouter       from './Routers/walletRoute.js';

const app = express();

// ─── Security Middlewares ──────────────────────────────────────────
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(globalRateLimiter);

// ─── Razorpay Webhook — raw body BEFORE express.json() ────────────
import { razorpayWebhook } from './Controllers/paymentController.js';
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), razorpayWebhook);

// ─── Body Parsers ──────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── NoSQL Injection Protection ────────────────────────────────────
// app.use(mongoSanitizeMiddleware);

// ─── Database ──────────────────────────────────────────────────────
connectDB();

const port = 3000;

// ─── Routes ────────────────────────────────────────────────────────
app.use('/api/user',          authRateLimiter, authRouter);
app.use('/api/otp',           otpRateLimiter,  otpRouter);
app.use('/api/dairies',       dairyRouter);
app.use('/api/reviews',       reviewRouter);
app.use('/api/orders',        orderRouter);
app.use('/api/payments',      paymentRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/milk',          milkRouter);
app.use('/api/delivery',      deliveryRouter);
app.use('/api/coupons',       couponRouter);
app.use('/api/wallet',        walletRouter);

// ─── Health Check ──────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ─── 404 Handler ───────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});