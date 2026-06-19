import "express";
import { auth } from "../lib/auth.ts";


type Session=typeof auth.$Infer.Session
declare global {
  namespace Express {
    interface Request {
      session?: Session; // replace with Better Auth session type
    }
  }
}

export {};