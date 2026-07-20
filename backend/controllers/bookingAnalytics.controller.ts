import type { Request, Response } from "express"
import { prisma } from "../lib/prisma.ts";

export const days = async (req: Request, res: Response) => {
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);


const dailyBookings = await prisma.$queryRaw`
  SELECT 
    DATE("createdAt") AS day,
    COUNT(*)::integer AS count,
    SUM("price")::integer AS revenue,
    SUM("totalPeople")::integer AS "totalPeople"
  FROM "Booking"
  WHERE "createdAt" >= ${sevenDaysAgo}
  AND "status" != 'CANCELLED'
  GROUP BY DATE("createdAt")
  ORDER BY DATE("createdAt") ASC
`;



console.log("Daily Sales for the last 7 days:", dailyBookings);

return res.status(200).json({message:"ok", data:dailyBookings})
  
}

export const weeks = async (req: Request, res: Response) => {
  return res.json({message:"hello"})
}

export const months = async (req: Request, res: Response) => {
  return res.json({message:"hello"})
}