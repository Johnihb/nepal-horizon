import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";
import z, { number, ZodError } from "zod";
import { apiResponse } from "../helpers/apiResponse.ts";
import { packageSchema } from "../types/package.ts";

const offsetValueSchema = z.object({
  offset: z.coerce.number().int().min(0).optional(), // coerce handles string → number,
})


export const postPackage = async (req: Request, res: Response) => {
  try {
    const request = req.body;
    console.log("request",typeof request.price);
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
    console.log("error",error);
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

export const getPackages = async (req:Request , res:Response ) => {
  try {
    const validatedData = offsetValueSchema.parse(req.query); 
    const page = validatedData.offset ?? 0;
    const offset = page * 5;
    const packages = await prisma.package.findMany({
      include: {
        media: true,
      },
      orderBy: [
        {
          price: "desc",
        },
        {
          id: "asc",
        }
      ],
      skip: offset,
      take: 5,
    });
    console.log("packages",packages);
     res.status(200).json(apiResponse(200, {packages, nextPage: packages.length === 5 ? page + 1 : null}));
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
  
  

}