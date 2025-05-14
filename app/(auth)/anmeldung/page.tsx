"use client";

import type React from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { secureFetch } from "@/lib/secure-fetch";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AnmeldungPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const { login } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		try {
			const response = await secureFetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Anmeldung fehlgeschlagen");
			}

			// Erfolgreiche Anmeldung
			login(data.user);
			router.push("/dashboard");
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Ein unbekannter Fehler ist aufgetreten",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div>
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1 text-center">
					<CardTitle className="text-2xl font-bold">
						KMW Business System
					</CardTitle>
					<CardDescription>
						Geben Sie Ihre Mitarbeiter-ID und Ihr Passwort ein
					</CardDescription>
				</CardHeader>
				<CardContent>
					{error && (
						<Alert variant="destructive" className="mb-4">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="username">Mitarbeiter-ID</Label>
							<Input
								id="username"
								placeholder="z.B. mwahba12"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
								autoComplete="username"
							/>
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="password">Passwort</Label>
								<Button
									variant="link"
									className="p-0 h-auto text-xs"
									type="button"
									asChild
								>
									<Link href="/passwort-vergessen">Passwort vergessen?</Link>
								</Button>
							</div>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								autoComplete="current-password"
							/>
						</div>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Anmeldung...
								</>
							) : (
								"Anmelden"
							)}
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex flex-col space-y-2">
					<div className="text-center text-sm text-muted-foreground">
						Bei Problemen mit der Anmeldung wenden Sie sich bitte an Ihren
						Administrator.
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
