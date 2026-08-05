import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dairy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dairy',
        required: true
    },
    // Set by the dairy owner when they assign a rider to this delivery.
    // Not required — a delivery can exist unassigned until someone picks it up.
    assignedRider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // False whenever a rider is (auto- or manually) assigned but hasn't
    // accepted yet. The rider portal treats riderConfirmed: false as "needs
    // your response" and shows an accept/decline prompt instead of the
    // normal progress controls.
    riderConfirmed: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'picked-up', 'out-for-delivery', 'delivered', 'failed'],
        default: 'pending'
    },
    timeLine: [{
        status: { type: String },
        message: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    currentLocation: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },
    estimatedDelivery: {
        type: Date
    },
    deliveredAt: { 
        type: Date 
    },
    failureReason: {
        type: String
    }
}, { timestamps: true });

deliverySchema.index({ 
    currentLocation: '2dsphere' 
});

const Delivery = mongoose.model('Delivery', deliverySchema);    

export default Delivery;