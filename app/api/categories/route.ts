import prisma from "@/db/prisma";
import { verifyCsrfToken } from "@/lib/csrf";
import { getErrorMessages } from "@/lib/getErrorMessages";
import { getRateLimit } from "@/lib/rate-limit";
import { categorySchema } from "@/schemas/category-schema";
import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url, process.env.APP_URL);
		const parentId = searchParams.get("parentId");
		const order = searchParams.get("order");

		const where: Prisma.CategoryWhereInput = {};
		if (parentId) {
			where.parentId = parentId;
		}

		const orderBy: Prisma.CategoryOrderByWithRelationInput = {};
		if (order) {
			orderBy.order = order === "asc" ? "asc" : "desc";
		}

		const categories = await prisma.category.findMany({
			where,
			orderBy,
		});

		if (!categories) {
			return NextResponse.json(
				{ error: "No categories found" },
				{ status: 404 },
			);
		}
		return NextResponse.json({ categories });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch categories" },
			{ status: 500 },
		);
	}
}

export async function POST(req: Request) {
	try {
		const { success } = await getRateLimit();
		if (!success) {
			return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
		}
		const isValid = await verifyCsrfToken();
		if (!isValid) {
			return NextResponse.json(
				{ error: "Ungültige Anmeldeinformationen" },
				{ status: 401 },
			);
		}
		const body = await req.json();
		const parsedBody = categorySchema.safeParse(body);
		if (!parsedBody.success) {
			return NextResponse.json(
				{ error: getErrorMessages(parsedBody.error) },
				{ status: 400 },
			);
		}
		const category = await prisma.category.create({
			data: parsedBody.data,
		});

		return NextResponse.json({ category });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
