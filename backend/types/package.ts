import z from "zod";

export const packageSchema = z.object({
  name: z.string().min(2).max(100),
  location: z.string().min(2).max(100),
  description: z.string().max(255).optional(),
  price: z.number().positive().or(z.string()),  
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