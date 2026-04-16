import Milk from "../models/milk.js";
import Dairy from "../models/dairy.js";

// @desc    Add a new milk product (linked to dairy)
// @route   POST /api/milk
// @access  Private (dairy owner)
export const createMilk = async (req, res) => {
    try {
        const { name, type, fatPercentage, packaging, unit, inStock, image, dairyId } = req.body;

        if (!name || !type || fatPercentage === undefined || !packaging || !unit || inStock === undefined || !dairyId) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Ensure the dairy belongs to the logged-in owner
        const dairy = await Dairy.findOne({ _id: dairyId, owner: req.user._id });
        if (!dairy) {
            return res.status(403).json({ success: false, message: "Dairy not found or not authorized" });
        }

        const milk = await Milk.create({ name, type, fatPercentage, packaging, unit, inStock, image });

        // Push milk reference into the dairy's milkTypes array if not already present
        if (!dairy.milkTypes.includes(milk._id)) {
            dairy.milkTypes.push(milk._id);
            await dairy.save();
        }

        res.status(201).json({ success: true, message: "Milk product added successfully", data: milk });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating milk product", error: error.message });
    }
};

// @desc    Get all milk products
// @route   GET /api/milk
// @access  Public
export const getAllMilk = async (req, res) => {
    try {
        const { type, packaging, unit, inStock, minFat, maxFat } = req.query;

        const filter = {};
        if (type)       filter.type       = type;
        if (packaging)  filter.packaging  = packaging;
        if (unit)       filter.unit       = unit;
        if (inStock !== undefined) filter.inStock = inStock === "true";
        if (minFat || maxFat) {
            filter.fatPercentage = {};
            if (minFat) filter.fatPercentage.$gte = parseFloat(minFat);
            if (maxFat) filter.fatPercentage.$lte = parseFloat(maxFat);
        }

        const milkProducts = await Milk.find(filter).sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: milkProducts.length, data: milkProducts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching milk products", error: error.message });
    }
};

// @desc    Get a single milk product by ID
// @route   GET /api/milk/:id
// @access  Public
export const getMilkById = async (req, res) => {
    try {
        const milk = await Milk.findById(req.params.id);

        if (!milk) {
            return res.status(404).json({ success: false, message: "Milk product not found" });
        }

        res.status(200).json({ success: true, data: milk });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching milk product", error: error.message });
    }
};

// @desc    Get all milk products belonging to a specific dairy
// @route   GET /api/milk/dairy/:dairyId
// @access  Public
export const getMilkByDairy = async (req, res) => {
    try {
        const dairy = await Dairy.findById(req.params.dairyId).populate("milkTypes");

        if (!dairy) {
            return res.status(404).json({ success: false, message: "Dairy not found" });
        }

        res.status(200).json({ success: true, count: dairy.milkTypes.length, data: dairy.milkTypes });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching milk for dairy", error: error.message });
    }
};

// @desc    Update a milk product
// @route   PUT /api/milk/:id
// @access  Private (dairy owner)
export const updateMilk = async (req, res) => {
    try {
        // Verify the requester owns a dairy that has this milk
        const dairy = await Dairy.findOne({ owner: req.user._id, milkTypes: req.params.id });
        if (!dairy) {
            return res.status(403).json({ success: false, message: "Not authorized to update this milk product" });
        }

        const milk = await Milk.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        if (!milk) {
            return res.status(404).json({ success: false, message: "Milk product not found" });
        }

        res.status(200).json({ success: true, message: "Milk product updated", data: milk });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating milk product", error: error.message });
    }
};

// @desc    Toggle in-stock status
// @route   PATCH /api/milk/:id/toggle-stock
// @access  Private (dairy owner)
export const toggleMilkStock = async (req, res) => {
    try {
        const dairy = await Dairy.findOne({ owner: req.user._id, milkTypes: req.params.id });
        if (!dairy) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        const milk = await Milk.findById(req.params.id);
        if (!milk) {
            return res.status(404).json({ success: false, message: "Milk product not found" });
        }

        milk.inStock = !milk.inStock;
        await milk.save();

        res.status(200).json({
            success: true,
            message: `Milk is now ${milk.inStock ? "in stock" : "out of stock"}`,
            data: milk
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error toggling stock status", error: error.message });
    }
};

// @desc    Delete a milk product
// @route   DELETE /api/milk/:id
// @access  Private (dairy owner)
export const deleteMilk = async (req, res) => {
    try {
        const dairy = await Dairy.findOne({ owner: req.user._id, milkTypes: req.params.id });
        if (!dairy) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this milk product" });
        }

        await Milk.findByIdAndDelete(req.params.id);

        // Remove reference from dairy
        dairy.milkTypes = dairy.milkTypes.filter((m) => m.toString() !== req.params.id);
        await dairy.save();

        res.status(200).json({ success: true, message: "Milk product deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting milk product", error: error.message });
    }
};