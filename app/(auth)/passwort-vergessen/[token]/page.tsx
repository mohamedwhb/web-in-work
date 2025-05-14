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
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export default function ChangePasswordPage() {
	const { toast } = useToast();
	const { token } = useParams();
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [newPassword, setNewPassword] = useState({
		password: "",
		confirmPassword: "",
	});
	const [validToken, setValidToken] = useState<boolean | null>(null);

	useEffect(() => {
		const verifyJWT = async () => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify-token?token=${token}`,
				);
				if (res.ok) {
					setValidToken(true);
				} else {
					setValidToken(false);
				}
			} catch (error) {
				setValidToken(false);
			}
		};

		if (token) {
			verifyJWT();
		} else {
			setValidToken(false);
		}
	}, [token]);

	const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setNewPassword((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const handleSubmitNewPassword = (e: React.FormEvent) => {
		e.preventDefault();

		if (newPassword.password !== newPassword.confirmPassword) {
			toast({
				title: "Fehler",
				description: "Passwörter stimmen nicht überein",
			});
			return;
		}

		startTransition(async () => {
			try {
				const res = await secureFetch(
					"/api/auth/forget-password/new-password",
					{
						method: "PATCH",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							password: newPassword.password,
							token: token,
						}),
					},
				);

				if (res.ok) {
					toast({
						title: "Erfolg",
						description: "Passwort wurde zurückgesetzt",
					});
					router.push("/anmeldung");
				} else {
					toast({
						title: "Fehler",
						description: "Fehler beim Zurücksetzen des Passworts",
					});
				}
			} catch (error) {
				toast({
					title: "Fehler",
					description: "Netzwerkfehler beim Zurücksetzen des Passworts",
				});
			}
		});
	};

	if (validToken === null) {
		return (
			<Card className="w-full max-w-md">
				<CardContent className="text-center">
					<p>Überprüfe Token...</p>
				</CardContent>
			</Card>
		);
	}

	if (!validToken) {
		return (
			<Card className="w-full max-w-md">
				<CardContent className="text-center">
					<p>Die Seite ist nicht verfügbar oder der Token ist ungültig.</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader className="text-center space-y-1">
				<CardTitle className="text-2xl font-bold">Passwort vergessen</CardTitle>
				<CardDescription>
					Bitte geben Sie das neue Passwort ein.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4 grid place-content-center">
				<form
					onSubmit={handleSubmitNewPassword}
					className="space-y-4 w-full flex flex-col items-center"
				>
					<div className="space-y-2 w-full">
						<Label htmlFor="password">Neues Passwort</Label>
						<Input
							type="password"
							name="password"
							id="password"
							placeholder="Neues Passwort"
							value={newPassword.password}
							onChange={handleNewPasswordChange}
							disabled={isPending}
						/>
					</div>
					<div className="space-y-2 w-full">
						<Label htmlFor="confirmPassword">Passwort bestätigen</Label>
						<Input
							type="password"
							name="confirmPassword"
							id="confirmPassword"
							placeholder="Neues Passwort bestätigen"
							value={newPassword.confirmPassword}
							onChange={handleNewPasswordChange}
							disabled={isPending}
						/>
					</div>
					<Button className="w-1/2" type="submit" disabled={isPending}>
						{isPending ? "Speichern..." : "Speichern"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
