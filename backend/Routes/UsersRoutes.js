import {Router} from "express";
import { Signup,SignInEmail,SignInGoogle,logout,me} from "../Controllers/UsersContollers.js";

const router = Router();

router.post("/register", Signup);
router.post("/login", SignInEmail);
router.post("/login/google", SignInGoogle);
router.post("/logout", logout);
router.get("/me", me);


export default router;