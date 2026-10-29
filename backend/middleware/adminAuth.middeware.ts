
import type { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth.ts";
import { fromNodeHeaders } from "better-auth/node";

const adminAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    // User is not authenticated
    if (!session) {
      return res.status(401).json({
        error: "Unauthorized: Please log in",
      });
    }

    // User is authenticated but is not an admin
    if (session.user.role?.toLowerCase() !== "admin") {
      return res.status(403).json({
        error: "Forbidden: Admin access required",
      });
    }

    req.session = session;

    return next();
  } catch (error) {
    console.error("Admin authentication error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export { adminAuth };
