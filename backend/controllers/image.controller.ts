import { v2 as cloudinary } from "cloudinary";
import type { Request, Response } from "express";
import "dotenv/config";

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
