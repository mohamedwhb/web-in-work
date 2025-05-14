import prisma from "@/db/prisma";
import { verifyCsrfToken } from "@/lib/csrf";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { getRateLimit } from "@/lib/rate-limit";
import { loginUserSchema } from "@/schemas/auth.schema";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const { success } = await getRateLimit();
		if (!success) {
			return NextResponse.json(
				{ message: "Too Many Requests" },
				{ status: 429 },
			);
		}
		const isValid = await verifyCsrfToken();
		if (!isValid) {
			return NextResponse.json(
				{ error: "Ungültige Anmeldeinformationen" },
				{ status: 401 },
			);
		}

		const { username, password } = await request.json();
		if (!username || !password) {
			return NextResponse.json(
				{ message: "Ungültige Anmeldeinformationen" },
				{ status: 401 },
			);
		}

		const isValidLogin = loginUserSchema.safeParse({ username, password });
		if (!isValidLogin.success) {
			return NextResponse.json(
				{ message: "Ungültige Anmeldeinformationen" },
				{ status: 401 },
			);
		}

		const user = await prisma.user.findUnique({
			where: { username },
			include: {
				role: {
					select: {
						key: true,
						rolePermissions: {
							select: {
								key: true,
							},
						},
					},
				},
			},
		});
		if (!user) {
			return NextResponse.json(
				{ message: "Ungültige Anmeldeinformationen" },
				{ status: 401 },
			);
		}

		await prisma.user.update({
			where: { id: user.id },
			data: {
				lastLogin: new Date(),
			},
		});

		const isPasswordExpired =
			user.passwordExpiredAt && user.passwordExpiredAt < new Date();

		if (isPasswordExpired) {
			return NextResponse.json(
				{ message: "Passwort abgelaufen" },
				{ status: 401 },
			);
		}

		const isValidPassword = await bcrypt.compare(password, user.password);
		if (!isValidPassword) {
			return NextResponse.json(
				{ message: "Ungültige Anmeldeinformationen" },
				{ status: 401 },
			);
		}

		// create tokens
		const accessToken = signAccessToken({
			sub: user.id,
			permissions: user.role.rolePermissions.map((rp) => rp.key.toLowerCase()),
		});
		const refreshToken = signRefreshToken({ sub: user.id });

		const res = NextResponse.json(
			{
				message: "Anmeldung erfolgreich",
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role,
					avatar: user.avatar,
					username: user.username,
				},
			},
			{ status: 200 },
		);

		// set cookies
		res.cookies.set({
			name: "accessToken",
			value: accessToken,
			httpOnly: true,
			path: "/",
			maxAge: 15 * 60, // 15 minutes
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
		});
		res.cookies.set({
			name: "refreshToken",
			value: refreshToken,
			httpOnly: true,
			path: "/",
			maxAge: 24 * 60 * 60, // 24 hours
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
		});

		return res;
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
