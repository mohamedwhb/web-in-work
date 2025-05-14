"use client";

import { type PermissionKey, getPermissionsForRole } from "@/lib/permissions";
import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";
import { useAuth } from "./auth-context";

interface PermissionContextType {
	userPermissions: PermissionKey[];
	setUserPermissions: (permissions: PermissionKey[]) => void;
	hasPermission: (permission: PermissionKey) => boolean;
	hasAllPermissions: (permissions: PermissionKey[]) => boolean;
	hasAnyPermission: (permissions: PermissionKey[]) => boolean;
	isLoading: boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(
	undefined,
);

export function PermissionProvider({
	children,
	initialPermissions = [],
}: { children: ReactNode; initialPermissions?: PermissionKey[] }) {
	const { user, isAuthenticated } = useAuth();
	const [userPermissions, setUserPermissions] = useState<PermissionKey[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// In einer echten Anwendung würden wir hier die Berechtigungen vom Server laden
	useEffect(() => {
		const loadPermissions = async () => {
			try {
				setIsLoading(true);
				if (isAuthenticated) {
					let permissions: PermissionKey[] = [];
					if (user?.role.rolePermissions) {
						permissions = user.role.rolePermissions.map((permission) =>
							permission.key.toLowerCase(),
						);
					} else {
						if (user?.role.key) {
							permissions = await getPermissionsForRole(user.role.key);
						}
					}
					setUserPermissions(permissions);
				}
			} catch (error) {
				console.error("Fehler beim Laden der Berechtigungen:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadPermissions();
	}, [isAuthenticated, user?.role.key, user?.role.rolePermissions]);

	const hasPermission = (permission: PermissionKey): boolean => {
		return userPermissions.includes(permission.toLowerCase());
	};

	const hasAllPermissions = (permissions: PermissionKey[]): boolean => {
		return permissions.every((permission) =>
			userPermissions.includes(permission.toLowerCase()),
		);
	};

	const hasAnyPermission = (permissions: PermissionKey[]): boolean => {
		return permissions.some((permission) =>
			userPermissions.includes(permission.toLowerCase()),
		);
	};

	return (
		<PermissionContext.Provider
			value={{
				userPermissions,
				setUserPermissions,
				hasPermission,
				hasAllPermissions,
				hasAnyPermission,
				isLoading,
			}}
		>
			{children}
		</PermissionContext.Provider>
	);
}

export function usePermission() {
	const context = useContext(PermissionContext);
	if (context === undefined) {
		throw new Error(
			"usePermission muss innerhalb eines PermissionProvider verwendet werden",
		);
	}
	return context;
}
