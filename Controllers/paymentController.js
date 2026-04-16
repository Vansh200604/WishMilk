import crypto from "crypto";
import Razorpay from "razorpay";
import Payment from "../models/payment.js";
import Order from "../models/order.js";
import "dotenv/config";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Razorpay order and init payment record
// @route   POST /api/payments/create-order
// @access  Private
export const createPaymentOrder = async (req, res) => {
    try {
        const { orderId, paymentMethod } = req.body;

        if (!orderId || !paymentMethod) {
            return res.status(400).json({ success: false, message: "orderId and paymentMethod are required" });
        }

        // Find the linked order
        const order = await Order.findOne({ _id: orderId, userId: req.user._id });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        if (order.paymentStatus === "paid") {
            return res.status(400).json({ success: false, message: "Order is already paid" });
        }

        // Handle cash on delivery separately — no Razorpay needed
        if (paymentMethod === "cash_on_delivery") {
            const payment = await Payment.create({
                orderId,
                userId:        req.user._id,
                amount:        order.totalPrice,
                paymentMethod: "cash_on_delivery",
                paymentStatus: "pending",
            });

            await Order.findByIdAndUpdate(orderId, { paymentId: payment._id });

            return res.status(201).json({
                success: true,
                message: "Cash on delivery order confirmed",
                data: payment,
            });
        }

        // Create Razorpay order (amount in paise)
        const razorpayOrder = await razorpay.orders.create({
            amount:   order.totalPrice * 100,
            currency: "INR",
            receipt:  `rcpt_${orderId}_${Date.now()}`,
            notes:    { orderId: orderId.toString(), userId: req.user._id.toString() },
        });

        // Create payment record
        const payment = await Payment.create({
            orderId,
            userId:          req.user._id,
            amount:          order.totalPrice,
            paymentMethod,
            paymentStatus:   "pending",
            razorpayOrderId: razorpayOrder.id,
        });

        // Link payment to order
        await Order.findByIdAndUpdate(orderId, { paymentId: payment._id });

        res.status(201).json({
            success: true,
            message: "Payment order created",
            data: {
                paymentId:       payment._id,
                razorpayOrderId: razorpayOrder.id,
                amount:          razorpayOrder.amount,
                currency:        razorpayOrder.currency,
                keyId:           process.env.RAZORPAY_KEY_ID,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating payment order", error: error.message });
    }
};

// @desc    Verify Razorpay payment signature and confirm payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return res.status(400).json({ success: false, message: "All Razorpay fields are required" });
        }

        // Verify signature
        const body              = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpaySignature) {
            await Payment.findOneAndUpdate({ razorpayOrderId }, { paymentStatus: "failed" });
            return res.status(400).json({ success: false, message: "Payment signature verification failed" });
        }

        // Mark payment as paid
        const payment = await Payment.findOneAndUpdate(
            { razorpayOrderId },
            {
                razorpayPaymentId,
                razorpaySignature,
                paymentStatus: "paid",
                paidAt:        new Date(),
            },
            { new: true }
        );

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment record not found" });
        }

        // Update linked order
        await Order.findByIdAndUpdate(payment.orderId, {
            paymentStatus: "paid",
            status:        "confirmed",
        });

        res.status(200).json({ success: true, message: "Payment verified successfully", data: payment });
    } catch (error) {
        res.status(500).json({ success: false, message: "Payment verification failed", error: error.message });
    }
};

// @desc    Razorpay webhook — auto-handle payment captured/failed events
// @route   POST /api/payments/webhook
// @access  Public (needs raw body — register before express.json in server.js)
export const razorpayWebhook = async (req, res) => {
    try {
        const secret    = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers["x-razorpay-signature"];

        const expectedSig = crypto
            .createHmac("sha256", secret)
            .update(JSON.stringify(req.body))
            .digest("hex");

        if (expectedSig !== signature) {
            return res.status(400).json({ success: false, message: "Invalid webhook signature" });
        }

        const event       = req.body.event;
        const paymentData = req.body.payload?.payment?.entity;

        if (event === "payment.captured" && paymentData) {
            const payment = await Payment.findOneAndUpdate(
                { razorpayOrderId: paymentData.order_id },
                {
                    razorpayPaymentId: paymentData.id,
                    paymentStatus:     "paid",
                    paidAt:            new Date(paymentData.created_at * 1000),
                },
                { new: true }
            );
            if (payment) {
                await Order.findByIdAndUpdate(payment.orderId, {
                    paymentStatus: "paid",
                    status:        "confirmed",
                });
            }
        }

        if (event === "payment.failed" && paymentData) {
            const payment = await Payment.findOneAndUpdate(
                { razorpayOrderId: paymentData.order_id },
                { paymentStatus: "failed" },
                { new: true }
            );
            if (payment) {
                await Order.findByIdAndUpdate(payment.orderId, { paymentStatus: "failed" });
            }
        }

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: "Webhook error", error: error.message });
    }
};

// @desc    Get payment details for a specific order
// @route   GET /api/payments/order/:orderId
// @access  Private
export const getPaymentByOrder = async (req, res) => {
    try {
        const payment = await Payment.findOne({
            orderId: req.params.orderId,
            userId:  req.user._id,
        }).populate("orderId", "status totalPrice scheduledDate deliverySlot");

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        res.status(200).json({ success: true, data: payment });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching payment", error: error.message });
    }
};

// @desc    Get all payments of logged-in user
// @route   GET /api/payments/my-payments
// @access  Private
export const getMyPayments = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const query = { userId: req.user._id };
        if (status) query.paymentStatus = status;

        const [payments, total] = await Promise.all([
            Payment.find(query)
                .populate("orderId", "status totalPrice scheduledDate deliverySlot milkType")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(Number(limit)),
            Payment.countDocuments(query),
        ]);

        res.status(200).json({ success: true, count: payments.length, total, page: Number(page), data: payments });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching payments", error: error.message });
    }
};

// @desc    Refund a payment
// @route   POST /api/payments/:id/refund
// @access  Private
export const refundPayment = async (req, res) => {
    try {
        const { amount } = req.body;

        const payment = await Payment.findOne({ _id: req.params.id, userId: req.user._id });
        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }
        if (payment.paymentStatus !== "paid") {
            return res.status(400).json({ success: false, message: "Only paid payments can be refunded" });
        }
        if (!payment.razorpayPaymentId) {
            return res.status(400).json({ success: false, message: "No Razorpay payment ID — cannot refund" });
        }

        const refundAmount = amount || payment.amount;

        const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
            amount: refundAmount * 100, // convert to paise
        });

        payment.paymentStatus = "refunded";
        payment.refundId      = refund.id;
        payment.refundAmount  = refundAmount;
        payment.refundedAt    = new Date();
        await payment.save();

        // Reflect refund on the order
        await Order.findByIdAndUpdate(payment.orderId, { paymentStatus: "failed" });

        res.status(200).json({ success: true, message: "Refund initiated successfully", data: payment });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error initiating refund", error: error.message });
    }
};