import {Router} from "express";
import { imageSignedUrl } from "../controllers/image.controller.ts";
import { requireAuth } from "../middleware/auth.middleware.ts";

const router = Router();

router.get("/", requireAuth,imageSignedUrl);

export default router