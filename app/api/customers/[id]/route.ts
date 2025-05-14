import prisma from "@/db/prisma";
import { verifyCsrfToken } from "@/lib/csrf";
import { getRateLimit } from "@/lib/rate-limit";
import {
	createCustomerSchema,
	customerSchema,
} from "@/schemas/customer-schema";
import { NextResponse } from "next/server";

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
		if (!id) {
			return NextResponse.json(
				{ error: "No customer ID provided" },
				{ status: 400 },
			);
		}

		const updatedData = await req.json();

		if (!updatedData) {
			return NextResponse.json(
				{ error: "No updated data provided" },
				{ status: 400 },
			);
		}

		const isValidUpdatedData = customerSchema.safeParse(updatedData);
		if (!isValidUpdatedData.success) {
			return NextResponse.json(
				{ error: isValidUpdatedData.error.message },
				{ status: 400 },
			);
		}

		const customer = await prisma.customer.update({
			where: { id },
			data: isValidUpdatedData.data,
		});

		return NextResponse.json({ customer }, { status: 200 });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
export async function POST(
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
		if (!id) {
			return NextResponse.json(
				{ error: "No customer ID provided" },
				{ status: 400 },
			);
		}

		const userData = await req.json();

		if (!userData) {
			return NextResponse.json(
				{ error: "No updated data provided" },
				{ status: 400 },
			);
		}

		const isValidUserData = createCustomerSchema.safeParse(userData);
		if (!isValidUserData.success) {
			return NextResponse.json(
				{ error: isValidUserData.error.message },
				{ status: 400 },
			);
		}

		const customer = await prisma.customer.create({
			data: isValidUserData.data,
		});

		return NextResponse.json({ customer }, { status: 200 });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
