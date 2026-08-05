// import Delivery from '../models/delivery.js';
// import Order from '../models/order.js';

// // Create a new delivery
// export const createDelivery = async(req, res) => {
//     try {
//         const {orderId, estimatedDelivery} = req.body;
//         if(!orderId){
//             return res.status(400).json({message: "Order ID is required"});
//         }
//         const order = await Order.findById(orderId);
//         if(!order){
//             return res.status(404).json({message: "Order not found"});
//         }

//         const existing = await Delivery.findOne({order: orderId});
//         if(existing){
//             return res.status(400).json({message: "Delivery already exists for this order"});
//         }

//         const delivery = await Delivery.create({
//             order: orderId,
//             user: order.userId,
//             dairy: order.dairy,
//             estimatedDelivery,
//             timeLine: [{status: 'pending', message: 'Order is received and being prepared'}]
//         })
//         res.status(201).json({success:true, message: "Delivery created successfully", data: delivery});
//     }
//     catch(error){
//         res.status(500).json({success:false, message: "Failed to create delivery", error: error.message});;
//     }
// }


// // @desc    Get delivery status for an order
// // @route   GET /api/delivery/order/:orderId
// // @access  Private
// export const getDeliveryByOrder = async (req, res) => {
//     try {
//         const delivery = await Delivery.findOne({ order: req.params.orderId })
//             .populate("order", "status totalPrice scheduledDate deliverySlot")
//             .populate("dairy", "name phone");
 
//         if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });
//         res.status(200).json({ success: true, data: delivery });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error fetching delivery", error: error.message });
//     }
// };
 
// // @desc    Update delivery status and append to timeline
// // @route   PATCH /api/delivery/:id/status
// // @access  Private (dairyOwner / admin)
// export const updateDeliveryStatus = async (req, res) => {
//     try {
//         const { status, message, failureReason } = req.body;
//         const allowedStatuses = ["pending", "assigned", "picked-up", "out-for-delivery", "delivered", "failed"];
 
//         if (!allowedStatuses.includes(status)) {
//             return res.status(400).json({ success: false, message: "Invalid status" });
//         }
 
//         const delivery = await Delivery.findById(req.params.id);
//         if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });
 
//         delivery.status = status;
//         delivery.timeLine.push({ status, message: message || status.replace(/-/g, " "), timestamp: new Date() });
 
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
 
// // @desc    Update live delivery location
// // @route   PATCH /api/delivery/:id/location
// // @access  Private (dairy_owner)
// export const updateLiveLocation = async (req, res) => {
//     try {
//         const { coordinates } = req.body; // [lng, lat]
//         if (!coordinates || coordinates.length !== 2) {
//             return res.status(400).json({ success: false, message: "Valid coordinates [lng, lat] required" });
//         }
 
//         const delivery = await Delivery.findByIdAndUpdate(
//             req.params.id,
//             { currentLocation: { type: "Point", coordinates } },
//             { new: true }
//         );
//         if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });
//         res.status(200).json({ success: true, data: { currentLocation: delivery.currentLocation } });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error updating location", error: error.message });
//     }
// };
 
// // @desc    Get full delivery timeline
// // @route   GET /api/delivery/:id/timeline
// // @access  Private
// export const getTimeline = async (req, res) => {
//     try {
//         const delivery = await Delivery.findById(req.params.id)
//             .select("timeLine status estimatedDelivery deliveredAt");
//         if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });
//         res.status(200).json({ success: true, data: delivery });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error fetching timeline", error: error.message });
//     }
// };






import Delivery from '../models/delivery.js';
import Order from '../models/order.js';
import Dairy from '../models/dairy.js';
import User from '../models/user.js';

// Checks whether req.user is allowed to manage this specific delivery:
// the dairy owner who owns it, the rider assigned to it, or an admin.
// Returns true/false — callers still send their own 403 message.
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

// @desc    Create a delivery for an order, optionally assigning a rider
// @route   POST /api/delivery
// @access  Private (dairy owner of that order's dairy, or admin)
export const createDelivery = async (req, res) => {
    try {
        const { orderId, estimatedDelivery, assignedRider } = req.body;
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

        // If a rider is being assigned right away, make sure they're a real
        // rider who actually works for this order's dairy.
        if (assignedRider) {
            const rider = await User.findOne({ _id: assignedRider, role: "deliveryPerson", dairyId: order.dairy });
            if (!rider) {
                return res.status(400).json({ success: false, message: "That rider doesn't work for this dairy" });
            }
        }

        const timeLine = [{ status: 'pending', message: 'Order is received and being prepared' }];
        if (assignedRider) {
            timeLine.push({ status: 'assigned', message: 'A rider has been assigned' });
        }

        const delivery = await Delivery.create({
            order: orderId,
            user: order.userId,
            dairy: order.dairy,
            estimatedDelivery,
            assignedRider: assignedRider || undefined,
            status: assignedRider ? 'assigned' : 'pending',
            timeLine,
        });

        res.status(201).json({ success: true, message: "Delivery created successfully", data: delivery });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create delivery", error: error.message });
    }
};

// @desc    Assign (or reassign) a rider to an existing delivery
// @route   PATCH /api/delivery/:id/assign
// @access  Private (dairy owner of that delivery's dairy, or admin)
export const assignRider = async (req, res) => {
    try {
        const { riderId } = req.body;
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

        const rider = await User.findOne({ _id: riderId, role: "deliveryPerson", dairyId: delivery.dairy });
        if (!rider) {
            return res.status(400).json({ success: false, message: "That rider doesn't work for this dairy" });
        }

        delivery.assignedRider = riderId;
        if (delivery.status === "pending") delivery.status = "assigned";
        delivery.timeLine.push({ status: "assigned", message: `Assigned to ${rider.username?.firstName || "a rider"}` });
        await delivery.save();

        res.status(200).json({ success: true, message: "Rider assigned", data: delivery });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error assigning rider", error: error.message });
    }
};

// @desc    Get delivery status for an order
// @route   GET /api/delivery/order/:orderId
// @access  Private (the customer who placed it, the assigned rider, the
//          owning dairy, or admin)
export const getDeliveryByOrder = async (req, res) => {
    try {
        const delivery = await Delivery.findOne({ order: req.params.orderId })
            .populate("order", "status totalPrice scheduledDate deliverySlot")
            .populate("dairy", "name phone owner")
            .populate("assignedRider", "username phone");

        if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

        const isOwnOrder = delivery.user.toString() === req.user._id.toString();
        const isAssignedRider =
            delivery.assignedRider && delivery.assignedRider._id.toString() === req.user._id.toString();
        const isOwningDairy =
            req.user.role === "dairyOwner" && delivery.dairy?.owner?.toString() === req.user._id.toString();

        if (!isOwnOrder && !isAssignedRider && !isOwningDairy && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Not authorized to view this delivery" });
        }

        res.status(200).json({ success: true, data: delivery });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching delivery", error: error.message });
    }
};

// @desc    Update delivery status and append to timeline
// @route   PATCH /api/delivery/:id/status
// @access  Private (assigned rider, owning dairy owner, or admin)
export const updateDeliveryStatus = async (req, res) => {
    try {
        const { status, message, failureReason } = req.body;
        const allowedStatuses = ["pending", "assigned", "picked-up", "out-for-delivery", "delivered", "failed"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const delivery = await Delivery.findById(req.params.id);
        if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

        if (!(await canManageDelivery(req.user, delivery))) {
            return res.status(403).json({ success: false, message: "Not authorized to update this delivery" });
        }

        delivery.status = status;
        delivery.timeLine.push({ status, message: message || status.replace(/-/g, " "), timestamp: new Date() });

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

// @desc    Update live delivery location
// @route   PATCH /api/delivery/:id/location
// @access  Private (assigned rider, owning dairy owner, or admin)
export const updateLiveLocation = async (req, res) => {
    try {
        const { coordinates } = req.body; // [lng, lat]
        if (!coordinates || coordinates.length !== 2) {
            return res.status(400).json({ success: false, message: "Valid coordinates [lng, lat] required" });
        }

        const delivery = await Delivery.findById(req.params.id);
        if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

        if (!(await canManageDelivery(req.user, delivery))) {
            return res.status(403).json({ success: false, message: "Not authorized to update this delivery" });
        }

        delivery.currentLocation = { type: "Point", coordinates };
        await delivery.save();

        res.status(200).json({ success: true, data: { currentLocation: delivery.currentLocation } });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating location", error: error.message });
    }
};

// @desc    Get full delivery timeline
// @route   GET /api/delivery/:id/timeline
// @access  Private (same visibility rule as getDeliveryByOrder)
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

// @desc    List deliveries assigned to the logged-in rider
// @route   GET /api/delivery/my-deliveries
// @access  Private (deliveryPerson)
export const getMyDeliveries = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = { assignedRider: req.user._id };
        if (status) filter.status = status;

        const deliveries = await Delivery.find(filter)
            .populate({
                path: "order",
                select: "milkType quantity deliveryAddress deliverySlot scheduledDate totalPrice",
                populate: [
                    { path: "milkType", select: "name unit" },
                    { path: "deliveryAddress", select: "label fullAddress" },
                ],
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: deliveries.length, data: deliveries });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching your deliveries", error: error.message });
    }
};