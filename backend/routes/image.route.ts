import {Router} from "express";
import { deleteImage, deleteImages, imageSignedUrl } from "../controllers/image.controller.ts";
import { requireAuth } from "../middleware/auth.middleware.ts";

const imageRouter = Router();

imageRouter.get("/",imageSignedUrl);
imageRouter.delete("/:id", deleteImage);
imageRouter.delete('/package/:packageId', deleteImages);
export default imageRouter