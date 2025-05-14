import type { Permission } from "@prisma/client";

export type PermissionKey = Permission["key"];
export type PermissionKeyType = [
	"VIEW_DASHBOARD",
	"VIEW_OFFERS",
	"CREATE_OFFERS",
	"EDIT_OFFERS",
	"DELETE_OFFERS",
	"VIEW_INVOICES",
	"CREATE_INVOICES",
	"EDIT_INVOICES",
	"DELETE_INVOICES",
	"VIEW_CUSTOMERS",
	"CREATE_CUSTOMERS",
	"EDIT_CUSTOMERS",
	"DELETE_CUSTOMERS",
	"VIEW_PRODUCTS",
	"CREATE_PRODUCTS",
	"EDIT_PRODUCTS",
	"DELETE_PRODUCTS",
	"VIEW_EMPLOYEES",
	"CREATE_EMPLOYEES",
	"EDIT_EMPLOYEES",
	"DELETE_EMPLOYEES",
	"MANAGE_PERMISSIONS",
	"VIEW_FINANCES",
	"MANAGE_FINANCES",
	"VIEW_SETTINGS",
	"EDIT_SETTINGS",
	"VIEW_REPORTS",
	"CREATE_REPORTS",
	"VIEW_INVENTORY",
	"MANAGE_INVENTORY",
][number];

// Vordefinierte Rollen mit entsprechenden Berechtigungen
export async function getPermissionsForRole(
	role: string,
): Promise<PermissionKey[]> {
	try {
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/permissions?role=${role.toLowerCase()}`,
		);
		const data = await res.json();
		const permissions = data.permissions.map((permission: PermissionKey) =>
			permission.toLowerCase(),
		);
		return permissions;
	} catch (error) {
		console.error(error);
		return [];
	}
}

// Hilfsfunktion zum Prüfen, ob ein Benutzer eine bestimmte Berechtigung hat
export function hasPermission(
	userPermissions: PermissionKey[],
	requiredPermission: PermissionKey,
): boolean {
	return userPermissions.includes(requiredPermission);
}

// Hilfsfunktion zum Prüfen, ob ein Benutzer alle angegebenen Berechtigungen hat
export function hasAllPermissions(
	userPermissions: PermissionKey[],
	requiredPermissions: PermissionKey[],
): boolean {
	return requiredPermissions.every((permission) =>
		userPermissions.includes(permission),
	);
}

// Hilfsfunktion zum Prüfen, ob ein Benutzer mindestens eine der angegebenen Berechtigungen hat
export function hasAnyPermission(
	userPermissions: PermissionKey[],
	requiredPermissions: PermissionKey[],
): boolean {
	return requiredPermissions.some((permission) =>
		userPermissions.includes(permission),
	);
}
