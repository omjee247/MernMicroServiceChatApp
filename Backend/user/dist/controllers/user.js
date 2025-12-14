import { publishToQueue } from "../config/rabbitmq.js";
import tryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
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
//# sourceMappingURL=user.js.map