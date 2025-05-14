import prisma from "@/db/prisma";
import { verifyCsrfToken } from "@/lib/csrf";
import { getRateLimit } from "@/lib/rate-limit";
import type { EmployeeStatus, Prisma } from "@prisma/client";

import { NextResponse } from "next/server";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url, process.env.APP_URL);
		const page = Number(searchParams.get("page") || "1");
		const limit = Number(searchParams.get("limit") || "10");
		const search = searchParams.get("search") || "";
		const departmentFilter = searchParams.get("department") || "";
		const statusFilter = searchParams.get("status") || "";
		const sortBy = searchParams.get("sortBy") || "createdAt";
		const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

		const offset = (page - 1) * limit;

		const whereClause: Prisma.EmployeeWhereInput = {};
		if (search) {
			if (search) {
				whereClause.OR = [
					{
						user: {
							OR: [
								{ name: { contains: search, mode: "insensitive" } },
								{ email: { contains: search, mode: "insensitive" } },
								{ username: { contains: search, mode: "insensitive" } },
							],
						},
					},
					{
						department: {
							name: { contains: search, mode: "insensitive" },
						},
					},
					{
						position: {
							name: { contains: search, mode: "insensitive" },
						},
					},
					{
						phone: {
							contains: search,
							mode: "insensitive",
						},
					},
				];
			}
		}
		if (departmentFilter !== "all") {
			whereClause.departmentId = departmentFilter;
		}
		if (statusFilter !== "all") {
			whereClause.status = statusFilter.toLowerCase() as EmployeeStatus;
		}

		const orderBy: Prisma.EmployeeOrderByWithRelationInput = {};

		if (sortBy === "name") {
			orderBy.user = {
				name: sortOrder,
			};
		} else if (sortBy === "department") {
			orderBy.department = {
				name: sortOrder,
			};
		} else if (sortBy === "position") {
			orderBy.position = {
				name: sortOrder,
			};
		} else {
			Object.assign(orderBy, { [sortBy]: sortOrder });
		}

		const employees = await prisma.employee.findMany({
			skip: offset,
			take: limit,
			where: whereClause,
			orderBy,
			include: {
				department: true,
				position: true,
				permissions: true,
				skills: true,
				documents: true,
				user: {
					select: {
						name: true,
						email: true,
						username: true,
						role: true,
						avatar: true,
						id: true,
						active: true,
					},
				},
			},
		});

		const totalCount = await prisma.employee.count({
			where: whereClause,
		});

		return NextResponse.json({ employees, totalCount }, { status: 200 });
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
		console.log("body", body);

		const { user, ...employeeData } = body;

		const isExistingUser = await prisma.user.findUnique({
			where: {
				email: user.email,
			},
		});

		if (!isExistingUser) {
			return NextResponse.json(
				{ error: "User nicht gefunden" },
				{ status: 404 },
			);
		}

		const newEmployee = await prisma.employee.create({
			data: {
				phone: employeeData.phone,
				zip: employeeData.zip,
				city: employeeData.city,
				country: employeeData.country,
				street: employeeData.street,
				user: {
					connect: {
						id: isExistingUser.id,
					},
				},
			},
		});

		return NextResponse.json(newEmployee, { status: 201 });
	} catch (error) {
		console.error("error", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
