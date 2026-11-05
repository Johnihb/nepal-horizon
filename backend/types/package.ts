import z from "zod";
import { BookingStatus, Difficulty } from "../generated/prisma/enums.ts";

export const packageSchema = z.object({
  name: z.string().min(2).max(100),
  location: z.string().min(2).max(100),
  description: z.string().max(255).optional(),
  price: z.coerce.number().positive(),
  durationDays: z.coerce.number().int().positive().optional(),
  maxAltitude: z.coerce.number().int().positive().optional(),
  difficulty: z.enum(Difficulty).optional(),
  bestSeason: z.string().max(60).optional(),
  groupSize: z.coerce.number().int().positive().optional(),
  images: z
    .array(
      z.object({
        public_id: z.string(),
        url: z.string().url(),
      }),
    )
    ,
});

export const offsetValueSchema = z.object({
  offset: z.coerce.number().int().min(0).optional(), // coerce handles string → number,
});

export const validatePackageId = z.object({
  packageId: z.string().uuid(),
});

export const validatePackageRequest = z.object({
  people: z.number().min(1),
  date: z.iso.date(),
});

export const validateBookingStatus = z.object({
  id: z.string().uuid(),
  status: z.enum(BookingStatus),
});

/** `?status=PENDING|CONFIRMED|CANCELLED` — omitted means every booking. */
export const filterBookingsSchema = z.object({
  status: z.enum(BookingStatus).optional(),
});