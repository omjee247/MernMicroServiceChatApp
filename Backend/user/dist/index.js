import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db.js';
import { createClient } from 'redis';
import userRoutes from './routes/user.js';
import { connectRabbitMq } from './config/rabbitmq.js';
dotenv.config();
connectDb();
connectRabbitMq();
const app = express();
app.use(express.json());
const port = process.env.PORT;
export const redisClient = createClient({
    url: process.env.REDIS_URL
});
// You can use but not recommneded, because it show the error of connection only
// redisClient.connect()
//     .then(() => console.log("Redis client connected"))
//     .catch((error) => console.error("Redis client connection error", error)
// );
// Recommended , because it shows all rediss runtime error before connection
redisClient.on("error", (error) => { console.log("Redis Client error:", error); });
(async () => {
    try {
        await redisClient.connect();
        console.log("Redis client connected");
    }
    catch (error) {
        console.log("Redis client connection error", error);
    }
})();
app.use("/api/user", userRoutes);
app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});
//# sourceMappingURL=index.js.map