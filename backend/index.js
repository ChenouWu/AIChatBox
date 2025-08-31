import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./configs/db.js";
import UsersRouter from "./Routes/UsersRoutes.js";
import ChatRoutes from "./Routes/ChatRoutes.js";

dotenv.config();

const app = express();

// 在代理（Render）后面，启用以确保 secure cookie 判定正确
app.set("trust proxy", 1);


const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://aichatbox-93ux.onrender.com",
];

// 放最前面：兜底 CORS 头（即使 401/500 也有 CORS 响应头）
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// 正式 CORS 中间件
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // 兼容 Postman/健康检查
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked: ${origin}`), false);
    },
    credentials: true,
  })
);

// 解析
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET)); // 带上 secret

// 路由
app.use("/api/auth", UsersRouter);
app.use("/api/chats", ChatRoutes);

// 健康检查
app.get("/health", (_req, res) => res.json({ ok: true }));

// ⚠️ Render 会注入 PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on :${PORT}`);
});
