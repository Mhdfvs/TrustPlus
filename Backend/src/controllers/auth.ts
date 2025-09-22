import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import Users, { IUser } from "../models/users";

// --- Token Generators ---
const generateAccessToken = (id: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");
  return jwt.sign({ id }, secret, { expiresIn: "1h" });
};

const generateRefreshToken = (id: string) => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) throw new Error("REFRESH_TOKEN_SECRET is not defined");
  return jwt.sign({ id }, secret, { expiresIn: "7d" });
};

// --- Register Controller ---
export const registerUser = async (req: Request, res: Response) => {
  try {
    console.log("📩 /register route hit with body:", req.body);

    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    if (!name || !email || !password) {
      console.warn("⚠️ Missing fields:", { name, email, password });
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      console.warn("⚠️ User already exists:", email);
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user: IUser = await Users.create({ name, email, password: hashedPassword });

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    const { password: _, ...userWithoutPassword } = user.toObject();

    console.log("✅ User registered successfully:", userWithoutPassword);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("❌ /register error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err instanceof Error ? err.message : err });
  }
};

// --- Login Controller ---
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user: IUser | null = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    const { password: _, ...userWithoutPassword } = user.toObject();

    return res.json({
      success: true,
      message: "Login successful",
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("❌ /login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// --- Refresh Token Controller ---
export const refreshToken = (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: "Refresh token is required" });
  }

  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) throw new Error("REFRESH_TOKEN_SECRET is not defined");

  try {
    const decoded = jwt.verify(refreshToken, secret) as JwtPayload & { id?: string };
    if (!decoded?.id) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const newAccessToken = generateAccessToken(decoded.id);
    return res.json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    console.error("❌ /refresh error:", err);
    return res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
};
