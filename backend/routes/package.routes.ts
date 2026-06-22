import express from "express";
import { requireAuth } from "../middleware/auth.middleware.ts";
import { getPackages, postPackage, updatePackage } from "../controllers/package.controller.ts";

const adminRouter = express.Router();

adminRouter.post("/",requireAuth ,postPackage);
adminRouter.get("",getPackages);
adminRouter.patch("/:id",requireAuth ,updatePackage);


export default adminRouter;