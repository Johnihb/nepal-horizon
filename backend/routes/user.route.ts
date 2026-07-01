import { Router } from "express";
import { bookPackage, deletePackage, getPackageDetail, getPackages } from "../controllers/user.controller.ts";
import { requireAuth } from "../middleware/auth.middleware.ts";

const userRouter = Router()

userRouter.get("/packages",getPackages)
userRouter.post("/package/booking/:packageId",requireAuth,  bookPackage)
userRouter.delete('/package/:packageId',requireAuth ,deletePackage)
userRouter.get('/package/:packageId' ,getPackageDetail)

export default userRouter