import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
dotenv.config();

// Helmet middleware for setting various HTTP headers for security 
export const helmetMiddleware = helmet();

// CORS is used to allow cross-origin requests from different domains. 
//example: if your frontend is hosted on a different domain than your backend, you can use CORS to allow requests from that domain.
export const corsMiddleware = cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
});

// Global rate limiting is used to limit the number of requests a client can make to the server within a certain time frame.
// example: if you set a limit of 100 requests per 15 minutes, a client can only make 100 requests in that time frame. If they exceed that limit, they will receive a 429 Too Many Requests response.
export const globalRateLimiter = rateLimit({
    windowMs : 15 * 60 * 1000, // 15 minutes
    max : 100, // limit each IP to 100 requests per windowMs
    message : 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders : true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders : false, // Disable the `X-RateLimit-*` headers
})

// auth rate limiter - 10 auth requests per 15 minutes
//this is use in /login, /register, /forgot-password, /reset-password, /verify-email, /resend-verification-email routes to prevent brute force attacks.
export const authRateLimiter = rateLimit({
    windowMs : 15 * 60 * 1000, // 15 minutes
    max : 10, // limit each IP to 10 requests per windowMs
    message : 'Too many auth requests from this IP, please try again after 15 minutes',
    standardHeaders : true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders : false, // Disable the `X-RateLimit-*` headers
});

// OTP rate limiter - 5 OTP requests per 15 minutes
export const otpRateLimiter = rateLimit({
    windowMs : 15 * 60 * 1000, // 15 minutes
    max : 5, // limit each IP to 5 requests per windowMs
    message : 'Too many OTP requests from this IP, please try again after 15 minutes',
    standardHeaders : true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders : false, // Disable the `X-RateLimit-*` headers
})

// NoSQL injection protection middleware to sanitize user input and prevent NoSQL injection attacks.
// example: if a user tries to inject malicious code into a query, this middleware will remove any keys that start
//  with '$' or contain '.' from the request body, query string, and params.
export const mongoSanitizeMiddleware = mongoSanitize({replaceWith: '_'}); // Replace prohibited characters with '_' to prevent NoSQL injection attacks  