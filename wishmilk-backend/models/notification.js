import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["order", "subscription", "payment", "delivery", "promo", "system"],
      required: true,
    },
    channel: {
      type: String,
      enum: ["email", "sms", "push"],
      required: true,
    },
    title:    { type: String, required: true },
    message:  { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "read"],
      default: "pending",
    },
    metadata: { type: mongoose.Schema.Types.Mixed },
    sentAt:   { type: Date },
    readAt:   { type: Date },
    errorLog: { type: String },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;