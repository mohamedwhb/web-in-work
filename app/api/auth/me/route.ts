import prisma from "@/db/prisma";
import {
	signAccessToken,
	verifyAccessToken,
	verifyRefreshToken,
} from "@/lib/jwt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	try {
		let token = (await cookies()).get("accessToken")?.value;
		let newTokenGenerated = false;

		if (!token) {
			const refreshToken = (await cookies()).get("refreshToken")?.value;
			if (!refreshToken) {
				return NextResponse.json({ user: null }, { status: 401 });
			}

			try {
				const { sub: userId } = verifyRefreshToken(refreshToken) as {
					sub: string;
				};
				if (!userId) {
					return NextResponse.json({ user: null }, { status: 401 });
				}

				const newAccessToken = signAccessToken({ sub: userId });
				token = newAccessToken;
				newTokenGenerated = true;
			} catch (error) {
				if (error instanceof jwt.TokenExpiredError) {
					return NextResponse.json({ user: null }, { status: 401 });
				}
				throw error;
			}
		}

		try {
			const payload = verifyAccessToken(token) as { sub: string };
			const user = await prisma.user.findUnique({
				where: { id: payload.sub },
				include: {
					role: {
						select: {
							key: true,
							rolePermissions: { select: { key: true } },
						},
					},
				},
			});
			if (!user) throw new Error("User not found");

			const response = NextResponse.json({ user });

			// If we generated a new token, set it in the cookies
			if (newTokenGenerated) {
				response.cookies.set({
					name: "accessToken",
					value: token,
					httpOnly: true,
					path: "/",
					maxAge: 15 * 60, // 15 minutes
					secure: process.env.NODE_ENV === "production",
					sameSite: "lax",
				});
			}

			return response;
		} catch (error) {
			if (error instanceof jwt.TokenExpiredError) {
				// If the access token is expired, try to refresh it
				const refreshToken = (await cookies()).get("refreshToken")?.value;
				if (!refreshToken) {
					return NextResponse.json({ user: null }, { status: 401 });
				}

				try {
					const { sub: userId } = verifyRefreshToken(refreshToken) as {
						sub: string;
					};
					if (!userId) {
						return NextResponse.json({ user: null }, { status: 401 });
					}

					const newAccessToken = signAccessToken({ sub: userId });
					const user = await prisma.user.findUnique({
						where: { id: userId },
						include: {
							role: {
								select: {
									key: true,
									rolePermissions: { select: { key: true } },
								},
							},
						},
					});
					if (!user) throw new Error("User not found");

					const response = NextResponse.json({ user });
					response.cookies.set({
						name: "accessToken",
						value: newAccessToken,
						httpOnly: true,
						path: "/",
						maxAge: 15 * 60, // 15 minutes
						secure: process.env.NODE_ENV === "production",
						sameSite: "lax",
					});
					return response;
				} catch (refreshError) {
					if (refreshError instanceof jwt.TokenExpiredError) {
						return NextResponse.json({ user: null }, { status: 401 });
					}
					throw refreshError;
				}
			}
			throw error;
		}
	} catch (e) {
		console.error("Error in me route", e);
		return NextResponse.json({ user: null }, { status: 401 });
	}
}
