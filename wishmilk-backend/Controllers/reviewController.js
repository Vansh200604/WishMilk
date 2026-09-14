import Review from "../models/review.js";
import Dairy from "../models/dairy.js";
import mongoose from "mongoose";

// @desc    Create a review for a dairy
// @route   POST /api/reviews/:dairyId
// @access  Private (user only)
export const createReview = async (req, res) => {
    try {
        const { rating, comments } = req.body;
        const { dairyId } = req.params;

        // Validate rating
        if (!rating) {
            return res.status(400).json({ success: false, message: "Rating is required" });
        }

        // Check if dairy exists
        const dairy = await Dairy.findById(dairyId);
        if (!dairy) {
            return res.status(404).json({ success: false, message: "Dairy not found" });
        }

        // Check if user already reviewed this dairy
        const alreadyReviewed = await Review.findOne({
            userId: req.user._id,
            dairyId
        });
        if (alreadyReviewed) {
            return res.status(400).json({ success: false, message: "You have already reviewed this dairy" });
        }

        // Create review
        const review = await Review.create({
            userId: req.user._id,
            dairyId,
            rating,
            comments
        });

        // Update dairy rating and reviewCount
        await updateDairyRating(dairyId);

        res.status(201).json({ success: true, message: "Review added successfully", data: review });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating review", error: error.message });
    }
};

// @desc    Get all reviews for a dairy
// @route   GET /api/reviews/:dairyId
// @access  Public
export const getDairyReviews = async (req, res) => {
    try {
        const { dairyId } = req.params;

        // Check if dairy exists
        const dairy = await Dairy.findById(dairyId);
        if (!dairy) {
            return res.status(404).json({ success: false, message: "Dairy not found" });
        }

        const reviews = await Review.find({ dairyId })
            .populate('userId', 'username profilePicture')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: reviews.length, data: reviews });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching reviews", error: error.message });
    }
};

// @desc    Get all reviews by logged in user
// @route   GET /api/reviews/my-reviews
// @access  Private
export const getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.user._id })
            .populate('dairyId', 'name image location')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: reviews.length, data: reviews });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching your reviews", error: error.message });
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private (owner of review only)
export const updateReview = async (req, res) => {
    try {
        const { rating, comments } = req.body;

        const review = await Review.findById(req.params.reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        // Only the review owner can update
        if (review.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to update this review" });
        }

        if (rating) review.rating = rating;
        if (comments) review.comments = comments;

        await review.save();

        // Recalculate dairy rating
        await updateDairyRating(review.dairyId);

        res.status(200).json({ success: true, message: "Review updated successfully", data: review });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating review", error: error.message });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private (owner of review or admin)
export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        // Only review owner or admin can delete
        if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Not authorized to delete this review" });
        }

        const dairyId = review.dairyId;
        await review.deleteOne();

        // Recalculate dairy rating after deletion
        await updateDairyRating(dairyId);

        res.status(200).json({ success: true, message: "Review deleted successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting review", error: error.message });
    }
};

// @desc    Get rating summary for a dairy
// @route   GET /api/reviews/:dairyId/summary
// @access  Public
export const getDairyRatingSummary = async (req, res) => {
    try {
        const { dairyId } = req.params;

        const summary = await Review.aggregate([
            { $match: { dairyId: new mongoose.Types.ObjectId(dairyId) } },
            {
                $group: {
                    _id: "$dairyId",
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                    5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
                    4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
                    3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
                    2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
                    1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
                }
            }
        ]);

        if (!summary.length) {
            return res.status(200).json({
                success: true,
                data: { averageRating: 0, totalReviews: 0, breakdown: {} }
            });
        }

        const result = summary[0];
        res.status(200).json({
            success: true,
            data: {
                averageRating: Math.round(result.averageRating * 10) / 10,
                totalReviews: result.totalReviews,
                breakdown: { 5: result[5], 4: result[4], 3: result[3], 2: result[2], 1: result[1] }
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching rating summary", error: error.message });
    }
};

// ─── Helper: Recalculate and update dairy rating ──────────────────
const updateDairyRating = async (dairyId) => {
    const result = await Review.aggregate([
        { $match: { dairyId: new mongoose.Types.ObjectId(dairyId) } },
        {
            $group: {
                _id: "$dairyId",
                averageRating: { $avg: "$rating" },
                reviewCount: { $sum: 1 }
            }
        }
    ]);

    if (result.length > 0) {
        await Dairy.findByIdAndUpdate(dairyId, {
            rating: Math.round(result[0].averageRating * 10) / 10,
            reviewCount: result[0].reviewCount
        });
    } else {
        // No reviews left — reset
        await Dairy.findByIdAndUpdate(dairyId, { rating: 0, reviewCount: 0 });
    }
};