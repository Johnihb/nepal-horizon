import { Router } from "express";
import { bookPackage, getBookedPackages, getPackageDetail, getPackages } from "../controllers/user.controller.ts";
import { requireAuth } from "../middleware/auth.middleware.ts";

const userRouter = Router()

userRouter.get("/packages",getPackages)
userRouter.post("/package/booking/:packageId",requireAuth,  bookPackage)
userRouter.get('/package/:packageId' ,getPackageDetail)
userRouter.get('/bookedPackages',requireAuth ,getBookedPackages)
export default userRouter