import { Login,Signup,checkAuth,updateProfile } from "../controllers/userControllers.js";
import express from "express"
import { protectRoute } from "../lib/auth.js";

const userRouter= express.Router();

userRouter.post('/signup',Signup);
userRouter.post('/login',Login);
userRouter.put('/update-profile',protectRoute,updateProfile);
userRouter.get('/check',protectRoute,checkAuth);

export default userRouter;