"use client";

import type React from "react";

import { useAuth } from "@/contexts/auth-context";
import type { PermissionKeyType } from "@/lib/permissions";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
	children: React.ReactNode;
	requiredPermissions?: PermissionKeyType[];
}

export function AuthGuard({ children, requiredPermissions }: AuthGuardProps) {
	const { isAuthenticated, isLoading, hasAllPermissions } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		// Warte, bis der Auth-Status geladen ist
		if (isLoading) return;

		// Wenn der Benutzer nicht angemeldet ist, leite zur Anmeldeseite weiter
		if (!isAuthenticated) {
			router.push(`/anmeldung?redirect=${encodeURIComponent(pathname)}`);
			return;
		}

		// Wenn Berechtigungen erforderlich sind, prüfe, ob der Benutzer sie hat
		if (requiredPermissions && requiredPermissions.length > 0) {
			if (!hasAllPermissions(requiredPermissions)) {
				// Wenn der Benutzer nicht die erforderlichen Berechtigungen hat, leite zur Zugriff-verweigert-Seite weiter
				router.push("/zugriff-verweigert");
			}
		}
	}, [
		isAuthenticated,
		isLoading,
		requiredPermissions,
		hasAllPermissions,
		router,
		pathname,
	]);

	// Wenn noch geladen wird oder der Benutzer nicht angemeldet ist, zeige nichts an
	if (isLoading || !isAuthenticated) {
		return null;
	}

	// Wenn Berechtigungen erforderlich sind und der Benutzer sie nicht hat, zeige nichts an
	if (
		requiredPermissions &&
		requiredPermissions.length > 0 &&
		!hasAllPermissions(requiredPermissions)
	) {
		return null;
	}

	// Ansonsten zeige den Inhalt an
	return <>{children}</>;
}
