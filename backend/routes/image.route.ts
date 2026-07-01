import {Router} from "express";
import { deleteImage, deleteImages, imageSignedUrl } from "../controllers/image.controller.ts";
import { requireAuth } from "../middleware/auth.middleware.ts";

const imageRouter = Router();

imageRouter.get("/", requireAuth ,imageSignedUrl);
imageRouter.delete("/:id", requireAuth, deleteImage);
imageRouter.delete('/package/:packageId' , requireAuth, deleteImages);
export default imageRouter