import Sidebar from "@/components/sidebar";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import type React from "react";

export default async function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex h-screen">
			<SidebarProvider>
				<Sidebar />
				<SidebarInset className="overflow-hidden">
					<SidebarTrigger className="top-1 left-1 absolute z-50" />
					<main className="flex-1 overflow-auto">
						{children}
						<Toaster />
					</main>
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
}
