// import Order from "../models/order.js";
// import Milk from "../models/milk.js";
// import Dairy from "../models/dairy.js";
// import Coupon from "../models/coupon.js";
// import notificationService from "../services/notificationService.js";

// // @desc    Place a new order
// // @route   POST /api/orders
// // @access  Private
// export const createOrder = async (req, res) => {
//     try {
//         const { dairy, milkType, quantity, deliveryAddress, deliverySlot, scheduledDate, couponCode } = req.body;

//         if (!dairy || !milkType || !quantity || !deliveryAddress || !scheduledDate) {
//             return res.status(400).json({ success: false, message: "Missing required fields" });
//         }

//         const milk = await Milk.findById(milkType);
//         if (!milk) {
//             return res.status(404).json({ success: false, message: "Milk product not found" });
//         }
//         if (!milk.inStock) {
//             return res.status(400).json({ success: false, message: "This milk product is currently out of stock" });
//         }

//         const dairyDoc = await Dairy.findById(dairy);
//         if (!dairyDoc) {
//             return res.status(404).json({ success: false, message: "Dairy not found" });
//         }
//         const pricing = dairyDoc.milkPricing.find((p) => p.type === milk.type);
//         if (!pricing) {
//             return res.status(400).json({ success: false, message: "This dairy hasn't set a price for this milk type" });
//         }

//         // The server computes the real price here — a client-sent
//         // totalPrice is never trusted. This is also where any coupon is
//         // actually validated and redeemed, atomically with the order
//         // itself, instead of relying on separate apply/redeem calls the
//         // client could skip or tamper with.
//         const subtotal = Math.round(pricing.price * quantity * 100) / 100;
//         let discountAmount = 0;
//         let appliedCouponCode;

//         if (couponCode) {
//             const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
//             if (!coupon) {
//                 return res.status(400).json({ success: false, message: "Invalid or inactive coupon" });
//             }
//             if (new Date() > coupon.expiresAt) {
//                 return res.status(400).json({ success: false, message: "Coupon has expired" });
//             }
//             if (subtotal < coupon.minOrderAmount) {
//                 return res.status(400).json({
//                     success: false,
//                     message: `Minimum order amount for this coupon is ${coupon.minOrderAmount}`,
//                 });
//             }
//             if (coupon.usedCount >= coupon.usageLimit) {
//                 return res.status(400).json({ success: false, message: "Coupon usage limit has been reached" });
//             }
//             const userUsage = coupon.usedBy.find((u) => u.user.toString() === req.user._id.toString());
//             if (userUsage && userUsage.usedCount >= coupon.perUserLimit) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "You've already used this coupon the maximum number of times",
//                 });
//             }

//             discountAmount =
//                 coupon.discountType === "percentage" ? (subtotal * coupon.discountValue) / 100 : coupon.discountValue;
//             if (coupon.discountType === "percentage") {
//                 discountAmount = Math.min(discountAmount, coupon.maxDiscount);
//             }
//             discountAmount = Math.min(discountAmount, subtotal);
//             appliedCouponCode = coupon.code;

//             if (userUsage) {
//                 userUsage.usedCount += 1;
//                 userUsage.usedAt = new Date();
//             } else {
//                 coupon.usedBy.push({ user: req.user._id, usedCount: 1, usedAt: new Date() });
//             }
//             coupon.usedCount += 1;
//             if (coupon.usedCount >= coupon.usageLimit) coupon.isActive = false;
//             await coupon.save();
//         }

//         const totalPrice = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);

//         const order = await Order.create({
//             userId:          req.user._id,
//             dairy,
//             milkType,
//             quantity,
//             totalPrice,
//             couponCode:      appliedCouponCode,
//             discountAmount,
//             deliveryAddress,
//             deliverySlot:    deliverySlot || "morning",
//             scheduledDate:   new Date(scheduledDate),
//             status:          "pending",
//             paymentStatus:   "pending",
//         });

//         await notificationService.notifyAll({
//             user:    req.user,
//             subject: "Order Placed - WishMilk",
//             message: `Your order #${order._id} has been placed successfully! Delivery scheduled for ${new Date(scheduledDate).toDateString()} (${deliverySlot || "morning"}).`,
//             type:    "order",
//             metadata: { orderId: order._id },
//         });

//         res.status(201).json({ success: true, message: "Order placed successfully", data: order });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error placing order", error: error.message });
//     }
// };

// // @desc    Get all orders of logged-in user
// // @route   GET /api/orders/my-orders
// // @access  Private
// export const getMyOrders = async (req, res) => {
//     try {
//         const { status, page = 1, limit = 10 } = req.query;
//         const query = { userId: req.user._id };
//         if (status) query.status = status;

//         const [orders, total] = await Promise.all([
//             Order.find(query)
//                 .populate("dairy",           "name image phone")
//                 .populate("milkType",        "name type packaging unit")
//                 .populate("deliveryAddress")
//                 .populate("paymentId",       "razorpayPaymentId amount status")
//                 .sort({ createdAt: -1 })
//                 .skip((page - 1) * limit)
//                 .limit(Number(limit)),
//             Order.countDocuments(query),
//         ]);

//         res.status(200).json({ success: true, count: orders.length, total, page: Number(page), data: orders });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error fetching orders", error: error.message });
//     }
// };

// // @desc    Get a single order by ID
// // @route   GET /api/orders/:id
// // @access  Private
// export const getOrderById = async (req, res) => {
//     try {
//         const order = await Order.findOne({ _id: req.params.id, userId: req.user._id })
//             .populate("dairy",           "name image email phone location")
//             .populate("milkType",        "name type fatPercentage packaging unit")
//             .populate("deliveryAddress")
//             .populate("subscription",    "cycle status")
//             .populate("paymentId",       "razorpayPaymentId amount status method paidAt");

//         if (!order) {
//             return res.status(404).json({ success: false, message: "Order not found" });
//         }

//         res.status(200).json({ success: true, data: order });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error fetching order", error: error.message });
//     }
// };

// // @desc    Cancel an order (user can only cancel if still pending)
// // @route   PATCH /api/orders/:id/cancel
// // @access  Private
// export const cancelOrder = async (req, res) => {
//     try {
//         const { cancelReason } = req.body;

//         const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
//         if (!order) {
//             return res.status(404).json({ success: false, message: "Order not found" });
//         }
//         if (!["pending", "confirmed"].includes(order.status)) {
//             return res.status(400).json({
//                 success: false,
//                 message: `Order cannot be cancelled at '${order.status}' stage`,
//             });
//         }

//         order.status       = "cancelled";
//         order.cancelReason = cancelReason || "Cancelled by user";
//         await order.save();

//         await notificationService.notifyAll({
//             user:    req.user,
//             subject: "Order Cancelled - WishMilk",
//             message: `Your order #${order._id} has been cancelled.${cancelReason ? ` Reason: ${cancelReason}` : ""}`,
//             type:    "order",
//             metadata: { orderId: order._id },
//         });

//         res.status(200).json({ success: true, message: "Order cancelled successfully", data: order });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error cancelling order", error: error.message });
//     }
// };

// // @desc    Update delivery slot or scheduled date (only if still pending)
// // @route   PATCH /api/orders/:id/reschedule
// // @access  Private
// export const rescheduleOrder = async (req, res) => {
//     try {
//         const { deliverySlot, scheduledDate } = req.body;

//         const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
//         if (!order) {
//             return res.status(404).json({ success: false, message: "Order not found" });
//         }
//         if (order.status !== "pending") {
//             return res.status(400).json({ success: false, message: "Only pending orders can be rescheduled" });
//         }

//         if (deliverySlot) order.deliverySlot  = deliverySlot;
//         if (scheduledDate) order.scheduledDate = new Date(scheduledDate);
//         await order.save();

//         res.status(200).json({ success: true, message: "Order rescheduled successfully", data: order });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error rescheduling order", error: error.message });
//     }
// };

// // ─── Admin / Dairy Owner ──────────────────────────────────────────────────────

// // @desc    Get all orders for a specific dairy (dairy owner)
// // @route   GET /api/orders/dairy/:dairyId
// // @access  Private (dairy owner)
// export const getOrdersByDairy = async (req, res) => {
//     try {
//         const { status, page = 1, limit = 20 } = req.query;
//         const query = { dairy: req.params.dairyId };
//         if (status) query.status = status;

//         const [orders, total] = await Promise.all([
//             Order.find(query)
//                 .populate("userId",          "username email phone")
//                 .populate("milkType",        "name type packaging unit")
//                 .populate("deliveryAddress")
//                 .sort({ scheduledDate: 1 })
//                 .skip((page - 1) * limit)
//                 .limit(Number(limit)),
//             Order.countDocuments(query),
//         ]);

//         res.status(200).json({ success: true, count: orders.length, total, page: Number(page), data: orders });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error fetching dairy orders", error: error.message });
//     }
// };

// // @desc    Update order status (dairy owner / admin)
// // @route   PATCH /api/orders/:id/status
// // @access  Private (dairy owner / admin)
// export const updateOrderStatus = async (req, res) => {
//     try {
//         const { status, cancelReason } = req.body;

//         const allowedStatuses = ["pending", "confirmed", "out_for_delivery", "delivered", "cancelled"];
//         if (!allowedStatuses.includes(status)) {
//             return res.status(400).json({ success: false, message: "Invalid status value" });
//         }

//         const order = await Order.findById(req.params.id).populate("userId", "username email phone fcmToken");
//         if (!order) {
//             return res.status(404).json({ success: false, message: "Order not found" });
//         }

//         // Dairy owners may only update orders placed against their own
//         // dairy — this wasn't being checked anywhere before (route had no
//         // role restriction and the controller had no ownership check).
//         if (req.user.role === "dairyOwner") {
//             const ownsDairy = await Dairy.findOne({ _id: order.dairy, owner: req.user._id });
//             if (!ownsDairy) {
//                 return res.status(403).json({ success: false, message: "Not authorized to update this order" });
//             }
//         }

//         // -----------------------------------------
//         // CANCELLED ORDER CANNOT BE REOPENED
//         // -----------------------------------------
//         if (order.status === "cancelled") {
//             return res.status(400).json({
//                 success: false,
//                 message: "Cancelled order cannot be updated"
//             });
//         }

//         // -----------------------------------------
//         // DELIVERED ORDER CANNOT BE CHANGED
//         // -----------------------------------------
//         if (order.status === "delivered") {
//             return res.status(400).json({
//                 success: false,
//                 message: "Delivered order cannot be updated"
//             });
//         }

//         // Same status
//         if (order.status === status) {
//             return res.status(400).json({
//                 success: false,
//                 message: `Order is already '${status}'`
//             });
//         }


//         order.status = status;
//         if (status === "cancelled" && cancelReason) order.cancelReason = cancelReason || "Cancelled by dairy";
//         await order.save();

//         // Notify user about status change
//         const statusMessages = {
//             confirmed:        `Your order #${order._id} has been confirmed!`,
//             "out_for_delivery": `Your order #${order._id} is out for delivery. Expect it soon!`,
//             delivered:        `Your order #${order._id} has been delivered. Enjoy your milk!`,
//             cancelled:        `Your order #${order._id} has been cancelled.${cancelReason ? ` Reason: ${cancelReason}` : ""}`,
//         };

//         if (order.userId && statusMessages[status]) {
//             await notificationService.notifyAll({
//                 user:    order.userId,
//                 subject: `Order ${status.replace(/_/g, " ")} - WishMilk`,
//                 message: statusMessages[status],
//                 type:    "order",
//                 metadata: { orderId: order._id, status },
//             });
//         }

//         res.status(200).json({ success: true, message: `Order status updated to '${status}'`, data: order });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error updating order status", error: error.message });
//     }
// };

// // @desc    Link a transaction to an order after payment
// // @route   PATCH /api/orders/:id/payment
// // @access  Private
// export const linkPaymentToOrder = async (req, res) => {
//     try {
//         const { transactionId } = req.body;

//         const order = await Order.findOneAndUpdate(
//             { _id: req.params.id, userId: req.user._id },
//             { paymentId: transactionId, paymentStatus: "paid" },
//             { returnDocument: "after", runValidators: true },
            
//         );

//         if (!order) {
//             return res.status(404).json({ success: false, message: "Order not found" });
//         }

//         res.status(200).json({ success: true, message: "Payment linked to order", data: order });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error linking payment", error: error.message });
//     }
// };     







import Order from "../models/order.js";
import Milk from "../models/milk.js";
import Dairy from "../models/dairy.js";
import Coupon from "../models/coupon.js";
import notificationService from "../services/notificationService.js";
import { evaluateCoupon, splitDiscount } from "../services/couponService.js";
import { runInTransaction } from "../utils/transaction.js";

// Thrown for expected, user-facing failures inside the checkout transaction.
class CheckoutError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
    try {
        const { dairy, milkType, quantity, deliveryAddress, deliverySlot, scheduledDate, couponCode } = req.body;

        if (!dairy || !milkType || !quantity || !deliveryAddress || !scheduledDate) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
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

        // The server computes the real price here — a client-sent
        // totalPrice is never trusted. This is also where any coupon is
        // actually validated and redeemed, atomically with the order
        // itself, instead of relying on separate apply/redeem calls the
        // client could skip or tamper with.
        const subtotal = Math.round(pricing.price * quantity * 100) / 100;
        let discountAmount = 0;
        let appliedCouponCode;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
            if (!coupon) {
                return res.status(400).json({ success: false, message: "Invalid or inactive coupon" });
            }
            if (new Date() > coupon.expiresAt) {
                return res.status(400).json({ success: false, message: "Coupon has expired" });
            }
            if (subtotal < coupon.minOrderAmount) {
                return res.status(400).json({
                    success: false,
                    message: `Minimum order amount for this coupon is ${coupon.minOrderAmount}`,
                });
            }
            if (coupon.usedCount >= coupon.usageLimit) {
                return res.status(400).json({ success: false, message: "Coupon usage limit has been reached" });
            }
            const userUsage = coupon.usedBy.find((u) => u.user.toString() === req.user._id.toString());
            if (userUsage && userUsage.usedCount >= coupon.perUserLimit) {
                return res.status(400).json({
                    success: false,
                    message: "You've already used this coupon the maximum number of times",
                });
            }

            discountAmount =
                coupon.discountType === "percentage" ? (subtotal * coupon.discountValue) / 100 : coupon.discountValue;
            if (coupon.discountType === "percentage") {
                discountAmount = Math.min(discountAmount, coupon.maxDiscount);
            }
            discountAmount = Math.min(discountAmount, subtotal);
            appliedCouponCode = coupon.code;

            if (userUsage) {
                userUsage.usedCount += 1;
                userUsage.usedAt = new Date();
            } else {
                coupon.usedBy.push({ user: req.user._id, usedCount: 1, usedAt: new Date() });
            }
            coupon.usedCount += 1;
            if (coupon.usedCount >= coupon.usageLimit) coupon.isActive = false;
            await coupon.save();
        }

        const totalPrice = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);

        const order = await Order.create({
            userId:          req.user._id,
            dairy,
            milkType,
            quantity,
            totalPrice,
            couponCode:      appliedCouponCode,
            discountAmount,
            deliveryAddress,
            deliverySlot:    deliverySlot || "morning",
            scheduledDate:   new Date(scheduledDate),
            status:          "pending",
            paymentStatus:   "pending",
        });

        await notificationService.notifyAll({
            user:    req.user,
            subject: "Order Placed - WishMilk",
            message: `Your order #${order._id} has been placed successfully! Delivery scheduled for ${new Date(scheduledDate).toDateString()} (${deliverySlot || "morning"}).`,
            type:    "order",
            metadata: { orderId: order._id },
        });

        res.status(201).json({ success: true, message: "Order placed successfully", data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error placing order", error: error.message });
    }
};

// @desc    Place every item in a cart at once. Each item becomes its own
//          order (they can come from different dairies), but a coupon is
//          checked against the WHOLE cart total and its discount is shared
//          across the orders in proportion to their value. Everything —
//          coupon redemption and all orders — commits together or not at all.
// @route   POST /api/orders/checkout
// @access  Private
// body: { items: [{ dairy, milkType, quantity }], deliveryAddress,
//         deliverySlot, scheduledDate, couponCode? }
export const createCartOrders = async (req, res) => {
    try {
        const { items, deliveryAddress, deliverySlot, scheduledDate, couponCode } = req.body;

        if (!Array.isArray(items) || items.length === 0 || !deliveryAddress || !scheduledDate) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        if (items.length > 25) {
            return res.status(400).json({ success: false, message: "Too many items in one checkout" });
        }

        // Price every line on the server — client prices are never trusted.
        const lines = [];
        for (const item of items) {
            const { dairy, milkType, quantity } = item || {};
            if (!dairy || !milkType || !Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
                return res.status(400).json({ success: false, message: "Each item needs a dairy, milk product and quantity" });
            }
            const milk = await Milk.findById(milkType);
            if (!milk) return res.status(404).json({ success: false, message: "A milk product in your cart was not found" });
            if (!milk.inStock) {
                return res.status(400).json({ success: false, message: `${milk.name || "A milk product"} is currently out of stock` });
            }
            const dairyDoc = await Dairy.findById(dairy);
            if (!dairyDoc) return res.status(404).json({ success: false, message: "A dairy in your cart was not found" });
            const pricing = dairyDoc.milkPricing.find((p) => p.type === milk.type);
            if (!pricing) {
                return res.status(400).json({ success: false, message: "A dairy in your cart hasn't set a price for that milk type" });
            }
            lines.push({
                dairy,
                milkType,
                quantity: Number(quantity),
                subtotal: Math.round(pricing.price * Number(quantity) * 100) / 100,
            });
        }

        const cartSubtotal = Math.round(lines.reduce((sum, l) => sum + l.subtotal, 0) * 100) / 100;

        const createdOrders = await runInTransaction(async (session) => {
            let shares = lines.map(() => 0);
            let appliedCouponCode;

            if (couponCode) {
                const coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase(), isActive: true }).session(session);
                const result = evaluateCoupon(coupon, cartSubtotal, req.user._id);
                if (!result.ok) {
                    throw new CheckoutError(400, result.status === 404 ? "Invalid or inactive coupon" : result.message);
                }
                shares = splitDiscount(lines.map((l) => l.subtotal), result.discount);
                appliedCouponCode = coupon.code;

                // Redeem once, for the whole cart. Inside the transaction,
                // so a failure creating any order below un-redeems it, and
                // two simultaneous checkouts can't both take the last use.
                const userUsage = coupon.usedBy.find((u) => u.user.toString() === req.user._id.toString());
                if (userUsage) {
                    userUsage.usedCount += 1;
                    userUsage.usedAt = new Date();
                } else {
                    coupon.usedBy.push({ user: req.user._id, usedCount: 1, usedAt: new Date() });
                }
                coupon.usedCount += 1;
                if (coupon.usedCount >= coupon.usageLimit) coupon.isActive = false;
                await coupon.save({ session });
            }

            const docs = lines.map((l, i) => ({
                userId:         req.user._id,
                dairy:          l.dairy,
                milkType:       l.milkType,
                quantity:       l.quantity,
                totalPrice:     Math.max(0, Math.round((l.subtotal - shares[i]) * 100) / 100),
                couponCode:     appliedCouponCode,
                discountAmount: shares[i],
                deliveryAddress,
                deliverySlot:   deliverySlot || "morning",
                scheduledDate:  new Date(scheduledDate),
                status:         "pending",
                paymentStatus:  "pending",
            }));
            return Order.create(docs, { session, ordered: true });
        });

        // Notifications are best-effort: the orders already exist, so a
        // failed message must not turn a successful checkout into an error.
        for (const order of createdOrders) {
            try {
                await notificationService.notifyAll({
                    user:    req.user,
                    subject: "Order Placed - WishMilk",
                    message: `Your order #${order._id} has been placed successfully! Delivery scheduled for ${new Date(scheduledDate).toDateString()} (${deliverySlot || "morning"}).`,
                    type:    "order",
                    metadata: { orderId: order._id },
                });
            } catch (e) {
                console.error("[orders] notification failed for order " + order._id + ":", e.message);
            }
        }

        const discount = Math.round(createdOrders.reduce((sum, o) => sum + (o.discountAmount || 0), 0) * 100) / 100;
        res.status(201).json({
            success: true,
            message: createdOrders.length > 1 ? "Orders placed successfully" : "Order placed successfully",
            data: {
                orders: createdOrders,
                cartSubtotal,
                discount,
                total: Math.round((cartSubtotal - discount) * 100) / 100,
                couponCode: createdOrders[0] ? createdOrders[0].couponCode : undefined,
            },
        });
    } catch (error) {
        if (error instanceof CheckoutError) {
            return res.status(error.status).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: "Error placing orders", error: error.message });
    }
};

// @desc    Get all orders of logged-in user
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const query = { userId: req.user._id };
        if (status) query.status = status;

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate("dairy",           "name image phone")
                .populate("milkType",        "name type packaging unit")
                .populate("deliveryAddress")
                .populate("paymentId",       "razorPayPaymentId amount status")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(Number(limit)),
            Order.countDocuments(query),
        ]);

        res.status(200).json({ success: true, count: orders.length, total, page: Number(page), data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching orders", error: error.message });
    }
};

// @desc    Get a single order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, userId: req.user._id })
            .populate("dairy",           "name image email phone location")
            .populate("milkType",        "name type fatPercentage packaging unit")
            .populate("deliveryAddress")
            .populate("paymentId",       "razorPayPaymentId amount status method paidAt");

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching order", error: error.message });
    }
};

// @desc    Cancel an order (user can only cancel if still pending)
// @route   PATCH /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
    try {
        const { cancelReason } = req.body;

        const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        if (!["pending", "confirmed"].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: `Order cannot be cancelled at '${order.status}' stage`,
            });
        }

        order.status       = "cancelled";
        order.cancelReason = cancelReason || "Cancelled by user";
        await order.save();

        await notificationService.notifyAll({
            user:    req.user,
            subject: "Order Cancelled - WishMilk",
            message: `Your order #${order._id} has been cancelled.${cancelReason ? ` Reason: ${cancelReason}` : ""}`,
            type:    "order",
            metadata: { orderId: order._id },
        });

        res.status(200).json({ success: true, message: "Order cancelled successfully", data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error cancelling order", error: error.message });
    }
};

// @desc    Update delivery slot or scheduled date (only if still pending)
// @route   PATCH /api/orders/:id/reschedule
// @access  Private
export const rescheduleOrder = async (req, res) => {
    try {
        const { deliverySlot, scheduledDate } = req.body;

        const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        if (order.status !== "pending") {
            return res.status(400).json({ success: false, message: "Only pending orders can be rescheduled" });
        }

        if (deliverySlot) order.deliverySlot  = deliverySlot;
        if (scheduledDate) order.scheduledDate = new Date(scheduledDate);
        await order.save();

        res.status(200).json({ success: true, message: "Order rescheduled successfully", data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error rescheduling order", error: error.message });
    }
};

// ─── Admin / Dairy Owner ──────────────────────────────────────────────────────

// @desc    Get all orders for a specific dairy (dairy owner)
// @route   GET /api/orders/dairy/:dairyId
// @access  Private (dairy owner)
export const getOrdersByDairy = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = { dairy: req.params.dairyId };
        if (status) query.status = status;

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate("userId",          "username email phone")
                .populate("milkType",        "name type packaging unit")
                .populate("deliveryAddress")
                .sort({ scheduledDate: 1 })
                .skip((page - 1) * limit)
                .limit(Number(limit)),
            Order.countDocuments(query),
        ]);

        res.status(200).json({ success: true, count: orders.length, total, page: Number(page), data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching dairy orders", error: error.message });
    }
};

// @desc    Update order status (dairy owner / admin)
// @route   PATCH /api/orders/:id/status
// @access  Private (dairy owner / admin)
export const updateOrderStatus = async (req, res) => {
    try {
        const { status, cancelReason } = req.body;

        const allowedStatuses = ["pending", "confirmed", "out_for_delivery", "delivered", "cancelled"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }

        const order = await Order.findById(req.params.id).populate("userId", "username email phone fcmToken");
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Dairy owners may only update orders placed against their own
        // dairy — this wasn't being checked anywhere before (route had no
        // role restriction and the controller had no ownership check).
        if (req.user.role === "dairyOwner") {
            const ownsDairy = await Dairy.findOne({ _id: order.dairy, owner: req.user._id });
            if (!ownsDairy) {
                return res.status(403).json({ success: false, message: "Not authorized to update this order" });
            }
        }

        order.status = status;
        if (status === "cancelled" && cancelReason) order.cancelReason = cancelReason;
        await order.save();

        // Notify user about status change
        const statusMessages = {
            confirmed:        `Your order #${order._id} has been confirmed!`,
            out_for_delivery: `Your order #${order._id} is out for delivery. Expect it soon!`,
            delivered:        `Your order #${order._id} has been delivered. Enjoy your milk!`,
            cancelled:        `Your order #${order._id} has been cancelled.${cancelReason ? ` Reason: ${cancelReason}` : ""}`,
        };

        if (order.userId && statusMessages[status]) {
            await notificationService.notifyAll({
                user:    order.userId,
                subject: `Order ${status.replace("_", " ")} - WishMilk`,
                message: statusMessages[status],
                type:    "order",
                metadata: { orderId: order._id, status },
            });
        }

        res.status(200).json({ success: true, message: `Order status updated to '${status}'`, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating order status", error: error.message });
    }
};

// @desc    Link a transaction to an order after payment
// @route   PATCH /api/orders/:id/payment
// @access  Private
export const linkPaymentToOrder = async (req, res) => {
    try {
        const { transactionId } = req.body;

        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { paymentId: transactionId, paymentStatus: "paid" },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({ success: true, message: "Payment linked to order", data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error linking payment", error: error.message });
    }
};