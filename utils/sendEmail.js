import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendEmail = async ({ to, subject, html }) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS   // Gmail App Password
        }
    });

    await transporter.sendMail({
        from: `"vansh042006@gmail.com" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    });
};

export default sendEmail;