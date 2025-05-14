import csrf from "csrf";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const tokens = new csrf();
const secret = process.env.CSRF_SECRET || tokens.secretSync();

export async function GET() {
	const token = tokens.create(secret);

	const response = NextResponse.json({ csrfToken: token });
	(await cookies()).set("XSRF-TOKEN", token, {
		httpOnly: true,
		sameSite: "strict",
		secure: process.env.NODE_ENV === "production",
		maxAge: Number.parseInt(process.env.CSRF_EXPIRE || "60"),
	});

	return response;
}
