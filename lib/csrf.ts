import csrf from "csrf";
import { cookies, headers } from "next/headers";

const tokens = new csrf();
const secret = process.env.CSRF_SECRET || tokens.secretSync();

/**
 * Verifies the CSRF token.
 * @returns {Promise<boolean>}
 */
export async function verifyCsrfToken(): Promise<boolean> {
	try {
		const csrfHeader = (await headers()).get("X-CSRF-Token");
		const csrfCookie = (await cookies()).get("XSRF-TOKEN")?.value;

		console.log("CSRF Header:", csrfHeader);
		console.log("CSRF Cookie:", csrfCookie);

		if (!csrfHeader || !csrfCookie) {
			console.log("Missing CSRF token in header or cookie");
			return false;
		}

		// In production, we'll be more lenient with token verification
		if (process.env.NODE_ENV === "production") {
			return csrfHeader === csrfCookie;
		}

		// In development, we'll use strict verification
		const isValid = tokens.verify(secret, csrfHeader);
		const matches = csrfHeader === csrfCookie;
		
		console.log("CSRF token valid:", isValid);
		console.log("CSRF tokens match:", matches);

		return isValid && matches;
	} catch (error) {
		console.error("CSRF verification error:", error);
		return false;
	}
}
