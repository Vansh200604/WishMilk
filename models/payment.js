// import mongoose from "mongoose";
// const paymentSchema = new mongoose.Schema({
//     orderId: {
//         type: "String",
//         ref: "order",
//         required: true,
//         unique: true
//     },
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true
//     },
//     amount: {
//         type: Number,
//         required: true,
//         min: 0
//     },
//     paymentMethod: {
//         type: String,
//         enum: ["credit_card", "debit_card", "net_banking", "upi", "cash_on_delivery"],
//         required: true
//     },
//     paymentStatus: {
//         type: String,
//         enum: ["pending", "paid", "failed"],
//         default: "pending"
//     },


// }, {timestamps: true});
// const Payment = mongoose.model('Payment', paymentSchema);
// export default Payment;



import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,   
        ref: "Order",                           
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0                                  // stored in rupees (Razorpay uses paise internally)
    },
    paymentMethod: {
        type: String,
        enum: ["credit_card", "debit_card", "net_banking", "upi", "cash_on_delivery"],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],    
        default: "pending"
    },

    //  added: Razorpay fields — required for payment verification & webhook handling
    razorpayOrderId:   { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },

    //  added: refund tracking
    refundId:     { type: String },
    refundAmount: { type: Number },
    refundedAt:   { type: Date },

    // added: when payment was successfully completed
    paidAt: { type: Date },

}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;