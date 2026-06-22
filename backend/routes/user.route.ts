import { Router } from "express";
import { getPackages } from "../controllers/user.controller.ts";

const userRouter = Router()

userRouter.get("/packages",getPackages)


export default userRouter