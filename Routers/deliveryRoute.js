import express from "express";
import {
    createDelivery,
    getDeliveryByOrder,
    updateDeliveryStatus,
    updateLiveLocation,
    getTimeline,
} from "../Controllers/deliveryController.js";
import { protect, restrictTo } from "../middlewares/auth.js";

const router = express.Router();

router.use(protect);

// User routes
router.get("/order/:orderId", getDeliveryByOrder);
router.get("/:id/timeline",  getTimeline);

// Dairy owner / admin routes
router.post("/",              restrictTo("dairy_owner", "admin"), createDelivery);
router.patch("/:id/status",   restrictTo("dairy_owner", "admin"), updateDeliveryStatus);
router.patch("/:id/location", restrictTo("dairy_owner", "admin"), updateLiveLocation);

export default router;