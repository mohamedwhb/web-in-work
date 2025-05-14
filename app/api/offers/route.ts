import prisma from "@/db/prisma";
import { verifyCsrfToken } from "@/lib/csrf";
import { getRateLimit } from "@/lib/rate-limit";
import type { OfferStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url, process.env.APP_URL);
	const order = searchParams.get("order") || "desc";
	const sort = searchParams.get("sort") || "createdAt";
	const page = searchParams.get("page") || 1;
	const limit = searchParams.get("limit") || 10;
	const status = searchParams.get("status") || "all";
	const search = searchParams.get("search") || "";
	const from = searchParams.get("from") || "";
	const to = searchParams.get("to") || "";

	const where: Prisma.OfferWhereInput = {};
	if (status !== "all") {
		where.status = status.toUpperCase() as OfferStatus;
	}
	if (search) {
		where.customer = {
			name: {
				contains: search,
				mode: "insensitive",
			},
		};
	}
	if (from && to) {
		where.date = {
			gte: new Date(from),
			lte: new Date(to),
		};
	}

	try {
		const offers = await prisma.offer.findMany({
			where,
			orderBy: {
				[sort]: order,
			},
			skip: (Number(page) - 1) * Number(limit),
			take: Number(limit),
			include: {
				customer: true,
				items: true,
				bankDetails: true,
			},
		});

		return NextResponse.json({ offers });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch offers" },
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
		const {
			items,
			subtotal,
			tax,
			taxRate,
			total,
			processor,
			bankDetails,
			status,
			date,
			statusNote,
			customer,
		} = body;

		// Validate required fields
		if (
			!items ||
			!subtotal ||
			!tax ||
			!taxRate ||
			!total ||
			!processor ||
			!bankDetails ||
			!customer?.id
		) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		// Create bank details if they don't exist
		const bankDetailsRecord = await prisma.bankDetails.create({
			data: {
				recipient: bankDetails.recipient,
				institute: bankDetails.institute,
				iban: bankDetails.iban,
				bic: bankDetails.bic,
				reference: bankDetails.reference,
			},
		});

		// Create the offer with its items
		const offer = await prisma.offer.create({
			data: {
				date: new Date(date),
				customer: {
					connect: {
						id: customer.id,
					},
				},
				items: {
					create: items.map(
						(item: {
							product: string;
							artNr: string;
							quantity: number;
							price: number;
							total: number;
						}) => ({
							product: item.product,
							artNr: item.artNr,
							quantity: item.quantity,
							price: item.price,
							total: item.total,
						}),
					),
				},
				subtotal,
				tax,
				taxRate,
				total,
				processor,
				bankDetails: {
					connect: {
						id: bankDetailsRecord.id,
					},
				},
				status: (status || "OPEN") as OfferStatus,
				statusDate: new Date(),
				statusNote: statusNote || "",
			},
			include: {
				customer: true,
				items: true,
				bankDetails: true,
			},
		});

		return NextResponse.json({ offer }, { status: 201 });
	} catch (error) {
		console.error("Error creating offer:", error);
		return NextResponse.json(
			{ error: "Failed to create offer" },
			{ status: 500 },
		);
	}
}
