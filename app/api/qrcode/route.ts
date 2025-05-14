import { verifyCsrfToken } from "@/lib/csrf";
import { getRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import QRCode from "qrcode";

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
		const isValid = await verifyCsrfToken();
		if (!isValid) {
			return NextResponse.json(
				{ error: "Ungültige Anmeldeinformationen" },
				{ status: 401 },
			);
		}

		const { searchParams } = new URL(req.url);
		const text = searchParams.get("text");

		if (!text) {
			return NextResponse.json(
				{ error: 'Missing "text" query param' },
				{ status: 400 },
			);
		}
		const qr = await QRCode.toDataURL(text);
		return NextResponse.json({ qr });
	} catch (err) {
		return NextResponse.json(
			{ error: "QR generation failed" },
			{ status: 500 },
		);
	}
}
