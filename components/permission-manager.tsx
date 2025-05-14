"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import type { PermissionKey } from "@/lib/permissions";
import { useState } from "react";

interface PermissionManagerProps {
	userId: string;
	userName: string;
	initialPermissions: PermissionKey[];
	onSave: (permissions: PermissionKey[]) => void;
}

// Gruppierung der Berechtigungen für eine bessere Übersicht
const permissionGroups = [
	{
		name: "Dashboard",
		permissions: ["VIEW_DASHBOARD"],
	},
	{
		name: "Angebote",
		permissions: [
			"VIEW_OFFERS",
			"CREATE_OFFERS",
			"EDIT_OFFERS",
			"DELETE_OFFERS",
		],
	},
	{
		name: "Rechnungen",
		permissions: [
			"VIEW_INVOICES",
			"CREATE_INVOICES",
			"EDIT_INVOICES",
			"DELETE_INVOICES",
		],
	},
	{
		name: "Kunden",
		permissions: [
			"VIEW_CUSTOMERS",
			"CREATE_CUSTOMERS",
			"EDIT_CUSTOMERS",
			"DELETE_CUSTOMERS",
		],
	},
	{
		name: "Produkte",
		permissions: [
			"VIEW_PRODUCTS",
			"CREATE_PRODUCTS",
			"EDIT_PRODUCTS",
			"DELETE_PRODUCTS",
		],
	},
	{
		name: "Mitarbeiter",
		permissions: [
			"VIEW_EMPLOYEES",
			"CREATE_EMPLOYEES",
			"EDIT_EMPLOYEES",
			"DELETE_EMPLOYEES",
			"MANAGE_PERMISSIONS",
		],
	},
	{
		name: "Finanzen",
		permissions: ["VIEW_FINANCES", "MANAGE_FINANCES"],
	},
	{
		name: "Einstellungen",
		permissions: ["VIEW_SETTINGS", "EDIT_SETTINGS"],
	},
	{
		name: "Berichte",
		permissions: ["VIEW_REPORTS", "CREATE_REPORTS"],
	},
	{
		name: "Lager",
		permissions: ["VIEW_INVENTORY", "MANAGE_INVENTORY"],
	},
];

// Hilfsfunktion zum Formatieren der Berechtigungsnamen
function formatPermissionName(permission: Permission): string {
	const permissionName = permission.toString().replace("_", " ").toLowerCase();

	if (permissionName.toLowerCase().startsWith("view")) {
		return "Ansehen";
	} else if (permissionName.toLowerCase().startsWith("create")) {
		return "Erstellen";
	} else if (permissionName.toLowerCase().startsWith("edit")) {
		return "Bearbeiten";
	} else if (permissionName.toLowerCase().startsWith("delete")) {
		return "Löschen";
	} else if (permissionName.toLowerCase().startsWith("manage")) {
		return "Verwalten";
	}

	return permissionName;
}

export function PermissionManager({
	userId,
	userName,
	initialPermissions,
	onSave,
}: PermissionManagerProps) {
	const [selectedPermissions, setSelectedPermissions] =
		useState<PermissionKey[]>(initialPermissions);
	const [isLoading, setIsLoading] = useState(false);

	// Prüfen, ob eine Berechtigung ausgewählt ist
	const isPermissionSelected = (permission: Permission) => {
		return selectedPermissions.includes(permission);
	};

	// Berechtigung umschalten
	const togglePermission = (permission: Permission) => {
		if (isPermissionSelected(permission)) {
			setSelectedPermissions(
				selectedPermissions.filter((p) => p !== permission),
			);
		} else {
			setSelectedPermissions([...selectedPermissions, permission]);
		}
	};

	// Alle Berechtigungen einer Gruppe umschalten
	const togglePermissionGroup = (
		permissions: PermissionKey[],
		isSelected: boolean,
	) => {
		if (isSelected) {
			// Entferne alle Berechtigungen dieser Gruppe
			setSelectedPermissions(
				selectedPermissions.filter((p) => !permissions.includes(p)),
			);
		} else {
			// Füge alle Berechtigungen dieser Gruppe hinzu
			const newPermissions = [...selectedPermissions];
			permissions.forEach((permission) => {
				if (!newPermissions.includes(permission)) {
					newPermissions.push(permission);
				}
			});
			setSelectedPermissions(newPermissions);
		}
	};

	// Prüfen, ob alle Berechtigungen einer Gruppe ausgewählt sind
	const isGroupFullySelected = (permissions: PermissionKey[]) => {
		return permissions.every((permission) => isPermissionSelected(permission));
	};

	// Prüfen, ob einige Berechtigungen einer Gruppe ausgewählt sind
	const isGroupPartiallySelected = (permissions: PermissionKey[]) => {
		return (
			permissions.some((permission) => isPermissionSelected(permission)) &&
			!permissions.every((permission) => isPermissionSelected(permission))
		);
	};

	// Änderungen speichern
	const handleSave = async () => {
		setIsLoading(true);
		try {
			// Simuliere API-Aufruf
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Rufe die onSave-Funktion auf, um die Änderungen zu speichern
			onSave(selectedPermissions);

			toast({
				title: "Berechtigungen gespeichert",
				description: `Die Berechtigungen für ${userName} wurden erfolgreich aktualisiert.`,
			});
		} catch (error) {
			console.error("Fehler beim Speichern der Berechtigungen:", error);
			toast({
				title: "Fehler",
				description: "Die Berechtigungen konnten nicht gespeichert werden.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-lg">Berechtigungen verwalten</CardTitle>
				<CardDescription>
					Berechtigungen für {userName} (ID: {userId}) festlegen
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					{permissionGroups.map((group) => (
						<div key={group.name} className="space-y-3">
							<div className="flex items-center space-x-2">
								<Checkbox
									id={`group-${group.name}`}
									checked={isGroupFullySelected(group.permissions)}
									data-state={
										isGroupFullySelected(group.permissions)
											? "checked"
											: isGroupPartiallySelected(group.permissions)
												? "indeterminate"
												: "unchecked"
									}
									onCheckedChange={() =>
										togglePermissionGroup(
											group.permissions,
											isGroupFullySelected(group.permissions),
										)
									}
								/>
								<label
									htmlFor={`group-${group.name}`}
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									{group.name}
								</label>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 ml-6">
								{group.permissions.map((permission) => (
									<div key={permission} className="flex items-center space-x-2">
										<Checkbox
											id={permission}
											checked={isPermissionSelected(permission)}
											onCheckedChange={() => togglePermission(permission)}
										/>
										<label
											htmlFor={permission}
											className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											{formatPermissionName(permission)}
										</label>
									</div>
								))}
							</div>
						</div>
					))}
					<div className="flex flex-wrap justify-start md:justify-end space-x-2 pt-4">
						<Button variant="outline" disabled={isLoading}>
							Zurücksetzen
						</Button>
						<Button onClick={handleSave} disabled={isLoading}>
							{isLoading ? "Wird gespeichert..." : "Berechtigungen speichern"}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
