import nodemailer from "nodemailer";
import twilio from "twilio";
import axios from "axios";
import Notification from "../models/notification.js";
import dotenv from "dotenv";
dotenv.config();

// ─── Nodemailer Setup ────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Twilio Setup ────────────────────────────────────────────────────────────
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ─── MSG91 Helper ─────────────────────────────────────────────────────────────
const sendMSG91 = async (phone, message) => {
  const response = await axios.post(
    "https://api.msg91.com/api/v5/flow/",
    {
      template_id: process.env.MSG91_TEMPLATE_ID,
      short_url: "0",
      mobiles: `91${phone}`,
      var1: message,
    },
    {
      headers: {
        authkey: process.env.MSG91_AUTH_KEY,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// ─── FCM Push Helper ─────────────────────────────────────────────────────────
const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  const response = await axios.post(
    "https://fcm.googleapis.com/fcm/send",
    {
      to: fcmToken,
      notification: { title, body },
      data,
    },
    {
      headers: {
        Authorization: `key=${process.env.FCM_SERVER_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// ─── Core Dispatcher ─────────────────────────────────────────────────────────
const notificationService = {
  async sendEmail({ to, subject, html, userId, type, metadata }) {
    const log = new Notification({ user: userId, type, channel: "email", title: subject, message: html, metadata });
    try {
      await transporter.sendMail({ from: `"WishMilk" <${process.env.EMAIL_USER}>`, to, subject, html });
      log.status = "sent";
      log.sentAt = new Date();
    } catch (err) {
      log.status = "failed";
      log.errorLog = err.message;
    }
    await log.save();
    return log;
  },

  async sendTwilioSMS({ to, body, userId, type, metadata }) {
    const log = new Notification({ user: userId, type, channel: "sms", title: "SMS Notification", message: body, metadata });
    try {
      await twilioClient.messages.create({ body, from: process.env.TWILIO_PHONE_NUMBER, to: `+91${to}` });
      log.status = "sent";
      log.sentAt = new Date();
    } catch (err) {
      log.status = "failed";
      log.errorLog = err.message;
    }
    await log.save();
    return log;
  },

  async sendMSG91SMS({ to, message, userId, type, metadata }) {
    const log = new Notification({ user: userId, type, channel: "sms", title: "SMS Notification", message, metadata });
    try {
      await sendMSG91(to, message);
      log.status = "sent";
      log.sentAt = new Date();
    } catch (err) {
      log.status = "failed";
      log.errorLog = err.message;
    }
    await log.save();
    return log;
  },

  async sendPush({ fcmToken, title, body, data, userId, type, metadata }) {
    const log = new Notification({ user: userId, type, channel: "push", title, message: body, metadata });
    try {
      await sendPushNotification(fcmToken, title, body, data);
      log.status = "sent";
      log.sentAt = new Date();
    } catch (err) {
      log.status = "failed";
      log.errorLog = err.message;
    }
    await log.save();
    return log;
  },

  // Broadcast across all available channels for a user
  async notifyAll({ user, subject, message, type, metadata = {} }) {
    const tasks = [];

    if (user.email) {
      tasks.push(
        this.sendEmail({ to: user.email, subject, html: `<p>${message}</p>`, userId: user._id, type, metadata })
      );
    }

    if (user.phone) {
      tasks.push(this.sendTwilioSMS({ to: user.phone, body: message, userId: user._id, type, metadata }));
      tasks.push(this.sendMSG91SMS({ to: user.phone, message, userId: user._id, type, metadata }));
    }

    if (user.fcmToken) {
      tasks.push(
        this.sendPush({ fcmToken: user.fcmToken, title: subject, body: message, data: metadata, userId: user._id, type, metadata })
      );
    }

    return Promise.allSettled(tasks);
  },
};

export default notificationService;