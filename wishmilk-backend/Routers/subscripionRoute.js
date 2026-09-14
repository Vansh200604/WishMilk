import express from "express";
import {
    createSubscription,
    getMySubscriptions,
    getSubscriptionById,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,
    triggerGeneration,
} from "../Controllers/subscriptionController.js";
import { protect, restrictTo } from "../middlewares/auth.js";

const router = express.Router();

router.use(protect);

router.post("/",                  createSubscription);
router.get("/my-subscriptions",   getMySubscriptions);
router.post("/generate-now",      restrictTo("admin"), triggerGeneration);
router.get("/:id",                getSubscriptionById);
router.patch("/:id/pause",        pauseSubscription);
router.patch("/:id/resume",       resumeSubscription);
router.patch("/:id/cancel",       cancelSubscription);

export default router;