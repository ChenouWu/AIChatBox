import User from '../Schemas/Users.js';
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";

const sign = (u) =>jwt.sign({ uid: u._id.toString(), email: u.email }, process.env.JWT_SECRET, { expiresIn: "7d" })
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const Signup = async (req, res) => {
    try{
        const { email, password,name } = req.body;
        if(!email || !password){
            return res.status(400).json({error: "Email and password are required"});
        }
         const hash = await bcrypt.hash(password, 10);
           const user = await User.create({
            email: email.toLowerCase().trim(),
            password: hash,
            name,
            provider: "credentials",
            credits: process.env.FREE_CREDITS,
        });
        
        res.cookie(process.env.COOKIE_NAME, sign(user), {
            httpOnly: true,
            secure: true,  
            sameSite: "none", 
            path: "/",
          });
        res.json(user);
    }catch(err){
       if (err?.code === 11000 && err?.keyPattern?.email) {
        return res.status(409).json({ error: "This email is already registered. Try logging in instead." });
    }
        return res.status(500).json({error: err.message});
    }

}

const SignInGoogle = async (req, res) => {
  try {
    const { idToken } = req.body; 
    if (!idToken) {
      return res.status(400).json({ error: "Missing idToken" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload(); // { sub, email, name, picture, ... }

    if (!payload?.email) {
      return res.status(400).json({ error: "Google token invalid" });
    }

    let user = await User.findOne({ email: payload.email.toLowerCase().trim(), provider: "google" });

    if (!user) {
      user = await User.create({
        email: payload.email.toLowerCase().trim(),
        name: payload.name,
        provider: "google",
        credits: process.env.FREE_CREDITS || 50000,
      });
    }
         res.cookie(process.env.COOKIE_NAME, sign(user), {
            httpOnly: true,
            secure: true,  
            sameSite: "none", 
            path: "/",
});
    res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Google login failed" });
  }
};

const SignInEmail = async (req, res) => {
  try {
    
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: "missing email/password" });

      const user = await User.findOne({ email: email.toLowerCase().trim(), provider: "credentials" });
      if (!user) return res.status(401).json({ error: "user not found" });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ error: "wrong password" });

         res.cookie(process.env.COOKIE_NAME, sign(user), {
            httpOnly: true,
            secure: true,   
            sameSite: "none", 
            path: "/",
});
      return res.json(user);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "login failed" });
  }
};

const logout = async (_req, res) => {
  try {
    res.clearCookie(process.env.COOKIE_NAME || "session", {
      httpOnly: true,
      secure: true,  
      sameSite: "none",
      path: "/",
    });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Logout failed" });
  }
};

const me = async (req, res) => {
  try {
    const token = req.cookies[process.env.COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.uid).select("-password"); 
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};



export { Signup, SignInEmail,SignInGoogle,logout,me};