import express from "express";
import {
    getPlatformStats,
    getAllUsers,
    updateUserActiveStatus,
    getAllDairiesAdmin,
    getAllOrdersAdmin,
    getAllSubscriptionsAdmin,
} from "../Controllers/adminController.js";
import { protect, restrictTo } from "../middlewares/auth.js";

const router = express.Router();

router.use(protect, restrictTo("admin"));

router.get("/stats",           getPlatformStats);
router.get("/users",           getAllUsers);
router.patch("/users/:id/status", updateUserActiveStatus);
router.get("/dairies",         getAllDairiesAdmin);
router.get("/orders",          getAllOrdersAdmin);
router.get("/subscriptions",   getAllSubscriptionsAdmin);

export default router;