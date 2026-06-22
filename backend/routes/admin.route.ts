import express from "express";
import { requireAuth } from "../middleware/auth.middleware.ts";
import {  postPackage, updatePackage } from "../controllers/admin.controller.ts";

const adminRouter = express.Router();

adminRouter.post("/",requireAuth ,postPackage);
adminRouter.patch("/:id",requireAuth ,updatePackage);


export default adminRouter;