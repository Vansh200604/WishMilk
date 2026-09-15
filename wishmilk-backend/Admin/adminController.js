import User from "../models/user.js";
import Dairy from "../models/dairy.js";
import Order from "../models/order.js";
import Subscription from "../models/subscription.js";

// @desc    Platform-wide overview numbers for the admin dashboard
// @route   GET /api/admin/stats
// @access  Private (admin)
export const getPlatformStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalDairyOwners,
            totalRiders,
            pendingRiders,
            totalDairies,
            activeDairies,
            totalOrders,
            activeSubscriptions,
            revenueResult,
        ] = await Promise.all([
            User.countDocuments({ role: "user" }),
            User.countDocuments({ role: "dairyOwner" }),
            User.countDocuments({ role: "deliveryPerson" }),
            User.countDocuments({ role: "deliveryPerson", riderStatus: "pending" }),
            Dairy.countDocuments({}),
            Dairy.countDocuments({ isActive: true }),
            Order.countDocuments({}),
            Subscription.countDocuments({ status: "active" }),
            Order.aggregate([
                { $match: { paymentStatus: "paid" } },
                { $group: { _id: null, total: { $sum: "$totalPrice" } } },
            ]),
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalDairyOwners,
                totalRiders,
                pendingRiders,
                totalDairies,
                activeDairies,
                totalOrders,
                activeSubscriptions,
                totalRevenue: revenueResult[0]?.total || 0,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching platform stats", error: error.message });
    }
};

// @desc    List every user on the platform, with optional role/search filter
// @route   GET /api/admin/users
// @access  Private (admin)
export const getAllUsers = async (req, res) => {
    try {
        const { role, search, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (role) filter.role = role;
        if (search) {
            filter.$or = [
                { "username.firstName": { $regex: search, $options: "i" } },
                { "username.lastName": { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [users, total] = await Promise.all([
            User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
            User.countDocuments(filter),
        ]);

        res.status(200).json({ success: true, count: users.length, total, page: Number(page), data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching users", error: error.message });
    }
};

// @desc    Activate or deactivate any user account
// @route   PATCH /api/admin/users/:id/status
// @access  Private (admin)
export const updateUserActiveStatus = async (req, res) => {
    try {
        const { isActive } = req.body;
        if (typeof isActive !== "boolean") {
            return res.status(400).json({ success: false, message: "isActive (boolean) is required" });
        }

        const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, message: `User ${isActive ? "activated" : "deactivated"}`, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating user status", error: error.message });
    }
};

// @desc    List every dairy on the platform, including inactive ones —
//          the public GET /api/dairies always filters isActive: true, so
//          admin oversight needs its own endpoint to see everything.
// @route   GET /api/admin/dairies
// @access  Private (admin)
export const getAllDairiesAdmin = async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (search) filter.name = { $regex: search, $options: "i" };

        const skip = (Number(page) - 1) * Number(limit);
        const [dairies, total] = await Promise.all([
            Dairy.find(filter)
                .populate("owner", "username email phone")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Dairy.countDocuments(filter),
        ]);

        res.status(200).json({ success: true, count: dairies.length, total, page: Number(page), data: dairies });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching dairies", error: error.message });
    }
};

// @desc    Platform-wide order list — no per-user or per-dairy scoping
// @route   GET /api/admin/orders
// @access  Private (admin)
export const getAllOrdersAdmin = async (req, res) => {
    try {
        const { status, paymentStatus, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (paymentStatus) filter.paymentStatus = paymentStatus;

        const skip = (Number(page) - 1) * Number(limit);
        const [orders, total] = await Promise.all([
            Order.find(filter)
                .populate("userId", "username email")
                .populate("dairy", "name")
                .populate("milkType", "name type")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Order.countDocuments(filter),
        ]);

        res.status(200).json({ success: true, count: orders.length, total, page: Number(page), data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching orders", error: error.message });
    }
};

// @desc    Platform-wide subscription list
// @route   GET /api/admin/subscriptions
// @access  Private (admin)
export const getAllSubscriptionsAdmin = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (status) filter.status = status;

        const skip = (Number(page) - 1) * Number(limit);
        const [subscriptions, total] = await Promise.all([
            Subscription.find(filter)
                .populate("user", "username email")
                .populate("dairy", "name")
                .populate("milkType", "name type")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Subscription.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            count: subscriptions.length,
            total,
            page: Number(page),
            data: subscriptions,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching subscriptions", error: error.message });
    }
};