import type { Request, Response } from "express";
import { apiResponse } from "../helpers/apiResponse.ts";
import { prisma } from "../lib/prisma.ts";
import type { Analytics } from "../types/analytics.ts";

type Range = "day" | "week" | "month";

export const days = async (req: Request, res: Response) => run(req, res, "day");
export const weeks = async (req: Request, res: Response) => run(req, res, "week");
export const months = async (req: Request, res: Response) => run(req, res, "month");

async function run(req: Request, res: Response, range: Range) {
  try {
    let rows: Analytics;
    const now = new Date();

    if (range === "day") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      rows = await prisma.$queryRaw`
        SELECT DATE("createdAt") AS timestamp,
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
    } else if (range === "week") {
      rows = await prisma.$queryRaw`
        SELECT date_trunc('week', "createdAt")::date AS "timestamp",
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
    } else {
      rows = await prisma.$queryRaw`
        SELECT date_trunc('month', "createdAt")::date AS "timestamp",
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
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json(apiResponse(404, { message: "No bookings found" }));
    }

    return res.status(200).json(apiResponse(200, { message: "ok", data: rows }));
  } catch (error) {
    return res.status(500).json(apiResponse(500, { message: "Internal server error" }));
  }
}