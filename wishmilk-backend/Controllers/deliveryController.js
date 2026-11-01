// import Delivery from '../models/delivery.js';
// import Order from '../models/order.js';
// import Dairy from '../models/dairy.js';
// import User from '../models/user.js';
// import Notification from '../models/notification.js';

// async function canManageDelivery(user, delivery) {
//     if (user.role === "admin") return true;
//     if (user.role === "dairyOwner") {
//         const owns = await Dairy.findOne({ _id: delivery.dairy, owner: user._id });
//         return !!owns;
//     }
//     if (user.role === "deliveryPerson") {
//         return delivery.assignedRider && delivery.assignedRider.toString() === user._id.toString();
//     }
//     return false;
// }


// const MAX_ACTIVE_DELIVERIES = 3;
// const ACTIVE_DELIVERY_STATUSES = ["assigned", "picked-up", "out-for-delivery"];

// // Finds the closest AVAILABLE rider to a point, out of all approved
// // riders. "Available" means both: has shared a location, and isn't
// // already juggling too many active deliveries — a rider 2km away with
// // zero deliveries is a better match than one 200m away already carrying
// // three. Checks the 5 nearest candidates and picks the first one under
// // the load threshold; if all 5 are overloaded, falls back to the single
// // nearest anyway (an overloaded rider still beats no rider at all).
// // Never throws — returns null if nobody qualifies.
// async function findNearestRider(coordinates, excludeRiderIds) {
//     excludeRiderIds = excludeRiderIds || [];
//     if (!coordinates) return null;
//     try {
//         const candidates = await User.find({
//             role: "deliveryPerson",
//             riderStatus: "approved",
//             isOnline: true,
//             _id: { $nin: excludeRiderIds },
//             currentLocation: { $exists: true, $ne: null },
//             "currentLocation.coordinates": { $exists: true, $ne: [] }
//         }).where("currentLocation").near({
//             center: { type: "Point", coordinates: coordinates }
//         }).limit(5);

//         if (candidates.length === 0) return null;

//         for (const candidate of candidates) {
//             const activeCount = await Delivery.countDocuments({
//                 assignedRider: candidate._id,
//                 riderConfirmed: true,
//                 status: { $in: ACTIVE_DELIVERY_STATUSES }
//             });
//             if (activeCount < MAX_ACTIVE_DELIVERIES) {
//                 return candidate;
//             }
//         }

//         // Everyone nearby is at capacity — better to over-assign the
//         // closest one than leave the delivery with no rider at all.
//         return candidates[0];
//     } catch (e) {
//         return null;
//     }
// }

// async function notifyRider(riderId, opts) {
//     await Notification.create({
//         user: riderId,
//         type: "delivery",
//         channel: "push",
//         title: opts.title,
//         message: opts.message,
//         status: "pending",
//         metadata: { deliveryId: opts.deliveryId }
//     });
// }

// export const createDelivery = async (req, res) => {
//     try {
//         const orderId = req.body.orderId;
//         const estimatedDelivery = req.body.estimatedDelivery;
//         const assignedRider = req.body.assignedRider;
//         if (!orderId) {
//             return res.status(400).json({ success: false, message: "Order ID is required" });
//         }
//         const order = await Order.findById(orderId);
//         if (!order) {
//             return res.status(404).json({ success: false, message: "Order not found" });
//         }

//         if (req.user.role === "dairyOwner") {
//             const ownsDairy = await Dairy.findOne({ _id: order.dairy, owner: req.user._id });
//             if (!ownsDairy) {
//                 return res.status(403).json({ success: false, message: "Not authorized for this order's dairy" });
//             }
//         }

//         const existing = await Delivery.findOne({ order: orderId });
//         if (existing) {
//             return res.status(400).json({ success: false, message: "Delivery already exists for this order" });
//         }

//         let rider = null;
//         if (assignedRider) {
//             rider = await User.findOne({ _id: assignedRider, role: "deliveryPerson", riderStatus: "approved" });
//             if (!rider) {
//                 return res.status(400).json({ success: false, message: "That rider doesn't exist or isn't approved yet" });
//             }
//         } else {
//             const dairy = await Dairy.findById(order.dairy);
//             const dairyCoords = dairy && dairy.location ? dairy.location.coordinates : null;
//             rider = await findNearestRider(dairyCoords);
//         }

//         const timeLine = [{ status: 'pending', message: 'Order is received and being prepared' }];
//         if (rider) {
//             timeLine.push({
//                 status: 'assigned',
//                 message: "Assigned to " + (rider.username ? rider.username.firstName : "a rider") + " - awaiting confirmation"
//             });
//         }

//         const delivery = await Delivery.create({
//             order: orderId,
//             user: order.userId,
//             dairy: order.dairy,
//             estimatedDelivery: estimatedDelivery,
//             assignedRider: rider ? rider._id : undefined,
//             riderConfirmed: false,
//             status: rider ? 'assigned' : 'pending',
//             timeLine: timeLine
//         });

//         if (rider) {
//             try {
//                 await notifyRider(rider._id, {
//                     title: "New delivery request",
//                     message: "You've been matched to a nearby delivery - please confirm or decline it in My Deliveries.",
//                     deliveryId: delivery._id
//                 });
//             } catch (e) {}
//         }

//         res.status(201).json({ success: true, message: "Delivery created successfully", data: delivery });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Failed to create delivery", error: error.message });
//     }
// };

// export const assignRider = async (req, res) => {
//     try {
//         const riderId = req.body.riderId;
//         if (!riderId) {
//             return res.status(400).json({ success: false, message: "riderId is required" });
//         }

//         const delivery = await Delivery.findById(req.params.id);
//         if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

//         const order = await Order.findById(delivery.order);

//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Order not found"
//             });
//         }

//         // Check if the order is cancelled before assigning a rider
//         if (order.status === "cancelled") {
//             return res.status(400).json({
//                 success: false,
//                 message: "Cannot assign rider to a cancelled order"
//             });
//         }

//         if (req.user.role === "dairyOwner") {
//             const owns = await Dairy.findOne({ _id: delivery.dairy, owner: req.user._id });
//             if (!owns) return res.status(403).json({ success: false, message: "Not authorized for this delivery" });
//         } else if (req.user.role !== "admin") {
//             return res.status(403).json({ success: false, message: "Not authorized" });
//         }

//         const rider = await User.findOne({ _id: riderId, role: "deliveryPerson", riderStatus: "approved" });
//         if (!rider) {
//             return res.status(400).json({ success: false, message: "That rider doesn't exist or isn't approved yet" });
//         }

//         delivery.assignedRider = riderId;
//         delivery.riderConfirmed = false;
//         if (delivery.status === "pending") delivery.status = "assigned";
//         delivery.timeLine.push({
//             status: "assigned",
//             message: "Assigned to " + (rider.username ? rider.username.firstName : "a rider") + " - awaiting confirmation"
//         });
//         await delivery.save();

//         try {
//             await notifyRider(rider._id, {
//                 title: "New delivery request",
//                 message: "You've been assigned a delivery - please confirm or decline it in My Deliveries.",
//                 deliveryId: delivery._id
//             });
//         } catch (e) {}

//         res.status(200).json({ success: true, message: "Rider assigned", data: delivery });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error assigning rider", error: error.message });
//     }
// };

// export const confirmDelivery = async (req, res) => {
//     try {
//         const delivery = await Delivery.findById(req.params.id);
//         if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

//         if (!delivery.assignedRider || delivery.assignedRider.toString() !== req.user._id.toString()) {
//             return res.status(403).json({ success: false, message: "This delivery isn't assigned to you" });
//         }

//         delivery.riderConfirmed = true;
//         delivery.timeLine.push({ status: delivery.status, message: "Rider confirmed the assignment" });
//         await delivery.save();

//         res.status(200).json({ success: true, message: "Delivery confirmed", data: delivery });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error confirming delivery", error: error.message });
//     }
// };

// export const declineDelivery = async (req, res) => {
//     try {
//         const delivery = await Delivery.findById(req.params.id);
//         if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

//         if (!delivery.assignedRider || delivery.assignedRider.toString() !== req.user._id.toString()) {
//             return res.status(403).json({ success: false, message: "This delivery isn't assigned to you" });
//         }

//         const decliningRiderId = delivery.assignedRider;
//         const dairy = await Dairy.findById(delivery.dairy);
//         const dairyCoords = dairy && dairy.location ? dairy.location.coordinates : null;
//         const nextRider = await findNearestRider(dairyCoords, [decliningRiderId]);

//         delivery.timeLine.push({ status: delivery.status, message: "Rider declined the assignment" });

//         if (nextRider) {
//             delivery.assignedRider = nextRider._id;
//             delivery.riderConfirmed = false;
//             delivery.timeLine.push({
//                 status: "assigned",
//                 message: "Reassigned to " + (nextRider.username ? nextRider.username.firstName : "another rider") + " - awaiting confirmation"
//             });
//             await delivery.save();
//             try {
//                 await notifyRider(nextRider._id, {
//                     title: "New delivery request",
//                     message: "You've been matched to a nearby delivery - please confirm or decline it in My Deliveries.",
//                     deliveryId: delivery._id
//                 });
//             } catch (e) {}
//         } else {
//             delivery.assignedRider = undefined;
//             delivery.riderConfirmed = false;
//             delivery.status = "pending";
//             await delivery.save();
//             if (dairy && dairy.owner) {
//                 try {
//                     await notifyRider(dairy.owner, {
//                         title: "Delivery needs a rider",
//                         message: "A rider declined and no one else is available nearby - please assign one manually.",
//                         deliveryId: delivery._id
//                     });
//                 } catch (e) {}
//             }
//         }

//         res.status(200).json({ success: true, message: "Delivery declined", data: delivery });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error declining delivery", error: error.message });
//     }
// };

// export const getDeliveryByOrder = async (req, res) => {
//     try {
//         const delivery = await Delivery.findOne({ order: req.params.orderId })
//             .populate("order", "status totalPrice scheduledDate deliverySlot")
//             .populate("dairy", "name phone owner")
//             .populate("assignedRider", "username phone");

        
//         if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

//         const isOwnOrder = delivery.user.toString() === req.user._id.toString();
//         const isAssignedRider = delivery.assignedRider && delivery.assignedRider._id.toString() === req.user._id.toString();
//         const isOwningDairy = req.user.role === "dairyOwner" && delivery.dairy && delivery.dairy.owner && delivery.dairy.owner.toString() === req.user._id.toString();

//         if (!isOwnOrder && !isAssignedRider && !isOwningDairy && req.user.role !== "admin") {
//             return res.status(403).json({ success: false, message: "Not authorized to view this delivery" });
//         }

//         res.status(200).json({ success: true, data: delivery });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error fetching delivery", error: error.message });
//     }
// };

// export const updateDeliveryStatus = async (req, res) => {
//     try {
//         const status = req.body.status;
//         const message = req.body.message;
//         const failureReason = req.body.failureReason;
//         const allowedStatuses = ["pending", "assigned", "picked-up", "out-for-delivery", "delivered", "failed"];

//         if (allowedStatuses.indexOf(status) === -1) {
//             return res.status(400).json({ success: false, message: "Invalid status" });
//         }

//         const delivery = await Delivery.findById(req.params.id);
//         if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

//         const allowed = await canManageDelivery(req.user, delivery);
//         if (!allowed) {
//             return res.status(403).json({ success: false, message: "Not authorized to update this delivery" });
//         }

//         // Dispatch states (assigned, picked-up, out-for-delivery) are the
//         // owner's call, but the final outcome — actually delivered, or
//         // failed — belongs to whoever is physically there. The owner's
//         // job ends once it's out for delivery.
//         if (req.user.role === "dairyOwner" && ["delivered", "failed"].includes(status)) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Only the assigned rider can mark a delivery as delivered or failed"
//             });
//         }

//         if (req.user.role === "deliveryPerson" && !delivery.riderConfirmed) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please confirm or decline this delivery before updating its status"
//             });
//         }

//         delivery.status = status;
//         delivery.timeLine.push({ status: status, message: message || status.replace(/-/g, " "), timestamp: new Date() });

//         if (status === "delivered") {
//             delivery.deliveredAt = new Date();
//             await Order.findByIdAndUpdate(delivery.order, { status: "delivered" });
//         }
//         if (status === "failed" && failureReason) delivery.failureReason = failureReason;

//         await delivery.save();
//         res.status(200).json({ success: true, message: "Delivery status updated", data: delivery });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error updating delivery", error: error.message });
//     }
// };

// export const updateLiveLocation = async (req, res) => {
//     try {
//         const coordinates = req.body.coordinates;
//         if (!coordinates || coordinates.length !== 2) {
//             return res.status(400).json({ success: false, message: "Valid coordinates [lng, lat] required" });
//         }

//         const delivery = await Delivery.findById(req.params.id);
//         if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

//         const allowed = await canManageDelivery(req.user, delivery);
//         if (!allowed) {
//             return res.status(403).json({ success: false, message: "Not authorized to update this delivery" });
//         }

//         delivery.currentLocation = { type: "Point", coordinates: coordinates };
//         await delivery.save();

//         res.status(200).json({ success: true, data: { currentLocation: delivery.currentLocation } });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error updating location", error: error.message });
//     }
// };

// export const getTimeline = async (req, res) => {
//     try {
//         const delivery = await Delivery.findById(req.params.id)
//             .select("timeLine status estimatedDelivery deliveredAt user assignedRider dairy");
//         if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

//         const isOwnOrder = delivery.user.toString() === req.user._id.toString();
//         const canManage = await canManageDelivery(req.user, delivery);
//         if (!isOwnOrder && !canManage) {
//             return res.status(403).json({ success: false, message: "Not authorized to view this delivery" });
//         }

//         res.status(200).json({ success: true, data: delivery });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error fetching timeline", error: error.message });
//     }
// };

// export const getMyDeliveries = async (req, res) => {
//     try {
//         const status = req.query.status;
//         const filter = { assignedRider: req.user._id };
//         if (status) filter.status = status;

//         const deliveries = await Delivery.find(filter)
//             .populate({
//                 path: "order",
//                 select: "milkType quantity deliveryAddress deliverySlot scheduledDate totalPrice",
//                 populate: [
//                     { path: "milkType", select: "name unit" },
//                     { path: "deliveryAddress", select: "label fullAddress" }
//                 ]
//             })
//             .sort({ createdAt: -1 });

//         res.status(200).json({ success: true, count: deliveries.length, data: deliveries });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error fetching your deliveries", error: error.message });
//     }
// };



import mongoose from 'mongoose';
import Delivery from '../models/delivery.js';
import Order from '../models/order.js';
import Dairy from '../models/dairy.js';
import User from '../models/user.js';
import Notification from '../models/notification.js';
import Payment from '../models/payment.js';

// ─── Small shared helpers ────────────────────────────────────────

// Thrown for expected, user-facing failures (bad state, not allowed...).
// Anything else that reaches a handler's catch is a real 500.
class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

function logError(context, error) {
    console.error("[delivery] " + context + ":", error && error.message ? error.message : error);
}

function sendError(res, error, fallbackMessage) {
    if (error instanceof HttpError) {
        return res.status(error.status).json({ success: false, message: error.message });
    }
    if (error && error.code === 11000) {
        return res.status(409).json({ success: false, message: "Delivery already exists for this order" });
    }
    logError(fallbackMessage, error);
    return res.status(500).json({ success: false, message: fallbackMessage, error: error.message });
}

// Notifications are best-effort: a failed push must never undo or fail the
// delivery change that triggered it, but it must not vanish silently either.
async function safeNotify(riderId, opts) {
    try {
        await notifyRider(riderId, opts);
    } catch (e) {
        logError("notification to " + riderId + " failed", e);
    }
}

// Runs `work(session)` inside a MongoDB transaction so the order, payment
// and delivery writes commit together or not at all. Transactions need a
// replica set (Atlas always is one). On a standalone local mongod they are
// unsupported, so in that one case the work runs without a session — every
// write inside is conditional/idempotent and ordered so a retry repairs a
// half-finished run.
async function runInTransaction(work) {
    const session = await mongoose.startSession();
    try {
        let result;
        await session.withTransaction(async () => {
            result = await work(session);
        });
        return result;
    } catch (error) {
        const msg = String((error && error.message) || "");
        if (/Transaction numbers are only allowed|replica set|does not support transactions/i.test(msg)) {
            console.warn("[delivery] transactions unsupported by this MongoDB deployment — running without one");
            return work(null);
        }
        throw error;
    } finally {
        await session.endSession();
    }
}

async function canManageDelivery(user, delivery) {
    if (user.role === "admin") return true;
    if (user.role === "dairyOwner") {
        const owns = await Dairy.findOne({ _id: delivery.dairy, owner: user._id });
        return !!owns;
    }
    if (user.role === "deliveryPerson") {
        return !!delivery.assignedRider && delivery.assignedRider.toString() === user._id.toString();
    }
    return false;
}

// ─── Status rules ────────────────────────────────────────────────

// Which status a delivery may move to from each current status. delivered
// and failed are final.
const STATUS_TRANSITIONS = {
    "pending": ["assigned"],
    "assigned": ["picked-up", "failed"],
    "picked-up": ["out-for-delivery", "failed"],
    "out-for-delivery": ["delivered", "failed"],
    "delivered": [],
    "failed": []
};

// Which statuses each role may set. Dispatch states are the owner's call;
// the final outcome (delivered / failed) belongs to whoever is physically
// there. Admin can set any state the transition table permits.
const ROLE_ALLOWED_TARGETS = {
    dairyOwner: ["assigned", "picked-up", "out-for-delivery"],
    deliveryPerson: ["picked-up", "out-for-delivery", "delivered", "failed"],
    admin: Object.keys(STATUS_TRANSITIONS)
};

const FINAL_STATUSES = ["delivered", "failed"];

function assertOrderOpen(order) {
    if (!order) throw new HttpError(404, "Order not found");
    if (order.status === "cancelled") {
        throw new HttpError(400, "This order was cancelled, so its delivery can't be changed");
    }
}

// ─── Rider capacity ──────────────────────────────────────────────

const MAX_ACTIVE_DELIVERIES = 3;
const ACTIVE_DELIVERY_STATUSES = ["assigned", "picked-up", "out-for-delivery"];
const NEAREST_CANDIDATES = 20;

// Counts everything currently on a rider's plate, including assignments
// they haven't accepted yet — otherwise unanswered requests could pile up
// past the limit.
async function activeDeliveryCount(riderId, excludeDeliveryId) {
    const filter = { assignedRider: riderId, status: { $in: ACTIVE_DELIVERY_STATUSES } };
    if (excludeDeliveryId) filter._id = { $ne: excludeDeliveryId };
    return Delivery.countDocuments(filter);
}

// Finds the closest AVAILABLE rider to a point, out of all approved,
// online riders that have shared a location. MAX_ACTIVE_DELIVERIES is a
// hard cap: walks the nearest candidates in distance order and returns the
// first one under the cap. If every candidate is full (or nobody qualifies)
// it returns null and the owner is asked to assign someone manually.
// Never throws — a database failure is logged and treated as "no rider".
async function findNearestRider(coordinates, excludeRiderIds) {
    excludeRiderIds = excludeRiderIds || [];
    if (!coordinates) return null;
    try {
        const candidates = await User.find({
            role: "deliveryPerson",
            riderStatus: "approved",
            isOnline: true,
            _id: { $nin: excludeRiderIds },
            currentLocation: { $exists: true, $ne: null },
            "currentLocation.coordinates": { $exists: true, $ne: [] }
        }).where("currentLocation").near({
            center: { type: "Point", coordinates: coordinates }
        }).limit(NEAREST_CANDIDATES);

        for (const candidate of candidates) {
            if (await activeDeliveryCount(candidate._id) < MAX_ACTIVE_DELIVERIES) {
                return candidate;
            }
        }
        return null;
    } catch (e) {
        logError("findNearestRider failed", e);
        return null;
    }
}

async function notifyRider(riderId, opts) {
    await Notification.create({
        user: riderId,
        type: "delivery",
        channel: "push",
        title: opts.title,
        message: opts.message,
        status: "pending",
        metadata: { deliveryId: opts.deliveryId }
    });
}

// Validates a GeoJSON-order [longitude, latitude] pair.
function validCoordinates(coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) return false;
    const lng = coordinates[0];
    const lat = coordinates[1];
    return typeof lng === "number" && typeof lat === "number" &&
        Number.isFinite(lng) && Number.isFinite(lat) &&
        lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
}

export const createDelivery = async (req, res) => {
    try {
        const orderId = req.body.orderId;
        const estimatedDelivery = req.body.estimatedDelivery;
        const assignedRider = req.body.assignedRider;
        if (!orderId) {
            return res.status(400).json({ success: false, message: "Order ID is required" });
        }
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        if (order.status === "cancelled") {
            return res.status(400).json({ success: false, message: "Can't create a delivery for a cancelled order" });
        }
        if (order.status === "delivered") {
            return res.status(400).json({ success: false, message: "This order has already been delivered" });
        }

        if (req.user.role === "dairyOwner") {
            const ownsDairy = await Dairy.findOne({ _id: order.dairy, owner: req.user._id });
            if (!ownsDairy) {
                return res.status(403).json({ success: false, message: "Not authorized for this order's dairy" });
            }
        }

        const existing = await Delivery.findOne({ order: orderId });
        if (existing) {
            return res.status(400).json({ success: false, message: "Delivery already exists for this order" });
        }

        let rider = null;
        if (assignedRider) {
            rider = await User.findOne({ _id: assignedRider, role: "deliveryPerson", riderStatus: "approved" });
            if (!rider) {
                return res.status(400).json({ success: false, message: "That rider doesn't exist or isn't approved yet" });
            }
            if (await activeDeliveryCount(rider._id) >= MAX_ACTIVE_DELIVERIES) {
                return res.status(400).json({
                    success: false,
                    message: "That rider already has " + MAX_ACTIVE_DELIVERIES + " active deliveries"
                });
            }
        } else {
            const dairy = await Dairy.findById(order.dairy);
            const dairyCoords = dairy && dairy.location ? dairy.location.coordinates : null;
            rider = await findNearestRider(dairyCoords);
        }

        const timeLine = [{ status: 'pending', message: 'Order is received and being prepared' }];
        if (rider) {
            timeLine.push({
                status: 'assigned',
                message: "Assigned to " + (rider.username ? rider.username.firstName : "a rider") + " - awaiting confirmation"
            });
        }

        // The unique index on Delivery.order is the real guard against two
        // simultaneous requests; the findOne above is just a friendlier
        // early message. A race loses with E11000, which sendError maps to 409.
        const delivery = await Delivery.create({
            order: orderId,
            user: order.userId,
            dairy: order.dairy,
            estimatedDelivery: estimatedDelivery,
            assignedRider: rider ? rider._id : undefined,
            riderConfirmed: false,
            status: rider ? 'assigned' : 'pending',
            timeLine: timeLine
        });

        if (rider) {
            await safeNotify(rider._id, {
                title: "New delivery request",
                message: "You've been matched to a nearby delivery - please confirm or decline it in My Deliveries.",
                deliveryId: delivery._id
            });
        }

        res.status(201).json({ success: true, message: "Delivery created successfully", data: delivery });
    } catch (error) {
        sendError(res, error, "Failed to create delivery");
    }
};

export const assignRider = async (req, res) => {
    try {
        const riderId = req.body.riderId;
        if (!riderId) {
            return res.status(400).json({ success: false, message: "riderId is required" });
        }

        const delivery = await Delivery.findById(req.params.id);
        if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

        if (req.user.role === "dairyOwner") {
            const owns = await Dairy.findOne({ _id: delivery.dairy, owner: req.user._id });
            if (!owns) return res.status(403).json({ success: false, message: "Not authorized for this delivery" });
        } else if (req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        if (FINAL_STATUSES.includes(delivery.status)) {
            return res.status(400).json({ success: false, message: "This delivery is already " + delivery.status });
        }
        if (delivery.status === "picked-up" || delivery.status === "out-for-delivery") {
            return res.status(400).json({
                success: false,
                message: "This delivery is already in progress and can't be reassigned"
            });
        }

        const order = await Order.findById(delivery.order);
        assertOrderOpen(order);

        const rider = await User.findOne({ _id: riderId, role: "deliveryPerson", riderStatus: "approved" });
        if (!rider) {
            return res.status(400).json({ success: false, message: "That rider doesn't exist or isn't approved yet" });
        }
        if (await activeDeliveryCount(rider._id, delivery._id) >= MAX_ACTIVE_DELIVERIES) {
            return res.status(400).json({
                success: false,
                message: "That rider already has " + MAX_ACTIVE_DELIVERIES + " active deliveries"
            });
        }

        const message = "Assigned to " + (rider.username ? rider.username.firstName : "a rider") + " - awaiting confirmation";
        // Conditional on the status we validated, so a concurrent status
        // change can't be overwritten by this assignment.
        const updated = await Delivery.findOneAndUpdate(
            { _id: delivery._id, status: delivery.status },
            {
                $set: { assignedRider: rider._id, riderConfirmed: false, status: "assigned" },
                $push: { timeLine: { status: "assigned", message: message, timestamp: new Date() } }
            },
            { new: true }
        );
        if (!updated) {
            return res.status(409).json({ success: false, message: "Delivery changed while assigning — please refresh and retry" });
        }

        await safeNotify(rider._id, {
            title: "New delivery request",
            message: "You've been assigned a delivery - please confirm or decline it in My Deliveries.",
            deliveryId: updated._id
        });

        res.status(200).json({ success: true, message: "Rider assigned", data: updated });
    } catch (error) {
        sendError(res, error, "Error assigning rider");
    }
};

export const confirmDelivery = async (req, res) => {
    try {
        const delivery = await Delivery.findById(req.params.id);
        if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

        if (!delivery.assignedRider || delivery.assignedRider.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "This delivery isn't assigned to you" });
        }
        if (delivery.riderConfirmed) {
            return res.status(400).json({ success: false, message: "You've already confirmed this delivery" });
        }
        if (delivery.status !== "assigned") {
            return res.status(400).json({
                success: false,
                message: "This delivery is " + delivery.status + " and can't be confirmed"
            });
        }
        assertOrderOpen(await Order.findById(delivery.order));

        // Atomic: only one confirmation can win, and only while the
        // delivery is still in the state we just validated.
        const updated = await Delivery.findOneAndUpdate(
            { _id: delivery._id, assignedRider: req.user._id, riderConfirmed: false, status: "assigned" },
            {
                $set: { riderConfirmed: true },
                $push: { timeLine: { status: "assigned", message: "Rider confirmed the assignment", timestamp: new Date() } }
            },
            { new: true }
        );
        if (!updated) {
            return res.status(409).json({ success: false, message: "This delivery changed — please refresh" });
        }

        res.status(200).json({ success: true, message: "Delivery confirmed", data: updated });
    } catch (error) {
        sendError(res, error, "Error confirming delivery");
    }
};

export const declineDelivery = async (req, res) => {
    try {
        const delivery = await Delivery.findById(req.params.id);
        if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

        if (!delivery.assignedRider || delivery.assignedRider.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "This delivery isn't assigned to you" });
        }
        // A rider can back out only before pickup. Once the milk is on the
        // road (or the delivery is finished) it can't be handed back.
        if (delivery.status !== "assigned") {
            return res.status(400).json({
                success: false,
                message: "This delivery is " + delivery.status + " and can't be declined"
            });
        }
        assertOrderOpen(await Order.findById(delivery.order));

        const decliningRiderId = delivery.assignedRider;
        const dairy = await Dairy.findById(delivery.dairy);
        const dairyCoords = dairy && dairy.location ? dairy.location.coordinates : null;
        const nextRider = await findNearestRider(dairyCoords, [decliningRiderId]);

        const now = new Date();
        const declinedEntry = { status: "assigned", message: "Rider declined the assignment", timestamp: now };
        const guard = { _id: delivery._id, assignedRider: decliningRiderId, status: "assigned" };

        let updated;
        if (nextRider) {
            updated = await Delivery.findOneAndUpdate(
                guard,
                {
                    $set: { assignedRider: nextRider._id, riderConfirmed: false },
                    $push: {
                        timeLine: {
                            $each: [
                                declinedEntry,
                                {
                                    status: "assigned",
                                    message: "Reassigned to " + (nextRider.username ? nextRider.username.firstName : "another rider") + " - awaiting confirmation",
                                    timestamp: now
                                }
                            ]
                        }
                    }
                },
                { new: true }
            );
        } else {
            updated = await Delivery.findOneAndUpdate(
                guard,
                {
                    $set: { riderConfirmed: false, status: "pending" },
                    $unset: { assignedRider: "" },
                    $push: { timeLine: declinedEntry }
                },
                { new: true }
            );
        }
        if (!updated) {
            return res.status(409).json({ success: false, message: "This delivery changed — please refresh" });
        }

        if (nextRider) {
            await safeNotify(nextRider._id, {
                title: "New delivery request",
                message: "You've been matched to a nearby delivery - please confirm or decline it in My Deliveries.",
                deliveryId: updated._id
            });
        } else if (dairy && dairy.owner) {
            await safeNotify(dairy.owner, {
                title: "Delivery needs a rider",
                message: "A rider declined and no one else is available nearby - please assign one manually.",
                deliveryId: updated._id
            });
        }

        res.status(200).json({ success: true, message: "Delivery declined", data: updated });
    } catch (error) {
        sendError(res, error, "Error declining delivery");
    }
};

export const getDeliveryByOrder = async (req, res) => {
    try {
        const delivery = await Delivery.findOne({ order: req.params.orderId })
            .populate({
                path: "order",
                select: "status totalPrice scheduledDate deliverySlot deliveryAddress",
                populate: { path: "deliveryAddress", select: "label fullAddress location" }
            })
            .populate("dairy", "name phone owner location")
            .populate("assignedRider", "username phone");

        if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

        const isOwnOrder = delivery.user.toString() === req.user._id.toString();
        const isAssignedRider = delivery.assignedRider && delivery.assignedRider._id.toString() === req.user._id.toString();
        const isOwningDairy = req.user.role === "dairyOwner" && delivery.dairy && delivery.dairy.owner && delivery.dairy.owner.toString() === req.user._id.toString();

        if (!isOwnOrder && !isAssignedRider && !isOwningDairy && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Not authorized to view this delivery" });
        }

        res.status(200).json({ success: true, data: delivery });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching delivery", error: error.message });
    }
};

// Settles a cash-on-delivery payment at the door. Only applies when a
// Payment record exists that is explicitly cash_on_delivery and still
// pending — online payments are confirmed by Razorpay, and orders with no
// payment record (e.g. subscription orders) are never marked paid here.
// Returns true if cash was settled.
async function settleCashOnDelivery(orderId, session) {
    const payment = await Payment.findOne({
        orderId: orderId,
        paymentMethod: "cash_on_delivery",
        paymentStatus: "pending"
    }).session(session);
    if (!payment) return false;

    payment.paymentStatus = "paid";
    payment.paidAt = new Date();
    await payment.save({ session });
    await Order.updateOne(
        { _id: orderId, paymentStatus: "pending" },
        { paymentStatus: "paid" },
        { session }
    );
    return true;
}

export const updateDeliveryStatus = async (req, res) => {
    try {
        const status = req.body.status;
        const message = req.body.message;
        const failureReason = req.body.failureReason;

        if (!Object.prototype.hasOwnProperty.call(STATUS_TRANSITIONS, status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const initial = await Delivery.findById(req.params.id);
        if (!initial) return res.status(404).json({ success: false, message: "Delivery not found" });

        if (!(await canManageDelivery(req.user, initial))) {
            return res.status(403).json({ success: false, message: "Not authorized to update this delivery" });
        }

        const roleTargets = ROLE_ALLOWED_TARGETS[req.user.role] || [];
        if (!roleTargets.includes(status)) {
            const ownerFinal = req.user.role === "dairyOwner" && FINAL_STATUSES.includes(status);
            return res.status(403).json({
                success: false,
                message: ownerFinal
                    ? "Only the assigned rider can mark a delivery as delivered or failed"
                    : "Your role can't set a delivery to '" + status + "'"
            });
        }

        // Everything below re-reads the delivery inside the transaction, so
        // the checks run against the state we are actually about to change.
        const updated = await runInTransaction(async (session) => {
            const delivery = await Delivery.findById(req.params.id).session(session);
            if (!delivery) throw new HttpError(404, "Delivery not found");

            if (!(await canManageDelivery(req.user, delivery))) {
                throw new HttpError(403, "Not authorized to update this delivery");
            }
            if (req.user.role === "deliveryPerson" && !delivery.riderConfirmed) {
                throw new HttpError(400, "Please confirm or decline this delivery before updating its status");
            }

            if (delivery.status === status) {
                throw new HttpError(400, "Delivery is already " + status);
            }
            const allowedNext = STATUS_TRANSITIONS[delivery.status] || [];
            if (!allowedNext.includes(status)) {
                throw new HttpError(400,
                    "A delivery that is '" + delivery.status + "' can't move to '" + status + "'" +
                    (allowedNext.length ? " (allowed: " + allowedNext.join(", ") + ")" : ""));
            }
            if (status !== "pending" && !delivery.assignedRider) {
                throw new HttpError(400, "Assign a rider before moving this delivery forward");
            }

            const order = await Order.findById(delivery.order).session(session);
            assertOrderOpen(order);

            const set = { status: status };
            if (status === "failed" && failureReason) set.failureReason = failureReason;

            if (status === "delivered") {
                set.deliveredAt = new Date();
                // Idempotent writes first, the delivery claim last: if
                // anything here fails the delivery is still not "delivered"
                // and the rider can simply retry.
                await Order.updateOne({ _id: order._id, status: { $ne: "cancelled" } }, { status: "delivered" }, { session });
                await settleCashOnDelivery(order._id, session);
            }

            const result = await Delivery.findOneAndUpdate(
                { _id: delivery._id, status: delivery.status },
                {
                    $set: set,
                    $push: { timeLine: { status: status, message: message || status.replace(/-/g, " "), timestamp: new Date() } }
                },
                { new: true, session: session }
            );
            if (!result) throw new HttpError(409, "Delivery was updated by someone else — please refresh and retry");
            return result;
        });

        res.status(200).json({ success: true, message: "Delivery status updated", data: updated });
    } catch (error) {
        sendError(res, error, "Error updating delivery");
    }
};

export const updateLiveLocation = async (req, res) => {
    try {
        const coordinates = req.body.coordinates;
        if (!validCoordinates(coordinates)) {
            return res.status(400).json({
                success: false,
                message: "coordinates must be [longitude, latitude] — numbers, longitude -180..180, latitude -90..90"
            });
        }

        const delivery = await Delivery.findById(req.params.id);
        if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

        const allowed = await canManageDelivery(req.user, delivery);
        if (!allowed) {
            return res.status(403).json({ success: false, message: "Not authorized to update this delivery" });
        }

        delivery.currentLocation = { type: "Point", coordinates: coordinates };
        await delivery.save();

        res.status(200).json({ success: true, data: { currentLocation: delivery.currentLocation } });
    } catch (error) {
        sendError(res, error, "Error updating location");
    }
};

export const getTimeline = async (req, res) => {
    try {
        const delivery = await Delivery.findById(req.params.id)
            .select("timeLine status estimatedDelivery deliveredAt user assignedRider dairy");
        if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

        const isOwnOrder = delivery.user.toString() === req.user._id.toString();
        const canManage = await canManageDelivery(req.user, delivery);
        if (!isOwnOrder && !canManage) {
            return res.status(403).json({ success: false, message: "Not authorized to view this delivery" });
        }

        res.status(200).json({ success: true, data: delivery });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching timeline", error: error.message });
    }
};

export const getMyDeliveries = async (req, res) => {
    try {
        const status = req.query.status;
        const filter = { assignedRider: req.user._id };
        if (status) filter.status = status;

        const deliveries = await Delivery.find(filter)
            .populate({
                path: "order",
                select: "milkType quantity deliveryAddress deliverySlot scheduledDate totalPrice",
                populate: [
                    { path: "milkType", select: "name unit" },
                    { path: "deliveryAddress", select: "label fullAddress location" }
                ]
            })
            .populate("dairy", "name location phone")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: deliveries.length, data: deliveries });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching your deliveries", error: error.message });
    }
};