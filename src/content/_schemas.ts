import { z } from "astro/zod";

export const noteSchema = z
  .object({
    author: z.string().optional(),
    title: z.string(),
    postSlug: z.string().optional(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).default(["others"]),
    ogImage: z.string().optional(),
    description: z.string(),
  })
  .strict();

export type NoteFrontmatter = z.infer<typeof noteSchema>;
