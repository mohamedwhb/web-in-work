import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";

import { PermissionProvider } from "@/contexts/permission-context";
import { cookies } from "next/headers";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "KMW Business Management System",
	description: "Business management system for KMW GmbH",
	generator: "v0.dev",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const isValidAuth = (await cookies()).get("auth")?.value === "true";

	return (
		<html lang="de" suppressHydrationWarning>
			<body className={inter.className}>
				<NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem
					disableTransitionOnChange
				>
					<AuthProvider>
						<PermissionProvider>{children}</PermissionProvider>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
