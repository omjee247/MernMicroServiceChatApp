import amqp from 'amqplib';
import nodemailer from 'nodemailer';
export const startSendOTPConsumer = async () => {
    try {
        const connection = await amqp.connect({
            hostname: process.env.RABBITMQ_HOST,
            port: Number(process.env.RABBITMQ_PORT),
            username: process.env.RABBITMQ_USERNAME,
            password: process.env.RABBITMQ_PASSWORD
        });
        const channel = await connection.createChannel();
        const queue = 'send-otp';
        await channel.assertQueue(queue, { durable: true });
        console.log("Consumer service is running, waiting for OTP requests");
        channel.consume(queue, async (msg) => {
            if (msg != null) {
                try {
                    const { to, subject, body } = JSON.parse(msg.content.toString());
                    console.log("Received OTP request: ", { to, subject, text: body });
                    // Send OTP via email
                    const tranporter = nodemailer.createTransport({
                        host: process.env.SMTP_HOST,
                        port: Number(process.env.SMTP_PORT || '587'),
                        // secure: Number(process.env.SMTP_PORT) === 465,  // auto detect
                        auth: {
                            user: process.env.SMTP_USER,
                            pass: process.env.SMTP_PASSWORD
                        }
                    });
                    await tranporter.sendMail({
                        from: "CHAT APP",
                        to,
                        subject,
                        text: body
                    });
                    console.log(`OTP sent to ${to}`);
                    channel.ack(msg);
                }
                catch (error) {
                    console.error("Failed to send OTP:", error);
                    // channel.nack(msg);
                }
            }
        });
    }
    catch (error) {
        console.error(`Error in sendOtpConsumer: `, error);
    }
};
//# sourceMappingURL=consumer.js.map