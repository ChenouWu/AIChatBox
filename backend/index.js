import { connectDB } from './configs/db.js';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';   // ✅
import UsersRouter from './Routes/UsersRoutes.js';
const app = express();

dotenv.config();
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(cookieParser());  

app.use('/api/auth', UsersRouter);

app.listen(5000, () => {
    connectDB();
    console.log('Server is running on port 5000');
});
