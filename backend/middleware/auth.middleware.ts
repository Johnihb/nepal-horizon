import type { NextFunction, Request, Response } from "express";
import {auth} from "../lib/auth.ts"
import { fromNodeHeaders } from "better-auth/node";

const requireAuth = async (req:Request , res:Response , next:NextFunction ) => {
  try{

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
}catch(error){
   console.error("Admin authentication error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
  

export { requireAuth }