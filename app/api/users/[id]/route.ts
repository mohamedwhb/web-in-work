import prisma from "@/db/prisma";
import { verifyCsrfToken } from "@/lib/csrf";
import { getRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function PATCH(
	request: Request,
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
		if (!id) {
			return NextResponse.json({ error: "Missing id" }, { status: 400 });
		}

		const update = await request.json();

		const updateWithoutRole = Object.keys(update).reduce(
			(acc: Record<string, any>, key: string) => {
				if (key !== "role") {
					acc[key] = update[key];
				}
				return acc;
			},
			{},
		);
		const updatedUser = await prisma.user.update({
			where: { id },
			data: {
				...updateWithoutRole,
				...(update.role && { role: { connect: { id: update.role } } }),
			},
			select: {
				id: true,
				name: true,
				email: true,
				avatar: true,
				active: true,
				role: true,
				lastLogin: true,
			},
		});

		console.log("updatedUser =>", updatedUser);

		if (!updatedUser) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json(updatedUser, { status: 200 });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to update user" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: Request,
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
		if (!id) {
			return NextResponse.json({ error: "Missing id" }, { status: 400 });
		}
		const deletedUser = await prisma.user.delete({
			where: { id },
		});

		if (!deletedUser) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}
		return NextResponse.json({ success: true }, { status: 200 });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to delete user" },
			{ status: 500 },
		);
	}
}
