"use client";

import type { PermissionKey } from "@/lib/permissions";
import { publicRoutes } from "@/lib/public-routes";
import { secureFetch } from "@/lib/secure-fetch";
import type { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

type UserWithPermissions = User & {
	role: {
		key: string;
		rolePermissions: { key: string }[];
	};
};

interface AuthContextType {
	user: UserWithPermissions | null;
	isLoading: boolean;
	login: (user: AuthContextType["user"]) => void;
	logout: () => void;
	isAuthenticated: boolean;
	hasPermission: (permission: PermissionKey) => boolean;
	hasAllPermissions: (permissions: PermissionKey[]) => boolean;
	hasAnyPermission: (permissions: PermissionKey[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<AuthContextType["user"] | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	const checkAuth = useCallback(async () => {
		// Skip auth check for public routes

		if (
			publicRoutes.some((route) => window.location.pathname.startsWith(route))
		) {
			setIsLoading(false);
			return;
		}

		try {
			const response = await fetch("/api/auth/me", {
				credentials: "include",
			});

			if (response.ok) {
				const data = await response.json();
				setUser(data.user);
			} else if (response.status === 401) {
				// Try to refresh the token
				const refreshResponse = await fetch("/api/auth/refresh", {
					method: "POST",
					credentials: "include",
				});

				if (refreshResponse.ok) {
					// Retry the original request
					const retryResponse = await fetch("/api/auth/me", {
						credentials: "include",
					});
					if (retryResponse.ok) {
						const data = await retryResponse.json();
						setUser(data.user);
					} else {
						setUser(null);
						router.push("/anmeldung");
					}
				} else {
					setUser(null);
					router.push("/anmeldung");
				}
			} else {
				setUser(null);
				router.push("/anmeldung");
			}
		} catch (error) {
			console.error("Fehler beim Abrufen des Benutzers:", error);
			setUser(null);
			router.push("/anmeldung");
		} finally {
			setIsLoading(false);
		}
	}, [router]);

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	const login = async (user: AuthContextType["user"]) => {
		setUser(user);
	};

	const logout = async () => {
		try {
			await secureFetch("/api/auth/logout", {
				method: "POST",
				credentials: "include",
			});
			setUser(null);
			router.push("/anmeldung");
		} catch (error) {
			console.error("Fehler beim Abmelden:", error);
		}
	};

	const hasPermission = (permission: PermissionKey): boolean => {
		if (!user) return false;
		const permissions = user.role.rolePermissions.map((rp) => rp.key) || [];
		return permissions.includes(permission);
	};

	const hasAllPermissions = (permissions: PermissionKey[]): boolean => {
		return permissions.every((permission) => hasPermission(permission));
	};

	const hasAnyPermission = (permissions: PermissionKey[]): boolean => {
		return permissions.some((permission) => hasPermission(permission));
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				isLoading,
				login,
				logout,
				isAuthenticated: !!user,
				hasPermission,
				hasAllPermissions,
				hasAnyPermission,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error(
			"useAuth muss innerhalb eines AuthProviders verwendet werden",
		);
	}
	return context;
}
