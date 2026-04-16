import express from "express";
import {
    createPaymentOrder,
    verifyPayment,
    razorpayWebhook,
    getPaymentByOrder,
    getMyPayments,
    refundPayment,
} from "../Controllers/paymentController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Webhook needs raw body — must be registered BEFORE express.json() in server.js
router.post("/webhook", express.raw({ type: "application/json" }), razorpayWebhook);

router.use(protect);

router.post("/create-order", createPaymentOrder);
router.post("/verify", verifyPayment);
router.get("/my-payments", getMyPayments);
router.get("/order/:orderId", getPaymentByOrder);
router.post("/:id/refund", refundPayment);

export default router;