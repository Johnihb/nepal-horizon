import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";
import z, { number, ZodError } from "zod";
import { apiResponse } from "../helpers/apiResponse.ts";
import { packageSchema } from "../types/package.ts";
import { v2 as cloudinary } from "cloudinary";



export const postPackage = async (req: Request, res: Response) => {
  try {
    const request = req.body;
    console.log("request", typeof request.price);
    const validatedData = packageSchema.parse(request);

    const newPackage = await prisma.package.create({
      data: {
        name: validatedData.name,
        location: validatedData.location,
        description:
          validatedData.description || "Sorry, no description provided.",
        price: Number(validatedData.price),
        media: {
          create:
            validatedData?.images?.map((img) => ({
              //! automatically create media table
              url: img.url,
              public_id: img.public_id,
            })) ?? [],
        },
      },
      include: {
        media: true,
      },
    });
    return res.status(201).json(apiResponse(201, newPackage));
  } catch (error) {
    console.log("error", error);
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error?.issues?.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    console.error("Error creating package:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



export const updatePackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const request = req.body;
    const validatedData = packageSchema.parse(request);

    // Fetch existing media to delete from Cloudinary
    const existingPackage = await prisma.package.findUnique({
      where: { id: id as string },
      include: { media: true },
    });

    if (!existingPackage) {
      return res
        .status(404)
        .json(apiResponse(404, { message: "Package not found" }));
    }

    // 1. Diff what needs to go — but don't delete yet
const imagesToDelete = existingPackage.media.filter(
  (m) => !validatedData.images?.some((img) => img.public_id === m.public_id)
);

// 2. Update package + media (upsert now works if public_id is @unique)
const updatedPackage = await prisma.package.update({
  where: { id: id as string },
  data: {
    name: validatedData.name,
    location: validatedData.location,
    description: validatedData.description || "Sorry, no description provided.",
    price: Number(validatedData.price),
    media: {
      upsert: validatedData.images?.map((img) => ({
        where: { public_id: img.public_id },
        update: { url: img.url },
        create: { url: img.url, public_id: img.public_id },
      })) ?? [],
      deleteMany: imagesToDelete.map((m) => ({ id: m.id })), // scoped delete
    },
    // ** Alternative
    //     media: {
//   deleteMany: imagesToDelete.map((m) => ({ id: m.id })),
//   create: validatedData.images?.map((img) => ({
//     url: img.url,
//     public_id: img.public_id,
//   })) ?? [],
// },
  },
  include: { media: true },
});

// 3. Cloudinary cleanup only after DB succeeds
await Promise.allSettled(
  imagesToDelete.map((m) =>
    cloudinary.uploader.destroy(m.public_id, { invalidate: true })
  )
);
    return res.status(200).json(apiResponse(200, updatedPackage));
  } catch (error) {
    console.error("Error updating package:", error);
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error?.issues?.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};


export const deletePackage = async (req:Request , res: Response)=>{
  try {
    const { id } = req.params;
    if(!id || typeof id !== 'string' || id.trim().length === 0) return res.status(400).json(apiResponse(400, { message: "Invalid package ID" }));
    const dbPackage = await prisma.package.findUnique({ where: { id: id as string }, include: { media: true } });
    if(!dbPackage) return res.status(404).json(apiResponse(404, { message: "Package not found" }));
    const deleteDBImages = await prisma.media.deleteMany({ where: { packageId: id as string } });
    const deleteDBPackage = await prisma.package.delete({ where: { id: id as string } });
    // Cloudinary cleanup after DB deletion succeeds
    const cloudinaryResults = await Promise.allSettled(dbPackage.media.map((media) => cloudinary.uploader.destroy(media.public_id, {invalidate: true})));
    const failedDeletions = cloudinaryResults.filter(r => r.status === 'rejected');
    if(failedDeletions.length > 0) {
      console.warn(`Failed to delete ${failedDeletions.length} Cloudinary images for package ${id}`);
    }
    return res.status(200).json(apiResponse(200, { message: "Package deleted successfully" }));    
  } catch (error) {
    res.status(500).json(apiResponse(500, { message: "Internal server error" }));
  }
}