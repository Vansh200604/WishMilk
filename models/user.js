import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        firstName: {type: String, required: true},
        lastName: {type: String}
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    profilePicture: {
        type: String
    },
    phone: {
        type: String,
        required: true,
        match: [/^[0-9]{10}$/, "Invalid phone number"]
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number], // [lng, lat]
            required: true
        },
        address: { type: String, required: true }
    },
    favorites: [{
        type: String,
        enum: ["cow", "buffalo", "goat", "sheep"]
    }],
    orders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order"
        }
    ],
    role: {
        type: String,
        enum: ['user', 'admin', 'dairyOwner', 'deliveryPerson'],
        default: 'user',
        required: true
    },
    // Only set when role is 'deliveryPerson' — which dairy this rider
    // delivers for. A rider can only be assigned deliveries from this dairy.
    dairyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dairy"
    },
    // Only meaningful for role 'deliveryPerson' — their current position,
    // used to find the nearest available rider when auto-assigning a
    // delivery. Not required, since a rider may not have shared it yet.
    currentLocation: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number] // [lng, lat]
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    preferredMilk: {
        type: String,
        enum: ['cow', 'buffalo', 'goat', 'sheep'],
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    }
}, {timestamps: true});

userSchema.index({ currentLocation: "2dsphere" });

const User = mongoose.model('User', userSchema);

export default User;