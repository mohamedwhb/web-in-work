"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Copy, Loader2 } from "lucide-react";
import { useState } from "react";

interface ResetPasswordDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	employeeId: string;
	employeeName: string;
	userId: string;
}

export function ResetPasswordDialog({
	open,
	onOpenChange,
	employeeId,
	employeeName,
	userId,
}: ResetPasswordDialogProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [newPassword, setNewPassword] = useState("");

	const handleResetPassword = async () => {
		setIsLoading(true);

		try {
			// In einer echten Anwendung würde hier ein API-Aufruf stehen
			// Simuliere eine kurze Verzögerung
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Generiere ein einfaches Passwort (in einer echten Anwendung würde ein sicheres Passwort generiert werden)
			const generatedPassword = `${userId}123`;
			setNewPassword(generatedPassword);

			toast({
				title: "Passwort zurückgesetzt",
				description: `Das Passwort für ${employeeName} wurde erfolgreich zurückgesetzt.`,
			});
		} catch (error) {
			toast({
				title: "Fehler",
				description:
					"Beim Zurücksetzen des Passworts ist ein Fehler aufgetreten.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const copyToClipboard = () => {
		navigator.clipboard.writeText(newPassword);
		toast({
			title: "Kopiert",
			description: "Das Passwort wurde in die Zwischenablage kopiert.",
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Passwort zurücksetzen</DialogTitle>
					<DialogDescription>
						Setzen Sie das Passwort für {employeeName} zurück. Ein neues
						temporäres Passwort wird generiert.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					{!newPassword ? (
						<div className="text-center">
							<p className="text-sm text-muted-foreground mb-4">
								Durch das Zurücksetzen wird das aktuelle Passwort ungültig. Der
								Mitarbeiter muss sich mit dem neuen Passwort anmelden.
							</p>
							<Button onClick={handleResetPassword} disabled={isLoading}>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Wird zurückgesetzt...
									</>
								) : (
									"Passwort zurücksetzen"
								)}
							</Button>
						</div>
					) : (
						<div className="space-y-2">
							<Label htmlFor="newPassword">Neues temporäres Passwort</Label>
							<div className="flex items-center gap-2">
								<Input
									id="newPassword"
									value={newPassword}
									readOnly
									className="font-mono"
								/>
								<Button variant="outline" size="icon" onClick={copyToClipboard}>
									<Copy className="h-4 w-4" />
								</Button>
							</div>
							<p className="text-xs text-muted-foreground">
								Bitte teilen Sie dieses Passwort sicher mit dem Mitarbeiter. Der
								Mitarbeiter sollte das Passwort bei der nächsten Anmeldung
								ändern.
							</p>
						</div>
					)}
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Schließen
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
