import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";
import { ZodError } from "zod";
import { apiResponse } from "../helpers/apiResponse.ts";
import { packageSchema } from "../types/package.ts";

export const postPackage = async (req: Request, res: Response) => {
  try {
    const request = req.body;
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
    return res.status(201).json(apiResponse(201, validatedData));
  } catch (error) {
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
    res.status(500).json({ message: "Internal server error" });
  }
};
