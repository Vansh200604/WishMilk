import mongoose from 'mongoose';

const dairySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image :{
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
            type: [Number],
            required: true
        },
        address: {
            type: String,
            required: true
        }
    },
    milkTypes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Milk',
            required: true
        }
    ],
    milkPricing: [
        {
            type: {
                type: String,
                enum: ['cow', 'buffalo', 'goat', 'sheep'],
                required: true
            },
            price: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    deliveryTime: {
        start: {
            type: String,
            required: true,
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"]
        },
        end: {
            type: String,
            required: true,
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"]
        }
    },
    subscriptionPlans: [
        {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            default: 'daily',
            required: true,
        }
    ],
    reviewCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });


dairySchema.index({ location: "2dsphere" });

dairySchema.pre('save', function () {
    const types = this.milkPricing.map(item => item.type);
    const uniqueTypes = new Set(types);

    if (types.length !== uniqueTypes.size) {
        throw new Error("Duplicate milk pricing types are not allowed.");
    }
});

const Dairy = mongoose.model('Dairy', dairySchema);

export default Dairy;