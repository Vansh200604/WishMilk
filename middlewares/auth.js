import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import dotenv from 'dotenv';
dotenv.config();

// ─── Protect Route (must be logged in) ───────────────────────────
export const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'User no longer exists' });
        }

        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired, please login again' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Restrict to Specific Roles ───────────────────────────────────
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Only ${roles.join(', ')} can perform this action`
            });
        }
        next();
    };
};

// ─── Restrict to Dairy Owner ──────────────────────────────────────
export const isDairyOwner = (req, res, next) => {
    if (req.user.role !== 'dairyOwner') {   //change bug dairy_owner to dairyOwner
        return res.status(403).json({
            success: false,
            message: 'Access denied. Only dairy owners can perform this action'
        });
    }
    next();
};

// ─── Restrict to Customer ─────────────────────────────────────────
export const isUser = (req, res, next) => {
    if (req.user.role !== 'user') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Only users can perform this action'
        });
    }
    next();
};

// ─── Restrict to Admin ────────────────────────────────────────────
export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admins only'
        });
    }
    next();
};