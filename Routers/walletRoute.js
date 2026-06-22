import express from "express";
import {
    getMyWallet,
    getTransactions,
    addMoney,
    redeemLoyaltyPoints,
} from "../Controllers/walletController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.use(protect);

router.get("/",               getMyWallet);
router.get("/transactions",   getTransactions);
router.post("/add-money",     addMoney);
router.post("/redeem-points", redeemLoyaltyPoints);

export default router;