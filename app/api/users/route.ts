import prisma from "@/db/prisma";
import { verifyCsrfToken } from "@/lib/csrf";
import { getRateLimit } from "@/lib/rate-limit";
import { sendMail } from "@/lib/sendMail";
import { createUserSchema } from "@/schemas/auth.schema";
import CreateUser from "@/templates/create-user";
import { render } from "@react-email/components";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const users = await prisma.user.findMany({
			include: {
				role: true,
			},
		});
		if (!users) {
			return NextResponse.json(
				{ message: "Benutzer nicht gefunden" },
				{ status: 401 },
			);
		}

		return NextResponse.json({ users }, { status: 200 });
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json(
			{ error: "Failed to fetch users", details: (error as Error).message },
			{ status: 500 },
		);
	}
}

function generatePassword(policy: {
	minLength: number;
	requireUppercase: boolean;
	requireNumber: boolean;
	requireSymbol: boolean;
}): string {
	const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const lower = "abcdefghijklmnopqrstuvwxyz";
	const numbers = "0123456789";
	const symbols = "!@#$%^&*()_+";

	let chars = lower;
	if (policy.requireUppercase) chars += upper;
	if (policy.requireNumber) chars += numbers;
	if (policy.requireSymbol) chars += symbols;

	let password = "";
	while (true) {
		password = Array.from(
			{ length: policy.minLength },
			() => chars[Math.floor(Math.random() * chars.length)],
		).join("");

		const valid =
			(!policy.requireUppercase || /[A-Z]/.test(password)) &&
			(!policy.requireNumber || /[0-9]/.test(password)) &&
			(!policy.requireSymbol || /[!@#$%^&*()_+]/.test(password));

		if (valid) break;
	}

	return password;
}

function generateUsername(name: string) {
	return name.toLowerCase().replace(/\s+/g, "").slice(0, 10);
}

export async function POST(request: Request) {
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
		const { name, email, role, active } = await request.json();

		if (!name || !email || !role) {
			return NextResponse.json(
				{ message: "Ungültige Anmeldeinformationen" },
				{ status: 401 },
			);
		}

		const policy = await prisma.passwordPolicy.findFirst();
		if (!policy) {
			return NextResponse.json(
				{ message: "Passwort-Richtlinie nicht gefunden" },
				{ status: 500 },
			);
		}

		const rawPassword = generatePassword({
			minLength: policy.minLength,
			requireUppercase: policy.requireUppercase,
			requireNumber: policy.requireNumber,
			requireSymbol: policy.requireSymbol,
		});

		const isValidData = createUserSchema.safeParse({
			name,
			email,
			password: rawPassword,
			role,
			active,
		});
		if (!isValidData.success) {
			return NextResponse.json(
				{ message: "Ungültige Anmeldeinformationen" },
				{ status: 401 },
			);
		}

		const user = await prisma.employee.create({
			data: {
				user: {
					create: {
						name,
						email,
						password: rawPassword,
						username: generateUsername(name),
						passwordChangedAt: new Date(),
						passwordExpiredAt: new Date(
							Date.now() + 1000 * 60 * 60 * 24 * policy.expiryInDays,
						),
						active,
						role: {
							connect: { key: role },
						},
					},
				},
			},
			include: {
				role: {
					include: {
						rolePermissions: true,
					},
				},
			},
		});

		const emailContent = await render(
			CreateUser({
				name,
				email,
				username: user.username,
				password: rawPassword,
				role,
			}),
		);

		await sendMail({
			to: email,
			subject: "Willkommen bei KMW",
			html: emailContent,
		});

		return NextResponse.json({ user }, { status: 201 });
	} catch (error) {
		console.error("Fehler beim Erstellen des Benutzers:", error);
		return NextResponse.json(
			{ message: "Fehler beim Erstellen des Benutzers" },
			{ status: 500 },
		);
	}
}
