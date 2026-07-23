import type { Request, Response } from "express";
import { apiResponse } from "../helpers/apiResponse.ts";
import { prisma } from "../lib/prisma.ts";

export const days = async (req: Request, res: Response) => {
  try {
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

    if (!dailyBookings || dailyBookings?.length === 0)
      return res
        .status(404)
        .json(apiResponse(404, { message: "No bookings found" }));

    return res
      .status(200)
      .json(apiResponse(200, { message: "ok", data: dailyBookings }));
  } catch (error) {
    return res
      .status(500)
      .json(apiResponse(500, { message: "Internal server error" }));
  }
};

export const weeks = async (req: Request, res: Response) => {
  try {
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

    if (!weekAnalytics || weekAnalytics?.length === 0)
      return res
        .status(404)
        .json(apiResponse(404, { message: "No bookings found" }));

    return res
      .status(200)
      .json(apiResponse(200, { message: "ok", data: weekAnalytics }));
  } catch (error) {
    return res
      .status(500)
      .json(apiResponse(500, { message: "Internal server error" }));
  }
};

export const months = async (req: Request, res: Response) => {
  try {
    const now = new Date();

    const monthAnalytics = await prisma.$queryRaw`
  SELECT 
    date_trunc('month', "createdAt")::date AS "timestamp",
    COUNT(*)::integer AS count,
    SUM("price")::integer AS revenue,
    SUM("totalPeople")::integer AS "totalPeople"
  FROM "Booking"
  WHERE "createdAt" >= date_trunc('month', ${now}::timestamptz) - interval '5 months'
    AND "createdAt" < date_trunc('month', ${now}::timestamptz) + interval '1 month'
    AND "status" != 'CANCELLED'
  GROUP BY date_trunc('month', "createdAt")
  ORDER BY "timestamp" ASC
`;

    if (!monthAnalytics || monthAnalytics?.length === 0)
      return res
        .status(404)
        .json(apiResponse(404, { message: "No bookings found" }));

    return res
      .status(200)
      .json(apiResponse(200, { message: "ok", data: monthAnalytics }));
  } catch (error) {
    return res
      .status(500)
      .json(apiResponse(500, { message: "Internal server error" }));
  }
};
