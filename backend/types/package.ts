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
