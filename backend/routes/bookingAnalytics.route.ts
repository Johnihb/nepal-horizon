import { Router } from "express";

const bookingAnalyticsRoute = Router()

bookingAnalyticsRoute.get('/days' , (req, res) => {
  res.json({message:"hello"})
})
bookingAnalyticsRoute.get('/weeks' , (req, res) => {
  res.json({message:"hello"})
})
bookingAnalyticsRoute.get('/months' , (req, res) => {
  res.json({message:"hello"})
})

export default bookingAnalyticsRoute