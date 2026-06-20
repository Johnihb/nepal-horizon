import express from "express";
import { requireAuth } from "../middleware/auth.middleware.ts";
import { getPackages, postPackage } from "../controllers/package.controller.ts";

const packagesRouter = express.Router();

packagesRouter.post("/",requireAuth ,postPackage);
packagesRouter.get("",getPackages);

export default packagesRouter;