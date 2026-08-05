// import { Router } from "express";
// import { userRegister, userAddress } from "../Controllers/userController.js";
// const router = Router();

// router.post('/register', userRegister);
// router.post('/addAddress', userAddress);

// export default router;




import { Router } from "express";
import {
    userRegister,
    userLogin,
    getProfile,
    updateProfile,
    becomeDairyOwner,
    becomeDeliveryPerson,
    getRidersForDairy,
    updateMyLocation,
    changePassword,
    deactivateAccount,
    userAddress,
    getUserAddresses,
    deleteAddress,
    reactivateAccount,
    forgotPassword,
    resetPassword
} from "../Controllers/userController.js";
import { protect } from "../middlewares/auth.js";
import { authRateLimiter } from "../middlewares/security.js";

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────
router.post('/register', authRateLimiter, userRegister);
router.post('/login', authRateLimiter, userLogin);
router.patch('/reactivate', authRateLimiter, reactivateAccount);
router.post('/forgot-password', authRateLimiter, forgotPassword);
router.post('/reset-password/:token', authRateLimiter, resetPassword);

// ─── Private Routes (requires login) ─────────────────────────────
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.patch('/become-dairy-owner', protect, becomeDairyOwner);
router.patch('/become-delivery-person', protect, becomeDeliveryPerson);
router.get('/riders/:dairyId', protect, getRidersForDairy);
router.patch('/location', protect, updateMyLocation);
router.patch('/change-password', protect, changePassword);
router.patch('/deactivate', protect, deactivateAccount);

// ─── Address Routes ───────────────────────────────────────────────
router.post('/address', protect, userAddress);
router.get('/address', protect, getUserAddresses);
router.delete('/address/:id', protect, deleteAddress);

export default router;
