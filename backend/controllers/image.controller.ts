import { v2 as cloudinary } from "cloudinary";
import type { Request, Response } from "express";
import "dotenv/config";
import { prisma } from "../lib/prisma.ts";
import { apiResponse } from "../helpers/apiResponse.ts";

export const imageSignedUrl = (req: Request, res: Response) => {
  const timestamp = Math.round(Date.now() / 1000);
  const apiKey = process.env.CLOUDINARY_API_KEY as string;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME as string;
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      asset_folder: "e-tourism",//!must be same key and value when storing in frontend pass formData.append("asset_folder", "e-tourism")
    },
    process.env.CLOUDINARY_API_SECRET as string,
  );

  res.json({ timestamp, apiKey, signature, cloudName, folder: "e-tourism" });
};


export const deleteImage = async (req: Request, res: Response) => {
  try {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return res.status(400).json({ message: "Invalid image ID" });
  }
    const result = await cloudinary.uploader.destroy(id as string, {invalidate: true});
    if (result.result === 'ok') {
      return res.status(200).json({ message: "Image deleted successfully" });
    } else {
      return res.status(404).json({ message: "Image not found or already deleted" });
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteImages = async (req:Request , res:Response)=>{
  try {
    const { packageId } = req.params;
    if(!packageId || typeof packageId !== 'string' || packageId.trim().length === 0) return res.status(400).json(apiResponse(400, { message: "Invalid package ID" }));
    const dbPackage = await prisma.package.findUnique({
      where: {
        id: packageId.toString() ,
      },
      include: {
        media: true,
      },
    });

    if(!dbPackage) return res.status(404).json(apiResponse(404, { message: "Package not found" }));
    const deleteCloudinaryImages = await Promise.allSettled(dbPackage.media.map((media) => cloudinary.uploader.destroy(media.public_id, {invalidate: true})));
    const deleteDBImages = await prisma.media.deleteMany({
      where: {
        packageId: packageId.toString(),
      },
    });
    return res.status(200).json(apiResponse(200, { message: "Images deleted successfully" }));

  } catch (error) {
    console.error("Error deleting images:", error);
    return res.status(500).json(apiResponse(500, { message: "Internal server error" }));
  }
}