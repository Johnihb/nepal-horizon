import express from "express";
import { requireAuth } from "../middleware/auth.middleware.ts";
import {  deletePackage, postPackage, updatePackage } from "../controllers/admin.controller.ts";

const adminRouter = express.Router();

adminRouter.post("/", postPackage);
adminRouter.patch("/:id", updatePackage);
adminRouter.delete("/:id", deletePackage);


export default adminRouter;