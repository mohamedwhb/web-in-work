import { z } from "zod";

export const companyInfoSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(2),
	email: z.string().email(),
	phone: z.string().min(5),
	street: z.string().min(2),
	number: z.string().optional(),
	zip: z.string().min(4),
	city: z.string().min(2),
	country: z.string().optional(),

	logo: z.string().optional(),
	legalForm: z.string().optional(),
	registrationNumber: z.string().optional(),
	vatId: z.string().optional(),
	taxId: z.string().optional(),
	website: z.string().url().optional(),
	fax: z.string().optional(),

	foundingYear: z.string().optional(),
	employees: z.string().optional(),
	industry: z.string().optional(),
	notes: z.string().optional(),

	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),

	bankDetailsId: z.string().optional(),

	bankDetails: z.object({
		institute: z.string().min(2),
		recipient: z.string().min(2),
		iban: z.string().min(2),
		bic: z.string().min(2),
		reference: z.string().optional(),
		id: z.string().optional(),
	}),
});

export type CompanyInfoSchemaType = z.infer<typeof companyInfoSchema>;
