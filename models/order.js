// import mongoose from "mongoose";



// const orderSchema = new mongoose.Schema({
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true
//     },
//     dairy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Dairy",
//         required: true
//     },
//     milkType: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Milk",
//         required: true
//     },
//     quantity: {
//         type: Number,
//         required: true,
//         min: 2
//     },
//     totalPrice: {
//         type: Number,
//         required: true,
//         min: 0
//     },
//     deliveryAddress: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Address",
//         required: true
//     },
//     deliveryTime: {
//         type: Date,
//         required: true
//     },
//     status: {
//         type: String,
//         enum: ["pending", "confirmed", "delivered", "cancelled"],
//         default: "pending"
//     },
//     paymentStatus: {
//         type: String,
//         enum: ["pending", "paid", "failed"],
//         default: "pending"
//     }


// }, {timestamps: true});

// const Order = mongoose.model('Order', orderSchema);

// export default Order;



import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
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
    totalPrice: {
        type: Number,
        required: true,
        min: 0
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
    scheduledDate: {
        type: Date,                   
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "out_for_delivery", "delivered", "cancelled"],
        default: "pending"             
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending"          
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction"            
    },
    isSubscriptionOrder: {
        type: Boolean,
        default: false,                         
    },
    subscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription"
    },
    cancelReason: {
        type: String                   
    }

}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;