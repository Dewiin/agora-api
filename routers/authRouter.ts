import passport from "passport"
import { Router } from "express"
import { authController } from "@/controllers/authController";

// middleware
import { authValidator } from "@/middleware/validators/authValidator";
import { validateRequest } from "@/middleware/validateRequest";
import { verifyAuth } from "@/middleware/verifyAuth";

export const authRouter = Router();

authRouter.post("/signup", authValidator.validateSignup, validateRequest, authController.signup);
authRouter.post("/login", authValidator.validateLogin, validateRequest, authController.login);
authRouter.get("/logout", verifyAuth, authController.logout);