import Delivery from '../models/delivery.js';


// Create a new delivery
export const createDelivery = async(req, res) => {
    try {
        const {orderId, estimatedDelivery} = req.body;
        if(!orderId){
            return res.status(400).json({message: "Order ID is required"});
        }
        const order = await Order.findById(orderId);
        if(!order){
            return res.status(404).json({message: "Order not found"});
        }

        const existing = await Delivery.findOne({orderId});
        if(existing){
            return res.status(400).json({message: "Delivery already exists for this order"});
        }

        const delivery = await Delivery.create({
            order: orderId,
            user: order.user,
            dairy: order.dairy,
            estimatedDelivery,
            timeLine: [{status: 'pending', message: 'Order is received and being prepared'}]
        })
        res.status(201).json({success:true, message: "Delivery created successfully"});
    }
    catch(error){
        res.status(500).json({success:false, message: "Failed to create delivery", error: error.message});;
    }
}


// @desc    Get delivery status for an order
// @route   GET /api/delivery/order/:orderId
// @access  Private
export const getDeliveryByOrder = async (req, res) => {
    try {
        const delivery = await Delivery.findOne({ order: req.params.orderId })
            .populate("order", "status totalPrice scheduledDate deliverySlot")
            .populate("dairy", "name phone");
 
        if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });
        res.status(200).json({ success: true, data: delivery });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching delivery", error: error.message });
    }
};
 
// @desc    Update delivery status and append to timeline
// @route   PATCH /api/delivery/:id/status
// @access  Private (dairy_owner / admin)
export const updateDeliveryStatus = async (req, res) => {
    try {
        const { status, message, failureReason } = req.body;
        const allowedStatuses = ["pending", "assigned", "picked_up", "out_for_delivery", "delivered", "failed"];
 
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }
 
        const delivery = await Delivery.findById(req.params.id);
        if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });
 
        delivery.status = status;
        delivery.timeline.push({ status, message: message || status.replace(/_/g, " "), timestamp: new Date() });
 
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
// @access  Private (dairy_owner)
export const updateLiveLocation = async (req, res) => {
    try {
        const { coordinates } = req.body; // [lng, lat]
        if (!coordinates || coordinates.length !== 2) {
            return res.status(400).json({ success: false, message: "Valid coordinates [lng, lat] required" });
        }
 
        const delivery = await Delivery.findByIdAndUpdate(
            req.params.id,
            { currentLocation: { type: "Point", coordinates } },
            { new: true }
        );
        if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });
        res.status(200).json({ success: true, data: { currentLocation: delivery.currentLocation } });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating location", error: error.message });
    }
};
 
// @desc    Get full delivery timeline
// @route   GET /api/delivery/:id/timeline
// @access  Private
export const getTimeline = async (req, res) => {
    try {
        const delivery = await Delivery.findById(req.params.id)
            .select("timeline status estimatedDelivery deliveredAt");
        if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });
        res.status(200).json({ success: true, data: delivery });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching timeline", error: error.message });
    }
};
