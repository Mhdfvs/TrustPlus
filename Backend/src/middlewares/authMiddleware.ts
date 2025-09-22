import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import Users, { IUser } from "../models/users";

interface AuthRequest extends Request {
  user?: Omit<IUser, "password"> | null;
}

interface DecodedToken extends JwtPayload {
  id: string;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      // Extract token
      token = req.headers.authorization.split(" ")[1];

      // Verify token and cast
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as DecodedToken;

      // Attach user (excluding password)
      req.user = await Users.findById(decoded.id).select("-password");

      if (!req.user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      return next();
    } catch (err) {
      console.error("❌ JWT verification failed:", err);
      res.status(401).json({ message: "Not authorized, token failed" });
      return;
    }
  }

  res.status(401).json({ message: "Not authorized, no token" });
};
