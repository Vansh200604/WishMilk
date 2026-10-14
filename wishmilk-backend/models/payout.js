import mongoose from "mongoose";

// A payout request from a dairy owner or a delivery rider against their
// own earned-but-not-yet-settled balance. This is a request/ledger
// record, not a live payment integration — an admin moves it from
// pending -> paid (or rejected) once the money has actually been sent
// outside the app (bank transfer / UPI), recording a reference note.
const payoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Denormalized at request time — lets admin filter/sort payouts
    // without a populate, and keeps old requests accurate even if a
    // user's role were ever changed later.
    role: {
      type: String,
      enum: ["dairyOwner", "deliveryPerson"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "paid", "rejected"],
      default: "pending",
    },
    method: {
      type: String,
      enum: ["upi", "bank_transfer"],
      default: "upi",
    },
    // Freeform — a UPI ID or bank details the recipient typed in when
    // requesting, so the admin knows where to send it.
    payoutDetails: {
      type: String,
      trim: true,
    },
    // Admin-facing note — e.g. a rejection reason or a payment
    // reference/transaction ID once paid.
    notes: {
      type: String,
      trim: true,
    },
    processedAt: {
      type: Date,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

payoutSchema.index({ user: 1, createdAt: -1 });
payoutSchema.index({ status: 1, createdAt: -1 });

const Payout = mongoose.model("Payout", payoutSchema);
export default Payout;