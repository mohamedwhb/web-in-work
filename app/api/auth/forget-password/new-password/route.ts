import prisma from "@/db/prisma";
import { verifyCsrfToken } from "@/lib/csrf";
import { getRateLimit } from "@/lib/rate-limit";
import { sendMail } from "@/lib/sendMail";
import ChangedPassword from "@/templates/change-password";
import { render } from "@react-email/components";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
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

		const { password, token } = await req.json();
		if (!password || !token) {
			return NextResponse.json(
				{ error: "Password and token are required" },
				{ status: 400 },
			);
		}

		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET as string,
		) as JwtPayload;
		if (!decoded) {
			return NextResponse.json({ error: "Invalid token" }, { status: 401 });
		}
		const user = await prisma.user.update({
			where: { email: decoded.email },
			data: {
				password,
				passwordChangedAt: new Date(),
			},
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const emailContent = await render(
			ChangedPassword({
				name: user.name,
			}),
		);

		await sendMail({
			to: user.email,
			subject: "Passwort vergessen",
			html: emailContent,
		});

		return NextResponse.json({ message: "Password updated" }, { status: 200 });
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
