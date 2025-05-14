import { getRateLimit } from "@/lib/rate-limit";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET as any;

export async function GET(req: Request) {
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
		const { searchParams } = new URL(req.url);
		const token = searchParams.get("token");

		if (!token) {
			return NextResponse.json({ error: "Token is required" }, { status: 400 });
		}
		const decoded = jwt.verify(token, JWT_SECRET);
		console.log(decoded);
		if (!decoded) {
			return NextResponse.json({ error: "Invalid token" }, { status: 401 });
		}
		return NextResponse.json({ decoded });
	} catch (error) {
		return NextResponse.json({ error: "Invalid token" }, { status: 401 });
	}
}
