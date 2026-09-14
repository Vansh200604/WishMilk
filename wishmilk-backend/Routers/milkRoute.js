import express from "express";
import {
    createMilk,
    getAllMilk,
    getMilkById,
    getMilkByDairy,
    updateMilk,
    toggleMilkStock,
    deleteMilk,
} from "../Controllers/milkController.js";
import { protect, isDairyOwner } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.get("/",              getAllMilk);
router.get("/dairy/:dairyId", getMilkByDairy);
router.get("/:id",           getMilkById);

// Protected routes (dairy owner only)
router.post("/", protect, isDairyOwner, createMilk);
router.put("/:id", protect, isDairyOwner, updateMilk);
router.patch("/:id/toggle-stock", protect, isDairyOwner, toggleMilkStock);
router.delete("/:id", protect, isDairyOwner, deleteMilk);

export default router;