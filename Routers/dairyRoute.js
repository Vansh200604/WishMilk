import express from 'express';
import {
    createDairy,
    getAllDairies,
    getNearbyDairies,
    getDairyById,
    updateDairy,
    toggleDairyStatus,
    updateMilkPricing,
    getMyDairy,
    deleteDairy
} from '../Controllers/dairyController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// ─── Public Routes ───────────────────────────────────────────────
router.get('/', getAllDairies);
router.get('/nearby', getNearbyDairies);
router.get('/owner/my-dairy', protect, getMyDairy);
router.get('/:id', getDairyById);

// ─── Private Routes (requires login) ─────────────────────────────
router.post('/', protect, createDairy);
// router.get('/owner/my-dairy', protect, getMyDairy);
router.put('/:id', protect, updateDairy);
router.patch('/:id/toggle-status', protect, toggleDairyStatus);
router.patch('/:id/pricing', protect, updateMilkPricing);
router.delete('/:id', protect, deleteDairy);

export default router;