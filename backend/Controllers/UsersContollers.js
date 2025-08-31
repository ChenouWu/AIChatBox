import User from "../Schemas/Users.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";

const sign = (u) =>
  jwt.sign({ uid: u._id.toString(), email: u.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✅ 统一 cookie 名称（有默认值）
const COOKIE_NAME = process.env.COOKIE_NAME || "app_session";
const isProd = process.env.NODE_ENV === "production";
const cookieOpts = {
  httpOnly: true,
  sameSite: isProd ? "none" : "lax", // 线上跨站必须 none
  secure: isProd,                    // Render/HTTPS 必须 true；本地 false
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const Signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase().trim(),
      password: hash,
      name,
      provider: "credentials",
      credits: process.env.FREE_CREDITS,
    });

    // ✅ 设置 cookie: 用 COOKIE_NAME + 统一选项
    res.cookie(COOKIE_NAME, sign(user), cookieOpts);
    return res.json(user);
  } catch (err) {
    if (err?.code === 11000 && err?.keyPattern?.email) {
      return res
        .status(409)
        .json({ error: "This email is already registered. Try logging in instead." });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const SignInGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: "Missing idToken" });

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) return res.status(400).json({ error: "Google token invalid" });

    let user = await User.findOne({
      email: payload.email.toLowerCase().trim(),
      provider: "google",
    });
    if (!user) {
      user = await User.create({
        email: payload.email.toLowerCase().trim(),
        name: payload.name,
        provider: "google",
        credits: process.env.FREE_CREDITS || 50000,
      });
    }

    res.cookie(COOKIE_NAME, sign(user), cookieOpts);
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Google login failed" });
  }
};

export const SignInEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "missing email/password" });

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      provider: "credentials",
    });
    if (!user) return res.status(401).json({ error: "user not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "wrong password" });

    res.cookie(COOKIE_NAME, sign(user), cookieOpts);
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "login failed" });
  }
};

export const logout = async (_req, res) => {
  try {
    res.clearCookie(COOKIE_NAME, { ...cookieOpts, maxAge: 0 });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Logout failed" });
  }
};

export const me = async (req, res) => {
  try {
    // ✅ 读取 cookie: 用 COOKIE_NAME
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.uid).select("-password");
    if (!user) return res.status(401).json({ error: "User not found" });

    return res.json(user);
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
