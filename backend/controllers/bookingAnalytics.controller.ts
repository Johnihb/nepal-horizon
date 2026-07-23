import type { Request, Response } from "express"
import { apiResponse } from "../helpers/apiResponse.ts";
import { prisma } from "../lib/prisma.ts";

export const days = async (req: Request, res: Response) => {
const now = new Date();
const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);


const dailyBookings = await prisma.$queryRaw`
  SELECT 
    DATE("createdAt") AS timestamp,
    COUNT(*)::integer AS count,
    SUM("price")::integer AS revenue,
    SUM("totalPeople")::integer AS "totalPeople"
  FROM "Booking"
  WHERE "createdAt" >= ${sevenDaysAgo}
  AND "status" != 'CANCELLED'
  AND "createdAt" < ${now}
  GROUP BY DATE("createdAt")
  ORDER BY DATE("createdAt") ASC
`;


console.log("Daily Sales for the last 7 days:", dailyBookings);

return res.status(200).json(apiResponse(200,{message:"ok", data:dailyBookings}))
  
}

export const weeks = async (req: Request, res: Response) => {
const now = new Date();

const weekAnalytics = await prisma.$queryRaw`
  SELECT 
    date_trunc('week', "createdAt")::date AS "timestamp",
    COUNT(*)::integer AS count,
    SUM("price")::integer AS revenue,
    SUM("totalPeople")::integer AS "totalPeople"
  FROM "Booking"
  WHERE "createdAt" >= date_trunc('week', ${now}::timestamptz) - interval '6 weeks'
    AND "createdAt" < date_trunc('week', ${now}::timestamptz) + interval '7 days'
    AND "status" != 'CANCELLED'
  GROUP BY date_trunc('week', "createdAt")
  ORDER BY "timestamp" ASC
`;

console.log('Past 7 weeks analytics:', weekAnalytics);

return res.status(200).json(apiResponse(200, { message: "ok", data: weekAnalytics }));

}

export const months = async (req: Request, res: Response) => {
  return res.json({message:"hello"})
}