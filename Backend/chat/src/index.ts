import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db.js';
import chatRoutes from './routes/chat.js'
import cors from 'cors';
import { app, server } from './config/socket.js';

dotenv.config();

connectDb();

// const app = express();

const PORT = process.env.PORT;

app.use(express.json())

app.use(cors());

app.use("/api/v1", chatRoutes);


server.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})