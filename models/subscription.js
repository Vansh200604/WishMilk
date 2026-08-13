import mongoose from "mongoose";

// A recurring milk order — once active, the daily generator (see
// services/subscriptionService.js) automatically creates a real Order
// every day the subscription is due, without the customer placing one
// manually. "weekly"/"monthly" controls the billing/renewal cycle length;
// delivery itself happens every day within that cycle.
const subscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    dairy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dairy",
        required: true
    },
    milkType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Milk",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    deliveryAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        required: true
    },
    deliverySlot: {
        type: String,
        enum: ["morning", "afternoon", "evening"],
        default: "morning"
    },
    plan: {
        type: String,
        enum: ["weekly", "monthly"],
        required: true
    },
    // Snapshot of the per-delivery price at subscribe time, computed
    // server-side from Dairy.milkPricing — same trust model as regular
    // orders, never taken from the client.
    pricePerDelivery: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    // The next date the generator should create an Order for. Advances by
    // one day each time an order is generated.
    nextDeliveryDate: {
        type: Date,
        required: true
    },
    // End of the current billing cycle (startDate + 7 or 30 days,
    // extended automatically on renewal if autoRenew is true).
    cycleEndDate: {
        type: Date,
        required: true
    },
    autoRenew: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ["active", "paused", "cancelled", "completed"],
        default: "active"
    },
    lastGeneratedOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    }
}, { timestamps: true });

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;