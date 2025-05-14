"use client";

import { usePermission } from "@/contexts/permission-context";
import type { PermissionKey } from "@/lib/permissions";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

interface ProtectedRouteProps {
	permissions: PermissionKey[];
	children: ReactNode;
	fallbackPath?: string;
	requireAll?: boolean;
}

export function ProtectedRoute({
	permissions,
	children,
	fallbackPath = "/dashboard",
	requireAll = false,
}: ProtectedRouteProps) {
	const router = useRouter();
	const { hasAllPermissions, hasAnyPermission, isLoading } = usePermission();

	useEffect(() => {
		// Warte, bis die Berechtigungen geladen sind
		if (!isLoading) {
			// Prüfe, ob der Benutzer die erforderlichen Berechtigungen hat
			const hasAccess = requireAll
				? hasAllPermissions(permissions)
				: hasAnyPermission(permissions);

			// Wenn nicht, leite zum Fallback-Pfad weiter
			if (!hasAccess) {
				router.push(fallbackPath);
			}
		}
	}, [
		isLoading,
		permissions,
		requireAll,
		router,
		fallbackPath,
		hasAllPermissions,
		hasAnyPermission,
	]);

	// Während des Ladens oder der Umleitung zeigen wir nichts an
	if (isLoading) {
		return null;
	}

	// Prüfe erneut, ob der Benutzer die erforderlichen Berechtigungen hat
	const hasAccess = requireAll
		? hasAllPermissions(permissions)
		: hasAnyPermission(permissions);

	// Wenn der Benutzer die Berechtigungen hat, zeige den Inhalt an
	if (hasAccess) {
		return <>{children}</>;
	}

	// Während der Umleitung zeigen wir nichts an
	return null;
}
