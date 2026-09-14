import express from "express";
import {sendEmailOTP, sendPhoneOTP, verifyOTP} from "../Controllers/otpController.js";

const router = express.Router();

router.post("/send-email", sendEmailOTP);
router.post("/send-sms", sendPhoneOTP);
router.post("/verify", verifyOTP);

export default router;
