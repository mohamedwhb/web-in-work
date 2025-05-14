// app/api/password-policy/route.ts

import prisma from "@/db/prisma";
import { verifyCsrfToken } from "@/lib/csrf";
import { NextResponse } from "next/server";

interface PolicyPayload {
	minLength?: number;
	requireUppercase?: boolean;
	requireNumber?: boolean;
	requireSymbol?: boolean;
	expiryInDays?: number;
}

const VALIDATORS: { [K in keyof PolicyPayload]: (v: any) => boolean } = {
	minLength: (v) => typeof v === "number" && v >= 1,
	requireUppercase: (v) => typeof v === "boolean",
	requireNumber: (v) => typeof v === "boolean",
	requireSymbol: (v) => typeof v === "boolean",
	expiryInDays: (v) => typeof v === "number" && v >= 1,
};

export async function GET() {
	try {
		const policy = await prisma.passwordPolicy.findUnique({ where: { id: 1 } });
		return NextResponse.json(policy);
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function PUT(req: Request) {
	try {
		const isValid = await verifyCsrfToken();
		if (!isValid) {
			return NextResponse.json(
				{ error: "Ungültige Anmeldeinformationen" },
				{ status: 401 },
			);
		}
		const body: PolicyPayload = await req.json();

		// validate payload
		for (const key of Object.keys(body) as (keyof PolicyPayload)[]) {
			const validator = VALIDATORS[key];
			if (validator && !validator(body[key])) {
				return NextResponse.json(
					{ error: `Invalid value for '${key}'` },
					{ status: 400 },
				);
			}
		}

		const policy = await prisma.passwordPolicy.upsert({
			where: { id: 1 },
			update: {
				...body,
			},
			create: {
				id: 1,
				minLength: body.minLength ?? 8,
				requireUppercase: body.requireUppercase ?? true,
				requireNumber: body.requireNumber ?? true,
				requireSymbol: body.requireSymbol ?? true,
				expiryInDays: body.expiryInDays ?? 90,
			},
		});

		return NextResponse.json(policy);
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
