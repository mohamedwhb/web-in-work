import { signAccessToken, verifyRefreshToken } from "@/lib/jwt";
import { getRateLimit } from "@/lib/rate-limit";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

		// Skip CSRF verification for refresh token endpoint
		// This is safe because refresh tokens are httpOnly cookies
		const refreshToken = (await cookies()).get("refreshToken")?.value;
		if (!refreshToken) {
			return NextResponse.json(
				{ message: "No refresh token" },
				{ status: 401 },
			);
		}

		const { sub: userId } = verifyRefreshToken(refreshToken) as { sub: string };
		if (!userId) {
			return NextResponse.json(
				{ message: "Invalid refresh token" },
				{ status: 401 },
			);
		}

		const newAccessToken = signAccessToken({ sub: userId });

		const res = NextResponse.json({ accessToken: newAccessToken });
		res.cookies.set({
			name: "accessToken",
			value: newAccessToken,
			httpOnly: true,
			path: "/",
			maxAge: 15 * 60,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
		});
		return res;
	} catch (err) {
		return NextResponse.json(
			{ message: "Invalid refresh token" },
			{ status: 401 },
		);
	}
}
