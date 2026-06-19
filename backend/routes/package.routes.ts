import express from "express";
import { requireAuth } from "../middleware/auth.middleware.ts";
import { postPackage } from "../controllers/package.controller.ts";

const packagesRouter = express.Router();

packagesRouter.post("/",requireAuth ,postPackage);

export default packagesRouter;