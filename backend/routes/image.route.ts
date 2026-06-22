import {Router} from "express";
import { deleteImage, deleteImages, imageSignedUrl } from "../controllers/image.controller.ts";
import { requireAuth } from "../middleware/auth.middleware.ts";

const router = Router();

router.get("/", requireAuth, imageSignedUrl);
router.delete("/:id", requireAuth, deleteImage);
router.delete('/package/:packageId' , requireAuth, deleteImages);
export default router