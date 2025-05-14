import csrf from "csrf";
import { cookies, headers } from "next/headers";

const tokens = new csrf();
const secret = process.env.CSRF_SECRET || tokens.secretSync();

/**
 * Verifies the CSRF token.
 * @returns {Promise<boolean>}
 */
export async function verifyCsrfToken(): Promise<boolean> {
	const csrfHeader = (await headers()).get("X-CSRF-Token");
	const csrfCookie = (await cookies()).get("XSRF-TOKEN")?.value;

	if (!csrfHeader || !csrfCookie) {
		return false;
	}

	const isValid = tokens.verify(secret, csrfHeader);
	return isValid && csrfHeader === csrfCookie;
}
