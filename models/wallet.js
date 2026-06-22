import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String
    },
    reference: {
        type: String
    },
    balanceAfter : {
        type: Number,
        required: true,
        min: 0
    }
}, {timestamps: true});

const walletSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    totalEarned: {
        type: Number,
        default: 0,
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    loyaltyPoints: {
        type: Number,
        default: 0,
    },
    transactions: [walletTransactionSchema]
}, {timestamps: true});

const Wallet = mongoose.model('Wallet', walletSchema);
export default Wallet;