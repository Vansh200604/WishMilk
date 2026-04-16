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

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────
router.post('/register', userRegister);
router.post('/login', userLogin);
router.patch('/reactivate', reactivateAccount);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// ─── Private Routes (requires login) ─────────────────────────────
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.patch('/change-password', protect, changePassword);
router.patch('/deactivate', protect, deactivateAccount);

// ─── Address Routes ───────────────────────────────────────────────
router.post('/address', protect, userAddress);
router.get('/address', protect, getUserAddresses);
router.delete('/address/:id', protect, deleteAddress);

export default router;
