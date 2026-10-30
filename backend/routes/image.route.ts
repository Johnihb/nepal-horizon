import {Router} from "express";
import { deleteImage, deleteImages, imageSignedUrl } from "../controllers/image.controller.ts";

const imageRouter = Router();

imageRouter.get("/",imageSignedUrl);
imageRouter.delete("/:id", deleteImage);
imageRouter.delete('/package/:packageId', deleteImages);
export default imageRouter