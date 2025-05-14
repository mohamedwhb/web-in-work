import { z } from "zod";

export const createProductSchema = z.object({
	name: z.string().min(1),
	description: z.string().min(1).optional(),
	price: z.number().min(0),
	stock: z.number().min(0),
	barcode: z.string().min(1).optional(),
	unit: z.string().min(1).optional(),
	minStock: z.number().min(0).optional(),
	taxRate: z.number().min(0).optional(),
	group: z.string().min(1).optional(),
	artNr: z.string().min(1).optional(),
	category: z.string().min(1),
});
export const updateProductSchema = z.object({
	name: z.string().min(1).optional(),
	description: z.string().min(1).optional(),
	price: z.number().min(0).optional(),
	stock: z.number().min(0).optional(),
	categoryId: z.string().min(1).optional(),
	barcode: z.string().min(1).optional(),
	unit: z.string().min(1).optional(),
	minStock: z.number().min(0).optional(),
	taxRate: z.number().min(0).optional(),
	group: z.string().nullable().optional(),
	artNr: z.string().min(1).optional(),
	category: z.string().min(1).optional(),
});
