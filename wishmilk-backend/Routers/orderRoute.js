import express from "express";
import {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    rescheduleOrder,
    getOrdersByDairy,
    updateOrderStatus,
    linkPaymentToOrder,
} from "../Controllers/orderController.js";
import { protect, isDairyOwner, isAdmin, restrictTo } from "../middlewares/auth.js";

const router = express.Router();

router.use(protect);

// User routes
router.post("/",                    createOrder);
router.get("/my-orders",            getMyOrders);
router.get("/:id",                  getOrderById);
router.patch("/:id/cancel",         cancelOrder);
router.patch("/:id/reschedule",     rescheduleOrder);
router.patch("/:id/payment",        linkPaymentToOrder);

// Dairy owner routes
router.get("/dairy/:dairyId",       isDairyOwner, getOrdersByDairy);

// Dairy owner or admin
router.patch("/:id/status",         restrictTo("dairyOwner", "admin"), updateOrderStatus);

export default router;