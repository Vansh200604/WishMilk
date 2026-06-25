import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    label: {
        type: String,
        enum: ["home", "office", "other"],
        default: "home"
    },
    fullAddress: {
        type: String,
        required: true
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
        }
    },

}, {timestamps: true});

addressSchema.index({ location: "2dsphere" });


const Address = mongoose.model('Address', addressSchema);

export default Address;