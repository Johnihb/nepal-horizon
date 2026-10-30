import express from "express";
import { requireAuth } from "../middleware/auth.middleware.ts";
import {  deletePackage, getBookings, postPackage, updatePackage, updatePackageStatus } from "../controllers/admin.controller.ts";

const adminRouter = express.Router();

adminRouter.post("/", postPackage);
adminRouter.get("/bookings", getBookings);
adminRouter.patch("/booking/status", updatePackageStatus);
adminRouter.patch("/:id", updatePackage);
adminRouter.delete("/:id", deletePackage);
// adminRouter.patch("/:id", updatePackage);


export default adminRouter;