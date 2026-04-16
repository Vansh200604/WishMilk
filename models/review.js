import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    dairyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dairy",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comments: {
        type: String,
    }

} , {timestamps: true});

const Review = mongoose.model('Review', reviewSchema);
export default Review;