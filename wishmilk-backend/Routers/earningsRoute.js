import express from "express";
import {
  getOwnerEarnings,
  getRiderEarnings,
  requestPayout,
  getMyPayouts,
  getAllPayouts,
  updatePayoutStatus,
} from "../Controllers/earningsController.js";
import { protect, restrictTo } from "../middlewares/auth.js";

const router = express.Router();

router.use(protect);

// Dairy owner
router.get("/owner", restrictTo("dairyOwner"), getOwnerEarnings);

// Delivery rider
router.get("/rider", restrictTo("deliveryPerson"), getRiderEarnings);

// Shared — either role can request a payout from their own balance and
// see their own payout history. "/payouts/my" is registered ahead of the
// admin "/payouts/:id" below only for readability — they're different
// HTTP methods, so there's no actual route-matching collision.
router.post("/payouts", restrictTo("dairyOwner", "deliveryPerson"), requestPayout);
router.get("/payouts/my", restrictTo("dairyOwner", "deliveryPerson"), getMyPayouts);

// Admin — review and settle payout requests across everyone.
router.get("/payouts", restrictTo("admin"), getAllPayouts);
router.patch("/payouts/:id", restrictTo("admin"), updatePayoutStatus);

export default router;