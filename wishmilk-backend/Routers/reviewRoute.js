import { Router } from "express";
import {
    createReview,
    getDairyReviews,
    getMyReviews,
    updateReview,
    deleteReview,
    getDairyRatingSummary
} from "../Controllers/reviewController.js";
import { protect, isUser } from "../middlewares/auth.js";

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────
router.get('/:dairyId', getDairyReviews);
router.get('/:dairyId/summary', getDairyRatingSummary);

// ─── Private Routes ───────────────────────────────────────────────
router.get('/user/my-reviews', protect, getMyReviews);
router.post('/:dairyId', protect, isUser, createReview);
router.put('/:reviewId', protect, updateReview);
router.delete('/:reviewId', protect, deleteReview);

export default router;