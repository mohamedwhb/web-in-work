import prisma from "@/db/prisma";
import { verifyCsrfToken } from "@/lib/csrf";
import { getRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function GET(
	req: Request,
	{ params }: { params: { id: string } },
) {
	try {
		const { success } = await getRateLimit();
		if (!success) {
			return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
		}

		const offer = await prisma.offer.findUnique({
			where: {
				id: params.id,
			},
			include: {
				customer: true,
				items: true,
				bankDetails: true,
			},
		});

		if (!offer) {
			return NextResponse.json({ error: "Offer not found" }, { status: 404 });
		}

		return NextResponse.json({ offer });
	} catch (error) {
		console.error("Error fetching offer:", error);
		return NextResponse.json(
			{ error: "Failed to fetch offer" },
			{ status: 500 },
		);
	}
}

export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { success } = await getRateLimit();
		if (!success) {
			return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
		}

		const isValid = await verifyCsrfToken();
		if (!isValid) {
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 },
			);
		}

		const { id } = await params;

		const body = await req.json();
		const { status, statusDate, statusNote } = body;

		const offer = await prisma.offer.update({
			where: {
				id,
			},
			data: {
				status,
				statusDate: new Date(statusDate),
				statusNote,
			},
			include: {
				customer: true,
				items: true,
				bankDetails: true,
			},
		});

		return NextResponse.json({ offer });
	} catch (error) {
		console.error("Error updating offer:", error);
		return NextResponse.json(
			{ error: "Failed to update offer" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { success } = await getRateLimit();
		if (!success) {
			return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
		}

		const isValid = await verifyCsrfToken();
		if (!isValid) {
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 },
			);
		}

		const { id } = await params;

		await prisma.offer.delete({
			where: {
				id,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting offer:", error);
		return NextResponse.json(
			{ error: "Failed to delete offer" },
			{ status: 500 },
		);
	}
}
