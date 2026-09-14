import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min : 0
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'net_banking', 'upi', 'cash_on_delivery', 'paypal'],
        required: true 
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },

    // razorPay specific fields
    razorpayOrderId: {
        type: String,
    },
    razorpayPaymentId: {
        type: String,
    },
    razorpaySignature: {
        type: String,
    },

    // refund tracking fields
    refundId: {
        type: String,
    },
    refundAmount: {
        type: Number,
        min : 0,
    },
    refundedAt: {
        type: Date,
    },

    // when payment was successfully completed
    paidAt: {
        type: Date,
    }

}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;