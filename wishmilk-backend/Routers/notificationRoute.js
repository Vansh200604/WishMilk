import express from "express";
import {
  getMyNotifications,
  markAsRead,
  markAllRead,
  deleteNotification,
} from "../Controllers/notificationController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.use(protect);

router.get("/",              getMyNotifications);
router.patch("/read-all",    markAllRead);
router.patch("/:id/read",    markAsRead);
router.delete("/:id",        deleteNotification);

export default router;