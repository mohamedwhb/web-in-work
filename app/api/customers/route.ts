import prisma from "@/db/prisma";
import { verifyCsrfToken } from "@/lib/csrf";
import { getRateLimit } from "@/lib/rate-limit";
import { createCustomerSchema } from "@/schemas/customer-schema";
import type { CustomerStatus, CustomerType, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

// Function to generate a unique customer number
async function generateCustomerNumber(): Promise<string> {
	const year = new Date().getFullYear();
	const lastCustomer = await prisma.customer.findFirst({
		orderBy: { customerNumber: "desc" },
		where: {
			customerNumber: {
				startsWith: `K${year}`,
			},
		},
	});

	let sequence = 1;
	if (lastCustomer?.customerNumber) {
		const lastSequence = Number.parseInt(lastCustomer.customerNumber.slice(-4));
		sequence = lastSequence + 1;
	}

	return `K${year}${sequence.toString().padStart(4, "0")}`;
}

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url, process.env.APP_URL);
		const page = searchParams.get("page") || "1";
		const limit = searchParams.get("limit") || "10";
		const search = searchParams.get("search") || "";
		const type = searchParams.get("type") || "all";
		const status = searchParams.get("status") || "all";
		const sortField = searchParams.get("sortField") || "name";
		const sortDirection = searchParams.get("sortDirection") || "asc";

		const whereClause: Prisma.CustomerWhereInput = {};
		if (search) {
			whereClause.name = {
				contains: search,
				mode: "insensitive",
			};
		}

		if (type !== "all") {
			whereClause.type = type as CustomerType;
		}

		if (status !== "all") {
			whereClause.status = status as CustomerStatus;
		}

		const customers = await prisma.customer.findMany({
			skip: (Number(page) - 1) * Number(limit),
			take: Number(limit),
			where: whereClause,
			orderBy: { [sortField]: sortDirection },
		});

		if (!customers) {
			return NextResponse.json(
				{ error: "No customers found" },
				{ status: 404 },
			);
		}

		const totalCount = await prisma.customer.count({
			where: whereClause,
		});

		return NextResponse.json({ customers, totalCount }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
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
		const parsedBody = createCustomerSchema.safeParse(body);

		if (!parsedBody.success) {
			return NextResponse.json(
				{ error: parsedBody.error.message },
				{ status: 400 },
			);
		}

		// Generate a unique customer number
		const customerNumber = await generateCustomerNumber();

		const customer = await prisma.customer.create({
			data: {
				...parsedBody.data,
				customerNumber,
			},
		});

		return NextResponse.json({ customer }, { status: 201 });
	} catch (error) {
		console.error("Error creating customer:", error);
		return NextResponse.json(
			{ error: "Failed to create customer" },
			{ status: 500 },
		);
	}
}
