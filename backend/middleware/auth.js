import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  try {
    const token = req.cookies[process.env.COOKIE_NAME || "app_session"];
    if (!token) return res.status(401).json({ error: "unauthorized" });
    req.auth = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "unauthorized" });
  }
}
