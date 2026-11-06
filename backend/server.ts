import express from "express";
import { toNodeHandler } from "better-auth/node";
import "dotenv/config";
import { auth } from "./lib/auth.ts";
import cors from "cors"
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import imageRouter from "./routes/image.route.ts";
import adminRouter from "./routes/admin.route.ts";
import userRouter from "./routes/user.route.ts";
import bookingAnalyticsRoute from "./routes/bookingAnalytics.route.ts";
import { adminAuth } from "./middleware/adminAuth.middeware.ts";
import { prisma } from "./lib/prisma.ts";

const app = express();
const PORT: number = Number(process.env.PORT) || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";

// Validate required env vars at startup
const requiredEnv = ["DATABASE_URL", "BETTER_AUTH_SECRET", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "BETTER_AUTH_URL", "GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}))

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"))
}

// Rate limit auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  // Session checks (GET /api/auth/get-session) fire on every page navigation.
  // Only rate-limit auth mutations (POST sign-in/sign-up/reset).
  skip: (req) => req.method === "GET",
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/auth", authLimiter);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Health check
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "unhealthy" });
  }
});

app.use("/api/v1/admin", adminAuth, adminRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/images", adminAuth, imageRouter);
app.use("/api/v1/bookingAnalytics", adminAuth, bookingAnalyticsRoute)

const server = app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

// Graceful shutdown
function shutdown() {
  server.close(() => {
    process.exit(0);
  });
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);