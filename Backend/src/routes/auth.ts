import { Router, Request, Response } from "express";
import { registerUser, loginUser, refreshToken } from "../controllers/auth";

const router = Router();

router.post("/register", (req: Request, res: Response, next) => {
  console.log("📩 /api/auth/register route hit with body:", req.body);
  next(); // pass control to controller
}, registerUser);

router.post("/login", (req: Request, res: Response, next) => {
  console.log("📩 /api/auth/login route hit with body:", req.body);
  next();
}, loginUser);

router.post("/refresh", (req: Request, res: Response, next) => {
  console.log("📩 /api/auth/refresh route hit with body:", req.body);
  next();
}, refreshToken);

export default router;
