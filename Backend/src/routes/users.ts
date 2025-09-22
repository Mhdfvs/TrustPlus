import { Router } from "express";
import { createUser, listUsers } from "../controllers/users";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Get all users (protected)
 * @access  Private
 */
router.get("/", protect, listUsers);

/**
 * @route   POST /api/users
 * @desc    Create a user (public)
 * @access  Public
 */
router.post("/", createUser);

export default router;
