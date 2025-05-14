import prisma from "@/db/prisma";
import { verifyCsrfToken } from "@/lib/csrf";
import { getErrorMessages } from "@/lib/getErrorMessages";
import { getRateLimit } from "@/lib/rate-limit";
import { updateProductSchema } from "@/schemas/product-schema";
import { NextResponse } from "next/server";

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
				{ error: "Invalid CSRF token" },
				{ status: 401 },
			);
		}
		const { id } = await params;
		if (!id) {
			return NextResponse.json(
				{ error: "Product ID is required" },
				{ status: 400 },
			);
		}
		const body = await req.json();
		const parsedBody = updateProductSchema.safeParse(body);
		if (!parsedBody.success) {
			return NextResponse.json(
				{ error: { error: getErrorMessages(parsedBody.error) } },
				{ status: 400 },
			);
		}
		const product = await prisma.product.update({
			where: { id },
			data: {
				name: parsedBody.data.name,
				description: parsedBody.data.description,
				price: parsedBody.data.price,
				stock: parsedBody.data.stock,
				barcode: parsedBody.data.barcode,
				unit: parsedBody.data.unit,
				minStock: parsedBody.data.minStock,
				taxRate: parsedBody.data.taxRate || 0,
				artNr: parsedBody.data.artNr,
				category: {
					connect: {
						id: parsedBody.data.category,
					},
				},
				...(parsedBody.data.group && {
					group: {
						connect: {
							id: parsedBody.data.group,
						},
					},
				}),
			},
			include: {
				category: true,
				group: true,
			},
		});

		return NextResponse.json({ product }, { status: 200 });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
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
				{ error: "Invalid CSRF token" },
				{ status: 401 },
			);
		}
		const { id } = await params;
		if (!id) {
			return NextResponse.json(
				{ error: "Product ID is required" },
				{ status: 400 },
			);
		}
		await prisma.product.delete({
			where: { id },
		});
		return NextResponse.json(
			{ message: "Product deleted successfully" },
			{ status: 200 },
		);
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
