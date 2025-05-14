import prisma from "@/db/prisma";
import { verifyCsrfToken } from "@/lib/csrf";
import { getRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	try {
		const { success } = await getRateLimit(20);
		if (!success) {
			return NextResponse.json(
				{ error: "Too Many Requests" },
				{
					status: 429,
				},
			);
		}
		const { searchParams } = new URL(request.url, process.env.APP_URL);
		const logo = searchParams.get("logo");

		const query: any = {};
		if (logo) {
			query.select = {
				logo: true,
				id: true,
			};
		} else {
			query.include = {
				bankDetails: true,
			};
		}

		const company = await prisma.company.findFirst({
			...query,
		});
		return NextResponse.json({ company });
	} catch (error) {
		console.error("Error fetching company:", error);
		return NextResponse.json(
			{ error: "Failed to fetch company" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const { success } = await getRateLimit(20);
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

		const { company, companyId } = await request.json();
		const { bankDetails, ...companyData } = company;

		const newCompany = await prisma.company.upsert({
			where: { id: companyId },
			update: {
				...companyData,
				bankDetails: {
					create: bankDetails,
				},
			},
			create: {
				...companyData,
				bankDetails: {
					create: bankDetails,
				},
			},
			include: {
				bankDetails: true,
			},
		});
		return NextResponse.json({ company: newCompany });
	} catch (error) {
		console.error("Error saving company:", error);
		return NextResponse.json(
			{ error: "Failed to save company" },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: Request) {
	try {
		const { success } = await getRateLimit(20);
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

		const { searchParams } = new URL(request.url, process.env.APP_URL);
		const logo = searchParams.get("logo");

		const { companyId } = await request.json();

		if (logo) {
			await prisma.company.update({
				where: { id: companyId },
				data: { logo: null },
			});
		} else {
			await prisma.company.delete({
				where: { id: companyId },
			});
		}

		return NextResponse.json({ message: "Company deleted successfully" });
	} catch (error) {
		console.error("Error deleting company:", error);
		return NextResponse.json(
			{ error: "Failed to delete company" },
			{ status: 500 },
		);
	}
}
