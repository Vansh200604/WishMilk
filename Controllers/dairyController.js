import Dairy from "../models/dairy.js";
import User from "../models/user.js";
import express from "express";

// export const addDairy = async(req, res) => {
//     try{
//         const { name, image, email, phone, location, milkTypes,
//             milkPricing, isActive, rating, deliveryTime, subscriptionPlans, reviewCount
//         } = req.body;

//         const owner = await User.findById(owner);

//         if( !name || !email || !phone || !location?.coordinates || !location?.address
//             || !milkTypes || !milkPricing || !owner){
//             return res.status(400).json({message: "Missing required fields or invalid owner"})
//         }

//         const dairy = await Dairy.create({
//             name, 
//             image,
//             email,
//             owner,
//             phone,
//             location:{
//                 type: "Point",
//                 coordinates: location.coordinates,
//                 address: location.address
//             },
//             milkTypes,
//             milkPricing,
//             isActive,
//             rating,
//             deliveryTime,
//             subscriptionPlans,
//             reviewCount
//         });
//         res.status(201).json({
//             message: "Dairy added successfully", dairy
//         });
//     }
//     catch(error){
//         console.error("Create Dairy Error", error);
//         res.status(500).json({
//             message: "Error creating dairy",
//             error: error.message
//         })
//     }
// }


// @desc    Register a new dairy
// @route   POST /api/dairies
// @access  Private (dairy owner)
export const createDairy = async (req, res) => {
    try {
        const {
            name,
            image,
            email,
            phone,
            location,
            milkTypes,
            milkPricing,
            deliveryTime,
            subscriptionPlans
        } = req.body;


        const existingDairy = await Dairy.findOne({ email });
        if (existingDairy) {
            return res.status(400).json({ success: false, message: 'Dairy with this email already exists' });
        }

        const dairy = await Dairy.create({
            name,
            image,
            email,
            phone,
            owner: req.user._id,
            location,
            milkTypes,
            milkPricing,
            deliveryTime,
            subscriptionPlans
        });

        res.status(201).json({ success: true, message: 'Dairy created successfully', data: dairy });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all active dairies (with optional filters)
// @route   GET /api/dairies
// @access  Public
export const getAllDairies = async (req, res) => {
    try {
        const { milkType, subscriptionPlan, minRating, search } = req.query;

        const filter = { isActive: true };

        if (milkType) {
            filter.milkTypes = { $in: [milkType] };
        }

        if (subscriptionPlan) {
            filter.subscriptionPlans = { $in: [subscriptionPlan] };
        }

        if (minRating) {
            filter.rating = { $gte: parseFloat(minRating) };
        }

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        const dairies = await Dairy.find(filter)
            .populate('owner', 'name email')
            .sort({ rating: -1 });

        res.status(200).json({ success: true, count: dairies.length, data: dairies });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get nearby dairies using geolocation
// @route   GET /api/dairies/nearby?lng=77.2&lat=28.6&radius=5000
// @access  Public
export const getNearbyDairies = async (req, res) => {
    try {
        const { lng, lat, radius = 5000 } = req.query;

        if (!lng || !lat) {
            return res.status(400).json({ success: false, message: 'Please provide lng and lat query parameters' });
        }

        const dairies = await Dairy.find({
            isActive: true,
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(radius)
                }
            }
        }).populate('owner', 'name email');

        res.status(200).json({ success: true, count: dairies.length, data: dairies });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single dairy by ID
// @route   GET /api/dairies/:id
// @access  Public
export const getDairyById = async (req, res) => {
    try {
        const dairy = await Dairy.findById(req.params.id).populate('owner', 'name email phone');

        if (!dairy) {
            return res.status(404).json({ success: false, message: 'Dairy not found' });
        }

        res.status(200).json({ success: true, data: dairy });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update dairy details
// @route   PUT /api/dairies/:id
// @access  Private (owner only)
export const updateDairy = async (req, res) => {
    try {
        const dairy = await Dairy.findById(req.params.id);

        if (!dairy) {
            return res.status(404).json({ success: false, message: 'Dairy not found' });
        }

        if (dairy.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this dairy' });
        }

        const updatedDairy = await Dairy.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, message: 'Dairy updated successfully', data: updatedDairy });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Toggle dairy active/inactive status
// @route   PATCH /api/dairies/:id/toggle-status
// @access  Private (owner only)
export const toggleDairyStatus = async (req, res) => {
    try {
        const dairy = await Dairy.findById(req.params.id);

        if (!dairy) {
            return res.status(404).json({ success: false, message: 'Dairy not found' });
        }

        if (dairy.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        dairy.isActive = !dairy.isActive;
        await dairy.save();

        res.status(200).json({
            success: true,
            message: `Dairy is now ${dairy.isActive ? 'active' : 'inactive'}`,
            data: dairy
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update milk pricing
// @route   PATCH /api/dairies/:id/pricing
// @access  Private (owner only)
export const updateMilkPricing = async (req, res) => {
    try {
        const dairy = await Dairy.findById(req.params.id);

        if (!dairy) {
            return res.status(404).json({ success: false, message: 'Dairy not found' });
        }

        if (dairy.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        dairy.milkPricing = req.body.milkPricing;
        await dairy.save();

        res.status(200).json({ success: true, message: 'Milk pricing updated', data: dairy.milkPricing });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get logged-in owner's dairy
// @route   GET /api/dairies/my-dairy
// @access  Private (owner only)
export const getMyDairy = async (req, res) => {
    try {
        const dairy = await Dairy.findOne({ owner: req.user._id });

        if (!dairy) {
            return res.status(404).json({ success: false, message: 'You have not registered a dairy yet' });
        }

        res.status(200).json({ success: true, data: dairy });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete dairy
// @route   DELETE /api/dairies/:id
// @access  Private (owner only)
export const deleteDairy = async (req, res) => {
    try {
        const dairy = await Dairy.findById(req.params.id);

        if (!dairy) {
            return res.status(404).json({ success: false, message: 'Dairy not found' });
        }

        if (dairy.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this dairy' });
        }

        await dairy.deleteOne();

        res.status(200).json({ success: true, message: 'Dairy deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};