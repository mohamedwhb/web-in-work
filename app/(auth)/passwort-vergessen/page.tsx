"use client";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { secureFetch } from "@/lib/secure-fetch";
import { useState, useTransition } from "react";
import { z } from "zod";

export default function ForgetPasswordPage() {
	const { toast } = useToast();
	const [send, setSend] = useState<boolean>(false);
	const [email, setEmail] = useState("");
	const [isPending, startTransition] = useTransition();

	const handleEmailSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const isValidEmail = z.string().email().safeParse(email);
		if (!isValidEmail.success) {
			toast({ title: "Fehler", description: "Ungültige E-Mail-Adresse" });
			return;
		}

		startTransition(async () => {
			try {
				const res = await secureFetch("/api/auth/forget-password/email", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email }),
				});

				if (res.ok) {
					setSend(true);
				} else {
					toast({
						title: "Fehler",
						description: "Fehler beim Senden der E-Mail-Adresse",
					});
				}
			} catch (error) {
				toast({
					title: "Fehler",
					description: "Netzwerkfehler beim Senden der E-Mail-Adresse",
				});
			}
		});
	};

	if (send) {
		return (
			<Card className="w-full max-w-md">
				<CardHeader className="text-center space-y-1">
					<CardTitle className="text-2xl font-bold">
						Passwort vergessen
					</CardTitle>
					<CardDescription>
						Bitte geben Sie Ihre E-Mail-Adresse ein, um das Passwort
						zurückzusetzen.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<p>
						Wir haben eine E-Mail mit einem Link zum Zurücksetzen Ihres
						Passworts an die von Ihnen angegebene E-Mail-Adresse gesendet.
					</p>
					<p>
						Bitte prüfen Sie Ihren Posteingang und folgen Sie dem Link, um Ihr
						Passwort zu ändern.
					</p>
					<p>
						Falls Sie diese E-Mail nicht erhalten haben, überprüfen Sie bitte
						auch Ihren Spam-Ordner. Wenn Sie weiterhin Probleme haben,
						kontaktieren Sie uns bitte per E-Mail.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader className="text-center space-y-1">
				<CardTitle className="text-2xl font-bold">Passwort vergessen</CardTitle>
				<CardDescription>
					Bitte geben Sie Ihre E-Mail-Adresse ein, um das Passwort
					zurückzusetzen.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<form
					onSubmit={handleEmailSubmit}
					className="space-y-4 w-full flex flex-col items-center"
				>
					<div className="space-y-2 w-full">
						<Label htmlFor="email">E-Mail-Adresse</Label>
						<Input
							type="email"
							id="email"
							placeholder="E-Mail-Adresse"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={isPending}
						/>
					</div>
					<Button className="w-1/2" type="submit" disabled={isPending}>
						{isPending ? "Wird gesendet..." : "Weiter"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
