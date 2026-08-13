import Subscription from "../models/subscription.js";
import Milk from "../models/milk.js";
import Dairy from "../models/dairy.js";
import { generateSubscriptionOrders } from "../services/subscriptionService.js";

const CYCLE_DAYS = { weekly: 7, monthly: 30 };

// @desc    Create a subscription — delivery happens automatically every
//          day going forward, no manual order needed
// @route   POST /api/subscriptions
// @access  Private
export const createSubscription = async (req, res) => {
    try {
        const { dairy, milkType, quantity, deliveryAddress, deliverySlot, plan, startDate } = req.body;

        if (!dairy || !milkType || !quantity || !deliveryAddress || !plan) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        if (!CYCLE_DAYS[plan]) {
            return res.status(400).json({ success: false, message: "plan must be 'weekly' or 'monthly'" });
        }

        const milk = await Milk.findById(milkType);
        if (!milk) {
            return res.status(404).json({ success: false, message: "Milk product not found" });
        }
        if (!milk.inStock) {
            return res.status(400).json({ success: false, message: "This milk product is currently out of stock" });
        }

        const dairyDoc = await Dairy.findById(dairy);
        if (!dairyDoc) {
            return res.status(404).json({ success: false, message: "Dairy not found" });
        }
        const pricing = dairyDoc.milkPricing.find((p) => p.type === milk.type);
        if (!pricing) {
            return res.status(400).json({ success: false, message: "This dairy hasn't set a price for this milk type" });
        }

        // Server computes the price here too — same trust model as
        // regular orders, never taken from the client.
        const pricePerDelivery = Math.round(pricing.price * quantity * 100) / 100;

        const start = startDate ? new Date(startDate) : new Date();
        start.setHours(0, 0, 0, 0);
        if (!startDate) start.setDate(start.getDate() + 1); // default to tomorrow

        const cycleEndDate = new Date(start);
        cycleEndDate.setDate(cycleEndDate.getDate() + CYCLE_DAYS[plan]);

        const subscription = await Subscription.create({
            user: req.user._id,
            dairy,
            milkType,
            quantity,
            deliveryAddress,
            deliverySlot: deliverySlot || "morning",
            plan,
            pricePerDelivery,
            startDate: start,
            nextDeliveryDate: start,
            cycleEndDate,
        });

        res.status(201).json({ success: true, message: "Subscription created", data: subscription });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating subscription", error: error.message });
    }
};

// @desc    List the logged-in user's subscriptions
// @route   GET /api/subscriptions/my-subscriptions
// @access  Private
export const getMySubscriptions = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = { user: req.user._id };
        if (status) filter.status = status;

        const subscriptions = await Subscription.find(filter)
            .populate("dairy", "name image phone")
            .populate("milkType", "name type unit packaging")
            .populate("deliveryAddress", "label fullAddress")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: subscriptions.length, data: subscriptions });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching subscriptions", error: error.message });
    }
};

// @desc    Get one subscription (owner only)
// @route   GET /api/subscriptions/:id
// @access  Private
export const getSubscriptionById = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ _id: req.params.id, user: req.user._id })
            .populate("dairy", "name image phone")
            .populate("milkType", "name type unit packaging")
            .populate("deliveryAddress", "label fullAddress")
            .populate("lastGeneratedOrder", "status scheduledDate totalPrice");

        if (!subscription) {
            return res.status(404).json({ success: false, message: "Subscription not found" });
        }
        res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching subscription", error: error.message });
    }
};

// @desc    Pause a subscription — no orders generated while paused
// @route   PATCH /api/subscriptions/:id/pause
// @access  Private
export const pauseSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id, status: "active" },
            { status: "paused" },
            // { new: true }
            { returnDocument: "after" }
        );
        if (!subscription) {
            return res.status(404).json({ success: false, message: "Active subscription not found" });
        }
        res.status(200).json({ success: true, message: "Subscription paused", data: subscription });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error pausing subscription", error: error.message });
    }
};

// @desc    Resume a paused subscription — picks up from today
// @route   PATCH /api/subscriptions/:id/resume
// @access  Private
export const resumeSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ _id: req.params.id, user: req.user._id, status: "paused" });
        if (!subscription) {
            return res.status(404).json({ success: false, message: "Paused subscription not found" });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        subscription.status = "active";
        // Don't try to "catch up" on missed days while paused — resume
        // fresh from today.
        if (subscription.nextDeliveryDate < today) {
            subscription.nextDeliveryDate = today;
        }
        await subscription.save();

        res.status(200).json({ success: true, message: "Subscription resumed", data: subscription });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error resuming subscription", error: error.message });
    }
};

// @desc    Cancel a subscription permanently
// @route   PATCH /api/subscriptions/:id/cancel
// @access  Private
export const cancelSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id, status: { $in: ["active", "paused"] } },
            { status: "cancelled", autoRenew: false },
            // { new: true }
            { returnDocument: "after" }
        );
        if (!subscription) {
            return res.status(404).json({ success: false, message: "Subscription not found" });
        }
        res.status(200).json({ success: true, message: "Subscription cancelled", data: subscription });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error cancelling subscription", error: error.message });
    }
};

// @desc    Manually run the subscription order generator right now,
//          instead of waiting for the daily cron tick — mainly for
//          testing, since there's no practical way to wait for an actual
//          midnight run during development.
// @route   POST /api/subscriptions/generate-now
// @access  Private (admin)
export const triggerGeneration = async (req, res) => {
    try {
        const result = await generateSubscriptionOrders();
        res.status(200).json({ success: true, message: "Generation run complete", data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error running generation", error: error.message });
    }
};