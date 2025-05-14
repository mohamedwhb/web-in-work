import prisma from "@/db/prisma";
import { verifyCsrfToken } from "@/lib/csrf";
import { getRateLimit } from "@/lib/rate-limit";
import { sendMail } from "@/lib/sendMail";
import ForgetPasswordEmail from "@/templates/forget-passord";
import { render } from "@react-email/components";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { z } from "zod";

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env as any;

if (!JWT_SECRET) {
	throw new Error("Missing JWT secret in env");
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
		const { email } = await req.json();

		const isEmailValid = z.string().email().safeParse(email);
		if (!isEmailValid.success) {
			return NextResponse.json({ error: "Invalid email" }, { status: 400 });
		}
		const user = await prisma.user.findUnique({
			where: { email },
		});
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const payload = {
			email: user.email,
		};
		const token = jwt.sign(payload, JWT_SECRET, {
			expiresIn: JWT_EXPIRES_IN || "5min",
		});

		const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/passwort-vergessen/${token}`;

		const emailContent = await render(
			ForgetPasswordEmail({
				name: user.name,
				resetUrl,
			}),
		);

		await sendMail({
			to: user.email,
			subject: "Passwort vergessen",
			html: emailContent,
		});

		return NextResponse.json({ message: "Email sent" }, { status: 200 });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
