import mongoose from "mongoose";

const milkSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['cow', 'buffalo', 'goat', 'sheep'],
        required: true
    },
    fatPercentage: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    packaging: {
        type: String,
        enum: ['bottle', 'packet'],
        required: true
    },
    unit: {
        type: String,
        enum: ["liter", "ml"],
        required: true
    },
    inStock: {
        type: Boolean,
        required: true
    },
    image: {
        type: String
    },
    dairyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dairy',
        required: true
    }
}, {timestamps: true})

const Milk = mongoose.model('Milk', milkSchema);

export default Milk;