import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { publicRoutes } from "./lib/public-routes";

export function middleware(request: NextRequest) {
	// Überprüfen, ob der Pfad öffentlich ist
	const isPublicPath = publicRoutes.some((path) =>
		request.nextUrl.pathname.startsWith(path),
	);

	// Überprüfen, ob der Benutzer angemeldet ist
	const isAuthenticated = request.cookies.has("accessToken");

	// Wenn der Pfad nicht öffentlich ist und der Benutzer nicht angemeldet ist, zur Anmeldeseite weiterleiten
	if (
		!isPublicPath &&
		!isAuthenticated &&
		!request.nextUrl.pathname.startsWith("/api/")
	) {
		const url = new URL("/anmeldung", request.url);
		return NextResponse.redirect(url);
	}

	// Wenn der Benutzer angemeldet ist und versucht, auf die Anmeldeseite zuzugreifen, zum Dashboard weiterleiten
	if (isAuthenticated && request.nextUrl.pathname === "/anmeldung") {
		const url = new URL("/dashboard", request.url);
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		// Alle Pfade außer statische Dateien und API-Routen
		"/((?!_next/static|_next/image|favicon.ico).*)",
	],
};
