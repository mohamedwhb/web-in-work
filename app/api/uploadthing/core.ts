import prisma from "@/db/prisma";
import { type FileRouter, createUploadthing } from "uploadthing/next";
import { z } from "zod";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
	companyImageUploader: f({
		image: {
			maxFileSize: "2MB",
			maxFileCount: 1,
		},
	})
		.input(
			z.object({
				configId: z.string().optional(),
				companyId: z.string(),
			}),
		)
		.middleware(async ({ input }) => {
			return { input };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			try {
				await prisma.company.update({
					where: {
						id: metadata.input.companyId,
					},
					data: {
						logo: file.ufsUrl,
					},
				});
				return {
					configId: metadata.input.configId,
					companyId: metadata.input.companyId,
				};
			} catch (error) {
				console.log(error);
			}
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
