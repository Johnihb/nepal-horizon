import type { NextFunction, Request, Response } from "express";
import {auth} from "../lib/auth.ts"
import { fromNodeHeaders } from "better-auth/node";

const requireAuth = async (req:Request , res:Response , next:NextFunction ) => {
  const session = await auth.api.getSession(
    {
      headers: fromNodeHeaders(req.headers),
    }
  )

  if (!session) {
   	return res.status(401).json({ error: "Unauthorized" });
  }


  
  req.session = session;
  next()  
}

export { requireAuth }