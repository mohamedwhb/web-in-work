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
			console.log("Rate limit exceeded");
			return NextResponse.json(
				{ message: "Too Many Requests" },
				{ status: 429 },
			);
		}

		// Log CSRF verification
		console.log("Verifying CSRF token...");
		const isValid = await verifyCsrfToken();
		console.log("CSRF token valid:", isValid);
		
		if (!isValid) {
			return NextResponse.json(
				{ error: "CSRF token invalid" },
				{ status: 401 },
			);
		}

		const { username, password } = await request.json();
		console.log("Login attempt for username:", username);

		if (!username || !password) {
			console.log("Missing username or password");
			return NextResponse.json(
				{ message: "Ungültige Anmeldeinformationen" },
				{ status: 401 },
			);
		}

		const isValidLogin = loginUserSchema.safeParse({ username, password });
		if (!isValidLogin.success) {
			console.log("Invalid login schema:", isValidLogin.error);
			return NextResponse.json(
				{ message: "Ungültige Anmeldeinformationen" },
				{ status: 401 },
			);
		}

		try {
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
			console.log("Found user:", user ? "Yes" : "No");
			if (user) {
				console.log("User role:", user.role.key);
				console.log("User permissions:", user.role.rolePermissions.map(p => p.key));
			}

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
				console.log("Password expired");
				return NextResponse.json(
					{ message: "Passwort abgelaufen" },
					{ status: 401 },
				);
			}

			const isValidPassword = await bcrypt.compare(password, user.password);
			console.log("Password valid:", isValidPassword);

			if (!isValidPassword) {
				return NextResponse.json(
					{ message: "Ungültige Anmeldeinformationen" },
					{ status: 401 },
				);
			}

			// create tokens
			console.log("Creating tokens...");
			const accessToken = signAccessToken({
				sub: user.id,
				permissions: user.role.rolePermissions.map((rp) => rp.key.toLowerCase()),
			});
			const refreshToken = signRefreshToken({ sub: user.id });
			console.log("Tokens created successfully");

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
		} catch (dbError) {
			console.error("Database error:", dbError);
			return NextResponse.json(
				{ message: "Database error", error: dbError instanceof Error ? dbError.message : "Unknown database error" },
				{ status: 500 },
			);
		}
	} catch (error) {
		console.error("Login error details:", error);
		return NextResponse.json(
			{ message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
			{ status: 500 },
		);
	}
}
