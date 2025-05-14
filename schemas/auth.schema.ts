import z from "zod";

export const createUserSchema = z.object({
	name: z.string(),
	email: z.string().email(),
	role: z.string(),
	active: z.boolean().default(true),
});

export const loginUserSchema = z.object({
	username: z.string(),
	password: z.string(),
});

export type CreateUserType = z.infer<typeof createUserSchema>;
export type LoginUserType = z.infer<typeof loginUserSchema>;
