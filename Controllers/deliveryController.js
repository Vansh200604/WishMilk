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
//             _id: { $nin: excludeRiderIds },
//             currentLocation: { $exists: true, $ne: null },
//             // "currentLocation.coordinates": { $exists: true, $ne: [] }
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








import Delivery from '../models/delivery.js';
import Order from '../models/order.js';
import Dairy from '../models/dairy.js';
import User from '../models/user.js';
import Notification from '../models/notification.js';

async function canManageDelivery(user, delivery) {
    if (user.role === "admin") return true;
    if (user.role === "dairyOwner") {
        const owns = await Dairy.findOne({ _id: delivery.dairy, owner: user._id });
        return !!owns;
    }
    if (user.role === "deliveryPerson") {
        return delivery.assignedRider && delivery.assignedRider.toString() === user._id.toString();
    }
    return false;
}


const MAX_ACTIVE_DELIVERIES = 3;
const ACTIVE_DELIVERY_STATUSES = ["assigned", "picked-up", "out-for-delivery"];

// Finds the closest AVAILABLE rider to a point, out of all approved
// riders. "Available" means both: has shared a location, and isn't
// already juggling too many active deliveries — a rider 2km away with
// zero deliveries is a better match than one 200m away already carrying
// three. Checks the 5 nearest candidates and picks the first one under
// the load threshold; if all 5 are overloaded, falls back to the single
// nearest anyway (an overloaded rider still beats no rider at all).
// Never throws — returns null if nobody qualifies.
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
        }).limit(5);

        if (candidates.length === 0) return null;

        for (const candidate of candidates) {
            const activeCount = await Delivery.countDocuments({
                assignedRider: candidate._id,
                riderConfirmed: true,
                status: { $in: ACTIVE_DELIVERY_STATUSES }
            });
            if (activeCount < MAX_ACTIVE_DELIVERIES) {
                return candidate;
            }
        }

        // Everyone nearby is at capacity — better to over-assign the
        // closest one than leave the delivery with no rider at all.
        return candidates[0];
    } catch (e) {
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
            try {
                await notifyRider(rider._id, {
                    title: "New delivery request",
                    message: "You've been matched to a nearby delivery - please confirm or decline it in My Deliveries.",
                    deliveryId: delivery._id
                });
            } catch (e) {}
        }

        res.status(201).json({ success: true, message: "Delivery created successfully", data: delivery });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create delivery", error: error.message });
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

        const rider = await User.findOne({ _id: riderId, role: "deliveryPerson", riderStatus: "approved" });
        if (!rider) {
            return res.status(400).json({ success: false, message: "That rider doesn't exist or isn't approved yet" });
        }

        delivery.assignedRider = riderId;
        delivery.riderConfirmed = false;
        if (delivery.status === "pending") delivery.status = "assigned";
        delivery.timeLine.push({
            status: "assigned",
            message: "Assigned to " + (rider.username ? rider.username.firstName : "a rider") + " - awaiting confirmation"
        });
        await delivery.save();

        try {
            await notifyRider(rider._id, {
                title: "New delivery request",
                message: "You've been assigned a delivery - please confirm or decline it in My Deliveries.",
                deliveryId: delivery._id
            });
        } catch (e) {}

        res.status(200).json({ success: true, message: "Rider assigned", data: delivery });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error assigning rider", error: error.message });
    }
};

export const confirmDelivery = async (req, res) => {
    try {
        const delivery = await Delivery.findById(req.params.id);
        if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

        if (!delivery.assignedRider || delivery.assignedRider.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "This delivery isn't assigned to you" });
        }

        delivery.riderConfirmed = true;
        delivery.timeLine.push({ status: delivery.status, message: "Rider confirmed the assignment" });
        await delivery.save();

        res.status(200).json({ success: true, message: "Delivery confirmed", data: delivery });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error confirming delivery", error: error.message });
    }
};

export const declineDelivery = async (req, res) => {
    try {
        const delivery = await Delivery.findById(req.params.id);
        if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

        if (!delivery.assignedRider || delivery.assignedRider.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "This delivery isn't assigned to you" });
        }

        const decliningRiderId = delivery.assignedRider;
        const dairy = await Dairy.findById(delivery.dairy);
        const dairyCoords = dairy && dairy.location ? dairy.location.coordinates : null;
        const nextRider = await findNearestRider(dairyCoords, [decliningRiderId]);

        delivery.timeLine.push({ status: delivery.status, message: "Rider declined the assignment" });

        if (nextRider) {
            delivery.assignedRider = nextRider._id;
            delivery.riderConfirmed = false;
            delivery.timeLine.push({
                status: "assigned",
                message: "Reassigned to " + (nextRider.username ? nextRider.username.firstName : "another rider") + " - awaiting confirmation"
            });
            await delivery.save();
            try {
                await notifyRider(nextRider._id, {
                    title: "New delivery request",
                    message: "You've been matched to a nearby delivery - please confirm or decline it in My Deliveries.",
                    deliveryId: delivery._id
                });
            } catch (e) {}
        } else {
            delivery.assignedRider = undefined;
            delivery.riderConfirmed = false;
            delivery.status = "pending";
            await delivery.save();
            if (dairy && dairy.owner) {
                try {
                    await notifyRider(dairy.owner, {
                        title: "Delivery needs a rider",
                        message: "A rider declined and no one else is available nearby - please assign one manually.",
                        deliveryId: delivery._id
                    });
                } catch (e) {}
            }
        }

        res.status(200).json({ success: true, message: "Delivery declined", data: delivery });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error declining delivery", error: error.message });
    }
};

export const getDeliveryByOrder = async (req, res) => {
    try {
        const delivery = await Delivery.findOne({ order: req.params.orderId })
            .populate("order", "status totalPrice scheduledDate deliverySlot")
            .populate("dairy", "name phone owner")
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

export const updateDeliveryStatus = async (req, res) => {
    try {
        const status = req.body.status;
        const message = req.body.message;
        const failureReason = req.body.failureReason;
        const allowedStatuses = ["pending", "assigned", "picked-up", "out-for-delivery", "delivered", "failed"];

        if (allowedStatuses.indexOf(status) === -1) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const delivery = await Delivery.findById(req.params.id);
        if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

        const allowed = await canManageDelivery(req.user, delivery);
        if (!allowed) {
            return res.status(403).json({ success: false, message: "Not authorized to update this delivery" });
        }

        // Dispatch states (assigned, picked-up, out-for-delivery) are the
        // owner's call, but the final outcome — actually delivered, or
        // failed — belongs to whoever is physically there. The owner's
        // job ends once it's out for delivery.
        if (req.user.role === "dairyOwner" && ["delivered", "failed"].includes(status)) {
            return res.status(403).json({
                success: false,
                message: "Only the assigned rider can mark a delivery as delivered or failed"
            });
        }

        if (req.user.role === "deliveryPerson" && !delivery.riderConfirmed) {
            return res.status(400).json({
                success: false,
                message: "Please confirm or decline this delivery before updating its status"
            });
        }

        delivery.status = status;
        delivery.timeLine.push({ status: status, message: message || status.replace(/-/g, " "), timestamp: new Date() });

        if (status === "delivered") {
            delivery.deliveredAt = new Date();
            await Order.findByIdAndUpdate(delivery.order, { status: "delivered" });
        }
        if (status === "failed" && failureReason) delivery.failureReason = failureReason;

        await delivery.save();
        res.status(200).json({ success: true, message: "Delivery status updated", data: delivery });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating delivery", error: error.message });
    }
};

export const updateLiveLocation = async (req, res) => {
    try {
        const coordinates = req.body.coordinates;
        if (!coordinates || coordinates.length !== 2) {
            return res.status(400).json({ success: false, message: "Valid coordinates [lng, lat] required" });
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
        res.status(500).json({ success: false, message: "Error updating location", error: error.message });
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
                    { path: "deliveryAddress", select: "label fullAddress" }
                ]
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: deliveries.length, data: deliveries });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching your deliveries", error: error.message });
    }
};