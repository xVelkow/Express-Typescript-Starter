import { Router } from "express";
import { register, login, logout, getCurrentUser } from "../controllers/user.controller";
import { isAuthenticated, isNotAuthenticated } from "../middlewares/user.middleware";

const authRouter = Router();

authRouter.post("/register", isNotAuthenticated, register);

authRouter.post("/login", isNotAuthenticated, login);

authRouter.post("/logout", isAuthenticated, logout);

authRouter.get("/current", isAuthenticated, getCurrentUser);

export default authRouter;