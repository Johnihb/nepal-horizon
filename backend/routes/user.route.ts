import { Router } from "express";
import { deletePackage, getPackages } from "../controllers/user.controller.ts";

const userRouter = Router()

userRouter.get("/packages",getPackages)
userRouter.delete('/package/:packageId',deletePackage)

export default userRouter