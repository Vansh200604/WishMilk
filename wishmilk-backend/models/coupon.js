import mongoose from "mongoose"

const couponSchema =  new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
    },
    discountType: {
        type: String,
        enum: ["percentage", "flat"],
        required: true
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    minOrderAmount: {   // Minimun cart value to apply coupon
        type: Number,
        default: 0
    },
    maxDiscount: {     // Maximum discount amount for percentage type coupon
        type: Number,
        default: 0
    },
    usageLimit: {      // total number of times the coupon can be used {across all users}
        type: Number,
        default: 1
    },
    usedCount: {       // total number of times the coupon has been used {across all users}
        type: Number,
        default: 0
    },
    perUserLimit: {    // total number of times a single user can use the coupon
        type: Number,
        default: 1
    },
    usedBy: [{         // Array of users who have used the coupon
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        usedAt: {type: Date, default: Date.now},
        usedCount: { type: Number, default: 1}
    }],
    isActive:   { type: Boolean, default: true },     // Whether the coupon is currently active and can be applied
    expiresAt:  { type: Date, required: true },       // Expiration date of the coupon
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" }, //admin who create it
}, { timestamps: true });

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;