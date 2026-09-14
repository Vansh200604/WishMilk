import express from "express";
import {
    createCoupon,
    applyCoupon,
    redeemCoupon,
    getAllCoupons,
    toggleCoupon,
    deleteCoupon,
} from "../Controllers/couponController.js";
import { protect, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// ─── User routes ───────────────────────────────────────────────────
router.post("/apply",  protect, applyCoupon);   // validate + calculate discount
router.post("/redeem", protect, redeemCoupon);  // mark coupon as used after order placed

// ─── Admin routes ──────────────────────────────────────────────────
router.post("/",            protect, isAdmin, createCoupon);
router.get("/",             protect, isAdmin, getAllCoupons);
router.patch("/:id/toggle", protect, isAdmin, toggleCoupon);
router.delete("/:id",       protect, isAdmin, deleteCoupon);

export default router;