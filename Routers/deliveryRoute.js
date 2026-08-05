import express from "express";
import {
    createDelivery,
    assignRider,
    getDeliveryByOrder,
    updateDeliveryStatus,
    updateLiveLocation,
    getTimeline,
    getMyDeliveries,
    // confirmDelivery, // restart
    // declineDelivery,  // restart
} from "../Controllers/deliveryController.js";
import { protect, restrictTo } from "../middlewares/auth.js";

const router = express.Router();

router.use(protect);

// Delivery rider routes
router.get("/my-deliveries", restrictTo("deliveryPerson"), getMyDeliveries);
// router.patch("/:id/confirm", restrictTo("deliveryPerson"), confirmDelivery);   //restart
// router.patch("/:id/decline", restrictTo("deliveryPerson"), declineDelivery);   //restart

// Shared read routes — the controller itself checks whether this specific
// user (customer / assigned rider / owning dairy / admin) may see it.
router.get("/order/:orderId", getDeliveryByOrder);
router.get("/:id/timeline",  getTimeline);

// Dairy owner / admin routes
router.post("/",              restrictTo("dairyOwner", "admin"), createDelivery);
router.patch("/:id/assign",   restrictTo("dairyOwner", "admin"), assignRider);
 
// Dairy owner, assigned rider, or admin — controller checks which
router.patch("/:id/status",   restrictTo("dairyOwner", "admin"), updateDeliveryStatus);
router.patch("/:id/location", restrictTo("dairyOwner", "admin"), updateLiveLocation);   // change bug dairy_owner to dairyOwner

export default router;