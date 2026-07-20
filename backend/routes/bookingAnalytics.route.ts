import { Router } from "express";
import { days, months, weeks } from "../controllers/bookingAnalytics.controller.ts";
import { requireAuth } from "../middleware/auth.middleware.ts";

const bookingAnalyticsRoute = Router()

bookingAnalyticsRoute.get('/days' , requireAuth ,days)
bookingAnalyticsRoute.get('/weeks' ,requireAuth ,weeks )
bookingAnalyticsRoute.get('/months' , requireAuth,months )

export default bookingAnalyticsRoute