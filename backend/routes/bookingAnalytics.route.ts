import { Router } from "express";
import { days, months, weeks } from "../controllers/bookingAnalytics.controller.ts";
import { requireAuth } from "../middleware/auth.middleware.ts";

const bookingAnalyticsRoute = Router()

bookingAnalyticsRoute.get('/days',days)
bookingAnalyticsRoute.get('/weeks',weeks )
bookingAnalyticsRoute.get('/months',months )

export default bookingAnalyticsRoute