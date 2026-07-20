import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";
import { apiResponse } from "../helpers/apiResponse.ts";
import z, { ZodError } from "zod";
import { offsetValueSchema, validatePackageId, validatePackageRequest } from "../types/package.ts";

export const getPackages = async (req: Request, res: Response) => {
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
        },
      ],
      skip: offset,
      take: 5,
    });
    console.log("packages", packages);
    res.status(200).json(
      apiResponse(200, {
        packages,
        nextPage: packages.length === 5 ? page + 1 : null,
      }),
    );
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

export const deletePackage = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || typeof id !== "string" || id.trim().length === 0)
    return res
      .status(400)
      .json(apiResponse(400, { message: "Invalid package ID" }));

  if (!req.session?.user.id || !req.session?.user)
    return res.status(401).json(apiResponse(401, { message: "Unauthorized" }));

  const packageExits = await prisma.package.findUnique({
    where: { id: id as string },
  });

  if (!packageExits)
    return res
      .status(404)
      .json(apiResponse(404, { message: "Package not found" }));

  await prisma.user.update({
    where: {
      id: req.session?.user.id,
    },
    data: {
      packages: {
        delete: {
          id: packageExits.id,
        },
      },
    },
  });
};




export const bookPackage = async (req: Request, res: Response) => {
  try {
    const userId = req.session?.user.id as string;
  
    const { packageId } = req.params;
    const validPackageId = validatePackageId.safeParse({ packageId });
    const validPackage = validatePackageRequest.safeParse(req.body);
    if (!validPackageId.success || !validPackage.success) {
      return res
        .status(400)
        .json(
          apiResponse(400, {
            message: "Invalid package ID or booking details",
          }),
        );
    }

    const packageExists = await prisma.package.findUnique({
      where: { id: validPackageId.data.packageId },
    });
    if (!packageExists)
      return res
        .status(404)
        .json(apiResponse(404, { message: "Package not found" }));

        const booking = await prisma.booking.findMany()
        console.log(booking)



    const updatedUser = await prisma.booking.create({
      data: {
        price: Number(req.body.people ) * packageExists.price,
        totalPeople: req.body.people,
        travelDate: new Date(req.body.date),
        userId: userId,
        packageId: validPackageId.data?.packageId,
      },
    });
    return res
      .status(200)
      .json(apiResponse(200, { message: "Package booked successfully" }));
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error booking package:", error);
      res
        .status(500)
        .json(apiResponse(500, { message: "Internal server error" }));
    }
  }
};

export const getPackageDetail = async (req: Request, res: Response) => {
  const { packageId } = req.params;
  const validPackageId = validatePackageId.safeParse({ packageId });
  if (!validPackageId.success) {
    return res
      .status(400)
      .json(apiResponse(400, { message: "Invalid package ID" }));
  }
  const dbPackage = await prisma.package.findUnique({
    where: { id: validPackageId.data.packageId },
    include: { media: true },
  });
  if (!dbPackage)
    return res
      .status(404)
      .json(apiResponse(404, { message: "Package not found" }));
  return res.status(200).json(apiResponse(200, dbPackage));
};
