"use client";

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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { secureFetch } from "@/lib/secure-fetch";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

interface PolicyFormValues {
	minLength: number;
	requireUppercase: boolean;
	requireNumber: boolean;
	requireSymbol: boolean;
	expiryInDays: number;
}

export default function PasswordPolicyForm() {
	const { toast } = useToast();
	const {
		register,
		handleSubmit,
		reset,
		control,
		formState: { isSubmitting },
	} = useForm<PolicyFormValues>({
		defaultValues: {
			minLength: 8,
			requireUppercase: true,
			requireNumber: true,
			requireSymbol: true,
			expiryInDays: 90,
		},
	});

	useEffect(() => {
		async function loadPolicy() {
			try {
				const res = await fetch("/api/password-policy");
				if (res.ok) {
					const data: PolicyFormValues = await res.json();
					reset(data);
				} else {
					console.error("Failed to fetch policy");
				}
			} catch (err) {
				console.error(err);
			}
		}
		loadPolicy();
	}, [reset]);

	async function onSubmit(values: PolicyFormValues) {
		try {
			const res = await secureFetch("/api/password-policy", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(values),
			});
			if (!res.ok) throw new Error((await res.json()).error || "Unknown error");
			toast({
				title: "Succes",
				description: "Wachtwoordinstellingen zijn opgeslagen.",
			});
		} catch (error: any) {
			toast({
				title: "Fout",
				description: error.message,
				variant: "destructive",
			});
		}
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Card>
				<CardHeader>
					<CardTitle>Passwort-Richtlinien</CardTitle>
					<CardDescription>
						Konfigurieren Sie die Passwort-Anforderungen für Benutzer.
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					<div className="flex items-center justify-between space-x-2">
						<div className="space-y-0.5">
							<Label htmlFor="min-length">Mindestlänge</Label>
							<p className="text-sm text-muted-foreground">
								Minimale Anzahl an Zeichen für Passwörter
							</p>
						</div>
						<Input
							id="min-length"
							type="number"
							className="w-20"
							{...register("minLength", { valueAsNumber: true, min: 1 })}
						/>
					</div>

					{[
						{
							id: "require-uppercase",
							label: "Großbuchstaben erforderlich",
							description:
								"Passwörter müssen mindestens einen Großbuchstaben enthalten",
							name: "requireUppercase" as const,
						},
						{
							id: "require-number",
							label: "Zahlen erforderlich",
							description: "Passwörter müssen mindestens eine Zahl enthalten",
							name: "requireNumber" as const,
						},
						{
							id: "require-symbol",
							label: "Sonderzeichen erforderlich",
							description:
								"Passwörter müssen mindestens ein Sonderzeichen enthalten",
							name: "requireSymbol" as const,
						},
					].map((item) => (
						<div
							className="flex items-center justify-between space-x-2"
							key={item.id}
						>
							<div className="space-y-0.5">
								<Label htmlFor={item.id}>{item.label}</Label>
								<p className="text-sm text-muted-foreground">
									{item.description}
								</p>
							</div>
							<Controller
								control={control}
								name={item.name}
								render={({ field }) => (
									<Switch
										id={item.id}
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								)}
							/>
						</div>
					))}

					<div className="flex items-center justify-between space-x-2">
						<div className="space-y-0.5">
							<Label htmlFor="password-expiry">Passwort-Ablauf (Tage)</Label>
							<p className="text-sm text-muted-foreground">
								Anzahl der Tage, nach denen Passwörter ablaufen (0 = nie)
							</p>
						</div>
						<Input
							id="password-expiry"
							type="number"
							className="w-20"
							{...register("expiryInDays", { valueAsNumber: true, min: 0 })}
						/>
					</div>
				</CardContent>

				<CardFooter>
					<Button type="submit" className="ml-auto" disabled={isSubmitting}>
						Richtlinien speichern
					</Button>
				</CardFooter>
			</Card>
		</form>
	);
}
