import express from "express";
import { requireAuth } from "../middleware/auth.middleware.ts";
import {  deletePackage, postPackage, updatePackage } from "../controllers/admin.controller.ts";

const adminRouter = express.Router();

adminRouter.post("/", requireAuth, postPackage);adminRouter.patch("/:id",requireAuth ,updatePackage);
adminRouter.delete("/:id",requireAuth ,deletePackage);


export default adminRouter;