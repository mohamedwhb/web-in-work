import { z } from "zod";

export const customerSchema = z.object({
	name: z.string().min(1).optional(),
	email: z.string().email().optional(),
	phone: z.string().min(1).optional(),
	vatId: z.string().min(1).optional(),
	taxId: z.string().min(1).optional(),
	country: z.string().min(1).optional(),
	zip: z.string().min(1).optional(),
	city: z.string().min(1).optional(),
	street: z.string().min(1).optional(),
});
export const createCustomerSchema = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	phone: z.string().min(1),
	vatId: z.string().min(1),
	taxId: z.string().min(1),
	country: z.string().min(1),
	zip: z.string().min(1),
	city: z.string().min(1),
	street: z.string().min(1),
});
