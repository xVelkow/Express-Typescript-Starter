import { Router } from "express";
import { register, login, logout, getCurrentUser } from "../controllers/user.controller";
import { isAuthenticated, isNotAuthenticated } from "../middlewares/user.middleware";
import { authenticatedRateLimiter } from "@core/security/rateLimiter";

const authRouter = Router();

authRouter.post("/register", isNotAuthenticated, register);

authRouter.post("/login", login);

authRouter.post("/logout", isAuthenticated, logout);

authRouter.get("/current", isAuthenticated, authenticatedRateLimiter, getCurrentUser);

export default authRouter;