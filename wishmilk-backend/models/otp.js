import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["email", "phone"],
        required: true,
    },
    purpose: {
        type: String,
        enum: ["register", "login", "resetPassword"],
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    verified: {
        type: Boolean,
        default: false
    }

}, {timestamps: true});

otpSchema.index({ expiresAt: 1}, { expireAfterSeconds: 0 });

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;