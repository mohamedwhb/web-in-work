"use client";

import { usePermission } from "@/contexts/permission-context";
import type { PermissionKeyType } from "@/lib/permissions";
import type { ReactNode } from "react";

interface PermissionGateProps {
	permissions: PermissionKeyType[];
	children: ReactNode;
	fallback?: ReactNode;
	requireAll?: boolean;
}

export function PermissionGate({
	permissions,
	children,
	fallback = null,
	requireAll = false,
}: PermissionGateProps) {
	const { hasAllPermissions, hasAnyPermission, isLoading } = usePermission();

	// Während des Ladens zeigen wir nichts an
	if (isLoading) {
		return null;
	}

	// Prüfe, ob der Benutzer die erforderlichen Berechtigungen hat
	const hasAccess = requireAll
		? hasAllPermissions(permissions)
		: hasAnyPermission(permissions);

	// Wenn der Benutzer die Berechtigungen hat, zeige den Inhalt an
	if (hasAccess) {
		return <>{children}</>;
	}

	// Andernfalls zeige den Fallback an (falls vorhanden)
	return <>{fallback}</>;
}
