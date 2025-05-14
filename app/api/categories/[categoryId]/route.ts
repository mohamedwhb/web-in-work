import prisma from "@/db/prisma";
import { verifyCsrfToken } from "@/lib/csrf";
import { getErrorMessages } from "@/lib/getErrorMessages";
import { getRateLimit } from "@/lib/rate-limit";
import { categorySchema } from "@/schemas/category-schema";
import { NextResponse } from "next/server";

async function getAllDescendants(categoryId: string): Promise<any[]> {
	const descendants: any[] = [];

	const findChildren = async (parentId: string) => {
		const children = await prisma.category.findMany({
			where: { parentId },
			orderBy: { order: "asc" },
		});

		descendants.push(...children);

		for (const child of children) {
			await findChildren(child.id);
		}
	};

	await findChildren(categoryId);
	return descendants;
}

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ categoryId: string }> },
) {
	try {
		const { categoryId } = await params;
		if (!categoryId) {
			return NextResponse.json(
				{ error: "Category ID is required" },
				{ status: 400 },
			);
		}
		const { searchParams } = new URL(req.url, process.env.APP_URL);
		const includeDescendants =
			searchParams.get("includeDescendants") === "true";

		const category = await prisma.category.findUnique({
			where: { id: categoryId },
		});

		if (!category) {
			return NextResponse.json(
				{ error: "Category not found" },
				{ status: 404 },
			);
		}

		if (includeDescendants) {
			const descendants = await getAllDescendants(categoryId);
			return NextResponse.json({
				category: {
					descendants,
				},
			});
		}

		return NextResponse.json({ category });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ categoryId: string }> },
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
		const { categoryId } = await params;
		const body = await req.json();

		const parsedBody = categorySchema.safeParse(body);

		if (!parsedBody.success) {
			return NextResponse.json(
				{
					error: getErrorMessages(parsedBody.error),
				},
				{ status: 400 },
			);
		}

		const category = await prisma.category.update({
			where: { id: categoryId },
			data: parsedBody.data,
		});

		if (!category) {
			return NextResponse.json(
				{ error: "Category not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({
			category,
		});
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ categoryId: string }> },
) {
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
		const { categoryId } = await params;
		if (!categoryId) {
			return NextResponse.json(
				{ error: "Category ID is required" },
				{ status: 400 },
			);
		}
		const category = await prisma.category.delete({
			where: { id: categoryId },
		});
		if (!category) {
			return NextResponse.json(
				{ error: "Category not found" },
				{ status: 404 },
			);
		}
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
