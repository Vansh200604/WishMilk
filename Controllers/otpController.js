import optService from '../services/otpService.js';
import User from '../models/user.js';

export const sendEmailOTP = async (req, res) => {
    try{
        const {email, purpose='register'} = req.body;
        if(!email){
            return res.status(400).json({success: false, message: "Email is required"});
        }
        if(purpose === "register"){
            const exists = await User.findOne({email});
            if(exists){
                return res.status(400).json({success: false, message: "Email already registered"}); 
            }
        }
        const result = await optService.sendEmailOTP({email, purpose});
        res.status(200).json(result);
    }
    catch(error){
        console.error("Error in sendEmailOTP:", error);
        res.status(500).json({success: false, message: "Internal server error"});
    }
}

export const sendPhoneOTP = async (req, res) => {
    try{
        const {phone, purpose="register"} = req.body;
        if(!phone){
            return res.status(400).json({success: false, message: "Phone number is required"});
        }
        const result = await optService.sendSMSOTP({phone, purpose});
        res.status(200).json(result);

    }
    catch(error){
        console.error("Error in sendSMSOTP  :", error);
        res.status(500).json({success: false, message : "Error sending phone OTP"});

    }
}

export const verifyOTP = async (req, res) => {
    try{
        const {identifier, otp, purpose = "register"} = req.body;
        if(!identifier || !otp){
            return res.status(400).json({success: false, message: "Identifier and OTP are required"});
        }
        const result = await optService.verifyOTP({identifier, otp, purpose});
        if(!result.success){
            return res.status(400).json(result);
        }
        res.status(200).json(result);
    }
    catch(error){
        console.error("Error in verifyOTP:", error);
        res.status(500).json({success: false, message: "Error verifying OTP", error: error.message});
    }
}