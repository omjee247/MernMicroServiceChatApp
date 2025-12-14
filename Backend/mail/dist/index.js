import express from 'express';
import dotenv from 'dotenv';
import { startSendOTPConsumer } from './consumer.js';
dotenv.config();
startSendOTPConsumer();
const app = express();
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map