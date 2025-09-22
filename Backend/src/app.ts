import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";

dotenv.config();

const app: Application = express();

// --- Middleware ---
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// --- Health Check Route ---
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" }); // DB connection handled in index.ts
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// --- 404 Handler ---
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// --- Global Error Handler ---
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof Error) console.error("❌ Server Error:", err.message);
  else console.error("❌ Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
