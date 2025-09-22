import { Request, Response } from "express";
import Users, { IUser } from "../models/users";
import bcrypt from "bcryptjs";

/**
 * GET /api/users
 * List all users (protected)
 */
export const listUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const allUsers: IUser[] = await Users.find().select("-password").lean();
    res.status(200).json(allUsers);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ message: "Server error while fetching users" });
  }
};

/**
 * POST /api/users
 * Create a new user (registration, public)
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password }: { name: string; email: string; password: string } = req.body;

    // Validate input
    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email, and password are required" });
      return;
    }

    // Check if email already exists
    const existingUser: IUser | null = await Users.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }

    // Hash password
    const hashedPassword: string = await bcrypt.hash(password, 10);

    // Save new user
    const newUser: IUser = await Users.create({
      name,
      email,
      password: hashedPassword,
    });

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json(userWithoutPassword);
  } catch (err) {
    console.error("❌ Error creating user:", err);
    res.status(500).json({ message: "Server error while creating user" });
  }
};
