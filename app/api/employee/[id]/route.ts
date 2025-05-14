import { getRateLimit } from "@/lib/rate-limit";

import { NextResponse } from "next/server";

import prisma from "@/db/prisma";
import { verifyCsrfToken } from "@/lib/csrf";

export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { success } = await getRateLimit();
		if (!success) {
			return NextResponse.json(
				{ error: "Too Many Requests" },
				{
					status: 429,
				},
			);
		}
		const isValid = await verifyCsrfToken();
		if (!isValid) {
			return NextResponse.json(
				{ error: "Ungültige Anmeldeinformationen" },
				{ status: 401 },
			);
		}

		const { id } = await params;
		const { permissions, data } = await req.json();
		console.log("permissions", permissions);
		console.log("data", data);

		const employee = await prisma.employee.update({
			where: { id },
			data: {
				...(permissions && {
					permissions: {
						set: [], // Clear existing permissions
						connect: permissions.map((perm: string) => ({ key: perm })),
					},
				}),
				...(data && data),
			},
			include: {
				department: true,
				position: true,
				permissions: true,
				skills: {
					select: {
						id: true,
						name: true,
						level: true,
					},
				},
				documents: true,
				user: {
					select: {
						name: true,
						email: true,
						username: true,
						role: true,
						avatar: true,
						id: true,
						active: true,
					},
				},
			},
		});

		return NextResponse.json(employee, { status: 200 });
	} catch (error) {
		console.error("error", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
