import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import connectDB from "./config/db";
import mongoose from "mongoose";

const PORT: number = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    process.on("unhandledRejection", (reason: any) => {
      console.error("❌ Unhandled Rejection:", reason);
      server.close(() => process.exit(1));
    });

    process.on("SIGINT", async () => {
      console.log("\n🛑 Shutting down gracefully...");
      await mongoose.connection.close();
      await new Promise<void>((resolve: () => void) => server.close(resolve));
      console.log("🔌 MongoDB connection closed, server stopped.");
      process.exit(0);
    });


  } catch (err: unknown) {
    if (err instanceof Error) console.error("❌ Failed to start server:", err.message);
    else console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
