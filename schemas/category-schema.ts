import { z } from "zod";

export const categorySchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	color: z.string().min(1),
	order: z.number().optional(),
	parentId: z.string().optional(),
});
