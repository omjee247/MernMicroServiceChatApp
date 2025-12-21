import { generateKey } from "crypto";
import { publishToQueue } from "../config/rabbitmq.js";
import tryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import { User } from "../models/User.js";
import { generateToken } from "../config/generateToken.js";
export const loginUser = tryCatch(async (req, res) => {
    const { email } = req.body;
    const rateLimitKey = `otp.ratelimit:${email}`;
    const rateLimit = await redisClient.get(rateLimitKey);
    if (rateLimit) {
        res.status(429).json({ message: "Rate limit exceeded. Please try again after some time." });
        return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `otp:${email}`;
    const otpExpiry = 5 * 60; // 5 min in seconds
    await redisClient.set(otpKey, otp, { EX: otpExpiry });
    await redisClient.set(rateLimitKey, "true", { EX: 60 });
    const message = {
        to: email,
        subject: "Your OTP Code",
        body: `Your OTP code is ${otp}. It is valid for 5 minutes.`
    };
    await publishToQueue("send-otp", message);
    res.status(200).json({ message: "OTP sent to your email successfuly" });
});
export const verifyUser = tryCatch(async (req, res) => {
    const { email, otp: enteredOTP } = req.body;
    if (!email || !enteredOTP) {
        res.status(400).json({ message: "Email and OTP are required" });
        return;
    }
    const otpKey = `otp:${email}`;
    const storedOtp = await redisClient.get(otpKey);
    if (!storedOtp || storedOtp != enteredOTP) {
        res.status(400).json({ message: "Invalid or expired OTP" });
        return;
    }
    await redisClient.del(otpKey);
    let user = await User.findOne({ email });
    if (!user) {
        const name = email.slice(0, email.indexOf("@"));
        user = await User.create({ name, email });
        console.log(name);
    }
    //    console.log(user);
    const token = generateToken(user);
    res.json({
        message: "User verified",
        user,
        token
    });
});
export const updateName = tryCatch(async (req, res) => {
    const user = await User.findById(req.user?._id);
    if (!user) {
        res.status(404).json({
            messgae: "Please Login"
        });
        return;
    }
    user.name = req.body.name;
    await user.save();
    const token = generateToken(user);
    res.json({
        message: "User Updated",
        user,
        token,
    });
});
export const getAllUser = tryCatch(async (req, res) => {
    const users = await User.find();
    res.json(users);
});
export const getUser = tryCatch(async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user);
});
//# sourceMappingURL=user.js.map