import crypto from 'crypto';
import OTP from '../models/otp.js';
import sendEmail from '../utils/sendEmail.js';
import dotenv from 'dotenv';
dotenv.config();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashOTP = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const otpService = {
    async sendEmailOTP({ email, purpose = "register"}) {
        const otp = generateOTP();
        await OTP.deleteMany({ identifier: email, type: "email", purpose });

        await OTP.create({
            identifier: email,
            otp: hashOTP(otp),
            type: "email",
            purpose,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // Expires in 10 minutes
        })

        await sendEmail({
            to : email,
            subject: "your OTP for wishmilk",
            html: `
                <div style="font-family:sans-serif;max-width:400px;margin:auto">
                    <h2 style="color:#4F46E5">WishMilk 🥛</h2>
                    <p>Your OTP for <strong>${purpose}</strong> is:</p>
                    <h1 style="letter-spacing:8px;color:#4F46E5">${otp}</h1>
                    <p>This OTP expires in <strong>10 minutes</strong>.</p>
                    <p style="color:#999">If you didn't request this, please ignore this email.</p>
                </div>
            `,
        })
        return { success: true, message: `OTP sent to ${email}` };
        
    },

    async sendSMSOTP({ phone, purpose = "register" }){
        const otp = generateOTP();
        await OTP.deleteMany({ identifier: phone, type: "phone", purpose });
        await OTP.create({
            identifier: phone,
            otp: hashOTP(otp),
            type: "phone",
            purpose,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });
         // MSG91 API
        const axios = (await import("axios")).default;
        await axios.post(
            "https://api.msg91.com/api/v5/flow/",
            { template_id: process.env.MSG91_TEMPLATE_ID, short_url: "0", mobiles: `91${phone}`, var1: otp },
            { headers: { authkey: process.env.MSG91_AUTH_KEY, "Content-Type": "application/json" } }
        );
        return { success: true, message: "OTP sent to phone" };
    },

    async verifyOTP({ identifier, otp, purpose = "register" }){
        const record = await OTP.findOne({
            identifier,
            otp: hashOTP(otp),
            purpose,
            expiresAt: { $gt: new Date() },
            verified: false
        });

        if(!record){
            return { success: false, message: "Invalid or expired OTP" };
        }

        record.verified = true;
        await record.save();
        await OTP.deleteOne({ _id: record._id });  //to delete the verified otp
        return { success: true, message: "OTP verified successfully" };
    },

}
export default otpService; 