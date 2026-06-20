import Coupon from "../models/coupon";

//Create new coupon
export const createCoupon = async (req, res) => {
    try{
        const { code, description, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit,
            perUserLimit, expiresAt } = req.body;

        const existing = await Coupon.findOne({ code: code?.toUpperCase() });
        if(existing){
            return res.status(400).json({ success: false, message: "Coupon code already exists" });
        }
        const coupon = await Coupon.create({
            code,
            description, 
            discountType, 
            discountValue,
            minOrderAmount,
            maxDiscount,
            usageLimit,
            perUserLimit,
            expiresAt,
            createdBy: req.user._id
        });
        res.status(201).json({ success: true, message: "Coupon created successfully", data: coupon });

    }
    catch(error){
        res.status(500).json({ success: false, message: "Failed to create coupon.", error: error.message });
    }
}


// Validate and apply a coupon to an order and calculate the discount for a given cart
// route: Post: /api/coupons/apply
export const applyCoupon = async(req, res) => {

    try{
        const {code, orderAmount} = req.body;
        if(!code){
            return res.status(400).json({ success: false, message: "Coupon code is required" });
        }
        if(orderAmount === undefined || orderAmount === null || orderAmount < 0){
            return res.status(400).json({ success: false, message: " A Valid Order amount is required"});
        }
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
        if(!coupon){
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }
        if(new Date() > coupon.expiresAt){
            return res.status(400).json({ success: false, message: "Coupon has expired" });
        }
        if(orderAmount < coupon.minOrderAmount){
            return res.status(400).json({ success: false, message: `Minimum order amount to apply this coupon is 
                ${coupon.minOrderAmount}`});
        }
        if(coupon.usedCount >= coupon.usageLimit){
            return res.status(400).json({ success: false, message: "Coupon usage limit has been reached" });
        }
        const userUsage = coupon.usedBy.find(u => u.user.toString() === req.user._id.toString());
        if(userUsage && userUsage.usedCount >= coupon.perUserLimit){
            return res.status(400).json({ success: false, message: "You have reached the maximum usage limit for this coupon" });
        }

        //Calculate discount
        let discount = coupon.discountType === "percentage" ? (orderAmount * coupon.discountValue / 100):
            coupon.discountValue;

        if(coupon.discountType === "percentage"){
            discount = Math.min(discount, coupon.maxDiscount);
        }
        discount = Math.min(discount, orderAmount) //  Ensure discount does not more than order amount

        const finalAmount = Math.max(0, orderAmount - discount);

        res.status(200).json({
            success: true,
            message: "Coupon applied successfully",
            data: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discount,
                finalAmount
            }
        });
    }
    catch(error){
        res.status(500).json({ success: false, message: "Failed to apply coupon.", error: error.message });
    }
}

// Mark a coupon as redeemed for a user after a order is placed successfully
// route: POST: /api/coupons/redeem
export const redeemCoupon = async(req, res) => {
    try{
        const { code } = req.body;
        if(!code){
            return res.status(400).json({ success: false, message: "Coupon code is required" });
        }
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
        if(!coupon){
            return res.status(404).json({ success: false, message: "Coupon not found."});
        }

        if(new Date() > coupon.expiresAt){
            return res.status(400).json({ success: false, message: "Coupon has expired." });
        }
        if(coupon.usedCount >= coupon.usageLimit){
            return res.status(400).json({ success: false, message: "Coupon usage limit has been reached." });
        }

        // Update the usedBy array for the user
        const userUsage = coupon.usedBy.find(u => u.user.toString() === req.user._id.toString());
        if(userUsage){
            userUsage.usedCount += 1;
            userUsage.usedAt = new Date(); // Update the last used date
        } 
        else {
            coupon.usedBy.push({ user: req.user._id, usedCount: 1, usedAt: new Date() });
        }
        
        // Increment the overall usedCount for the coupon
        coupon.usedCount += 1;

        if(coupon.usedCount >= coupon.usageLimit){
            coupon.isActive = false; // Deactivate the coupon if usage limit is reached
        }
        await coupon.save();

        res.status(200).json({ success: true, message: "Coupon redeemed successfully"});
    }
    catch(error){
        res.status(500).json({ success: false, message: "Failed to redeem coupon.", error: error.message });
    }
}


//  get all coupons 
// route: GET: /api/coupons
export const getAllCoupons = async(req, res) => {
    try{
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, message: "Coupons fetched successfully", data: coupons });
    }
    catch(error){
        res.status(500).json({ success: false, message: "Failed to fetch coupons.", error: error.message });
    }
};

// Toggle the active status of a coupon (activate/deactivate) for admin use
// route: PATCH: /api/coupons/:id/toggle
export const toggleCoupon = async(req, res) => {
    try{
        const coupon = await Coupon.findById(req.params.id);
        if(!coupon){
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }
        coupon.isActive = !coupon.isActive;
        await coupon.save();
        res.status(200).json({ success: true, message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully` });
    }
    catch(error){
        res.status(500).json({ success: false, message: "Failed to toggle coupon status.", error: error.message });
    }
}

// Delete a coupon by ID for admin use
// route: DELETE: /api/coupons/:id
export const deleteCoupon = async(req, res) => {
    try{
        // const coupon = await Coupon.findById(req.params.id);
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if(!coupon){
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }
        
        res.status(200).json({ success: true, message: "Coupon deleted successfully" });
    }
    catch(error){
        res.status(500).json({ success: false, message: "Failed to delete coupon.", error: error.message});
    }
}
