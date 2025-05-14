// app/api/auth/logout/route.ts
import { verifyCsrfToken } from "@/lib/csrf";
import { getRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST() {
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

		const res = NextResponse.json({ message: "Erfolgreich abgemeldet" });
		// clear both cookies
		res.cookies.set({ name: "accessToken", value: "", maxAge: 0, path: "/" });
		res.cookies.set({
			name: "refreshToken",
			value: "",
			maxAge: 0,
			path: "/api/auth/refresh",
		});
		res.cookies.set({ name: "auth", value: "", maxAge: 0, path: "/" });
		return res;
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
