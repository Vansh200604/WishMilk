import express from "express";
import {
    getPlatformStats,
    getAllUsers,
    updateUserActiveStatus,
    getAllDairiesAdmin,
    getAllOrdersAdmin,
    getAllSubscriptionsAdmin,
} from "./adminController.js";
import { getAdminActivity } from "../Controllers/activityController.js";
import { protect, restrictTo } from "../middlewares/auth.js";

const router = express.Router();

router.use(protect, restrictTo("admin"));

router.get("/stats",           getPlatformStats);
router.get("/users",           getAllUsers);
router.patch("/users/:id/status", updateUserActiveStatus);
router.get("/dairies",         getAllDairiesAdmin);
router.get("/orders",          getAllOrdersAdmin);
router.get("/subscriptions",   getAllSubscriptionsAdmin);
router.get("/activity",        getAdminActivity);

export default router;