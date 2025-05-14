export const getErrorMessages = (error: Zod.ZodError) => {
	return error.errors.reduce(
		(acc, curr) => {
			acc[curr.path[0]] = curr.message;
			return acc;
		},
		{} as Record<string, string>,
	);
};
