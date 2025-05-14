import prisma from "@/db/prisma";
import { verifyCsrfToken } from "@/lib/csrf";
import { getErrorMessages } from "@/lib/getErrorMessages";
import { getRateLimit } from "@/lib/rate-limit";
import { createProductSchema } from "@/schemas/product-schema";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url, process.env.APP_URL);
		const page = Number(searchParams.get("page") || "1");
		const limit = Number(searchParams.get("limit") || "10");
		const search = searchParams.get("search") || "";
		const categoryFilter = searchParams.get("category") || "";
		const stockFilter = searchParams.get("stockStatus") || "";
		const sortBy = searchParams.get("sortBy") || "createdAt";
		const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

		const offset = (page - 1) * limit;

		if (stockFilter === "low-stock") {
			const products = await prisma.$queryRaw`
				SELECT * FROM "Product"
				WHERE "stock" < "minStock"
				AND (${search === ""} OR LOWER("name") LIKE LOWER(${`%${search}%`}))
				AND (${categoryFilter === ""} OR "categoryId" = ${categoryFilter})
				ORDER BY "${Prisma.raw(sortBy)}" ${Prisma.raw(sortOrder.toUpperCase())}
				OFFSET ${offset} LIMIT ${limit}
			`;

			const countResult = await prisma.$queryRaw<{ count: bigint }[]>`
				SELECT COUNT(*) as count FROM "Product"
				WHERE "stock" < "minStock"
				AND (${search === ""} OR LOWER("name") LIKE LOWER(${`%${search}%`}))
				AND (${categoryFilter === ""} OR "categoryId" = ${categoryFilter})
			`;

			return NextResponse.json(
				{ products, totalCount: Number(countResult[0]?.count || 0) },
				{ status: 200 },
			);
		}

		const whereClause: Prisma.ProductWhereInput = {};
		if (search) {
			whereClause.name = {
				contains: search,
				mode: "insensitive",
			};
		}
		if (categoryFilter) {
			whereClause.categoryId = categoryFilter;
		}
		if (stockFilter === "in-stock") {
			whereClause.stock = { gt: 0 };
		} else if (stockFilter === "out-of-stock") {
			whereClause.stock = { equals: 0 };
		}

		const products = await prisma.product.findMany({
			skip: offset,
			take: limit,
			where: whereClause,
			orderBy: { [sortBy]: sortOrder },
			include: {
				category: true,
				group: true,
			},
		});

		const totalCount = await prisma.product.count({
			where: whereClause,
		});

		return NextResponse.json({ products, totalCount }, { status: 200 });
	} catch (error) {
		console.error("error", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function POST(req: Request) {
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

		const body = await req.json();

		const parsedBody = createProductSchema.safeParse(body);

		if (!parsedBody.success) {
			return NextResponse.json(
				{ error: { error: getErrorMessages(parsedBody.error) } },
				{ status: 400 },
			);
		}
		const product = await prisma.product.create({
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
		});
		return NextResponse.json({ product }, { status: 201 });
	} catch (error) {
		console.error("error", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(req: Request) {
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
		const { productIds } = await req.json();
		if (!productIds) {
			return NextResponse.json(
				{ error: "Product IDs are required" },
				{ status: 400 },
			);
		}
		await prisma.product.deleteMany({
			where: {
				id: {
					in: productIds,
				},
			},
		});
		return NextResponse.json(
			{ message: "Products deleted successfully" },
			{ status: 200 },
		);
	} catch (error) {
		console.error("error", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
