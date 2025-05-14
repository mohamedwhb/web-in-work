"use client";

import { PageHeader } from "@/components/page-header";
import PasswordPolicyForm from "@/components/password-policy-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { secureFetch } from "@/lib/secure-fetch";
import type { Prisma, Role } from "@prisma/client";
import { Loader2, Pencil, Shield, Trash2, UserPlus } from "lucide-react";
import { type FormEvent, useEffect, useState, useTransition } from "react";

type UserWithRoleType = Prisma.UserGetPayload<{
	include: { role: true };
}>;

export default function UserManagementPage() {
	const { toast } = useToast();

	const [roles, setRoles] = useState<Role[]>([]);
	const [users, setUsers] = useState<UserWithRoleType[]>([]);
	const [isLoadingUsers, setIsLoadingUsers] = useState(false);
	const [newUser, setNewUser] = useState({
		name: "",
		email: "",
		role: "user",
		active: true,
	});
	const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
	const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
	const [currentUser, setCurrentUser] = useState<any>(null);

	const [isPending, startTransition] = useTransition();

	const roleLabels: Record<string, string> = {
		admin: "Administrator",
		manager: "Manager",
		user: "Benutzer",
	};

	const roleColors: Record<string, string> = {
		admin: "bg-red-100 text-red-800",
		manager: "bg-blue-100 text-blue-800",
		user: "bg-green-100 text-green-800",
	};

	const handleAddUser = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!newUser.name || !newUser.email || !newUser.role) {
			toast({
				title: "Fehler",
				description: "Bitte geben Sie einen Namen und eine E-Mail-Adresse ein.",
				variant: "destructive",
			});
			return;
		}
		startTransition(async () => {
			try {
				const res = await secureFetch("/api/users", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(newUser),
				});

				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.message);
				}

				setUsers((prev) => [...prev, data.user]);

				setNewUser({ name: "", email: "", role: "user", active: true });
				setIsAddUserDialogOpen(false);

				toast({
					title: "Benutzer hinzugefügt",
					description: `Der Benutzer "${newUser.name}" wurde erfolgreich hinzugefügt.`,
				});
			} catch (error) {
				toast({
					title: "Fehler",
					description: "Fehler beim Hinzufügen des Benutzers.",
					variant: "destructive",
				});
			}
		});
	};

	const handleEditUser = async (formData: FormData) => {
		if (!currentUser.name || !currentUser.email) {
			toast({
				title: "Fehler",
				description: "Bitte geben Sie einen Namen und eine E-Mail-Adresse ein.",
				variant: "destructive",
			});
			return;
		}

		const active = formData.get("active") === "on";
		const updatedData = {
			...Object.fromEntries(formData),
			active,
		};
		startTransition(async () => {
			try {
				const response = await secureFetch(`/api/users/${currentUser.id}`, {
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(updatedData),
				});
				const data = await response.json();

				if (!response.ok) {
					throw new Error("Failed to update user");
				}

				setUsers((prev) =>
					prev.map((user) => {
						if (user.id === currentUser.id) {
							return {
								...user,
								...data,
							};
						}
						return user;
					}),
				);

				toast({
					title: "Benutzer aktualisiert",
					description: `Der Benutzer "${currentUser.name}" wurde erfolgreich aktualisiert.`,
				});
			} catch (error) {
				toast({
					title: "Fehler",
					description: "Fehler beim Aktivieren/Deaktivieren des Benutzers.",
					variant: "destructive",
				});
			}

			setIsEditUserDialogOpen(false);
		});
	};

	const handleDeleteUser = async (id: string) => {
		startTransition(async () => {
			try {
				const res = await secureFetch(`/api/users/${id}`, {
					method: "DELETE",
				});
				if (!res.ok) {
					throw new Error("Failed to delete user");
				}
				setUsers(users.filter((user) => user.id !== id));
				toast({
					title: "Benutzer gelöscht",
					description: "Der Benutzer wurde erfolgreich gelöscht.",
				});
			} catch (error) {
				toast({
					title: "Fehler",
					description: "Fehler beim Löschen des Benutzers.",
					variant: "destructive",
				});
			}
		});
	};

	const handleToggleActive = async (id: string) => {
		startTransition(async () => {
			try {
				const response = await secureFetch(`/api/users/${id}`, {
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						active: !users.find((user) => user.id === id)?.active,
					}),
				});
				const data = await response.json();

				if (!response.ok) {
					throw new Error("Failed to toggle user's active status");
				}

				setUsers(
					users.map((user) =>
						user.id === id ? { ...user, active: !user.active } : user,
					),
				);
			} catch (error) {
				toast({
					title: "Fehler",
					description: "Fehler beim Aktivieren/Deaktivieren des Benutzers.",
					variant: "destructive",
				});
			}
		});
	};

	const formatDate = (dateString: string) => {
		if (dateString === "-") return "-";
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("de-DE", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	};

	useEffect(() => {
		const fetchUsers = async () => {
			setIsLoadingUsers(true);
			const [usersResponse, rolesResponse] = await Promise.all([
				fetch("/api/users").then((res) => res.json()),
				fetch("/api/roles").then((res) => res.json()),
			]);

			setUsers(usersResponse.users);
			setRoles(rolesResponse.roles);
			setIsLoadingUsers(false);
		};

		fetchUsers();
	}, []);

	return (
		<div className="max-w-7xl px-2 mx-auto py-6 space-y-6">
			<PageHeader
				heading="Benutzerverwaltung"
				description="Verwalten Sie Benutzer und Berechtigungen"
			/>

			<div className="flex justify-between items-center">
				<h2 className="text-xl font-semibold">Benutzer</h2>
				<Dialog
					open={isAddUserDialogOpen}
					onOpenChange={setIsAddUserDialogOpen}
				>
					<DialogTrigger asChild>
						<Button>
							<UserPlus className="h-4 w-4 mr-2" />
							Benutzer hinzufügen
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Neuen Benutzer hinzufügen</DialogTitle>
							<DialogDescription>
								Fügen Sie einen neuen Benutzer zum System hinzu.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleAddUser}>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="name">Name</Label>
									<Input
										id="name"
										value={newUser.name}
										onChange={(e) =>
											setNewUser({ ...newUser, name: e.target.value })
										}
										placeholder="Max Mustermann"
										disabled={isPending}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="email">E-Mail</Label>
									<Input
										id="email"
										type="email"
										value={newUser.email}
										onChange={(e) =>
											setNewUser({ ...newUser, email: e.target.value })
										}
										placeholder="max@example.com"
										disabled={isPending}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="role">Rolle</Label>
									<Select
										value={newUser.role}
										onValueChange={(value) =>
											setNewUser({ ...newUser, role: value })
										}
										disabled={isPending}
									>
										<SelectTrigger id="role">
											<SelectValue placeholder="Wählen Sie eine Rolle" />
										</SelectTrigger>
										<SelectContent>
											{roles.map((role) => (
												<SelectItem
													className="capitalize"
													key={role.id}
													value={role.key}
												>
													{role.key}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="flex items-center space-x-2">
									<Switch
										id="active"
										checked={newUser.active}
										onCheckedChange={(checked) =>
											setNewUser({ ...newUser, active: checked })
										}
										disabled={isPending}
									/>
									<Label htmlFor="active">Aktiv</Label>
								</div>
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									type="button"
									onClick={() => setIsAddUserDialogOpen(false)}
									disabled={isPending}
								>
									Abbrechen
								</Button>
								<Button type="submit" disabled={isPending}>
									Benutzer hinzufügen
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			<Card>
				<CardContent className="p-0">
					{isLoadingUsers ? (
						<div className="flex justify-center items-center min-h-[200px]">
							<Loader2 className="h-4 w-4 animate-spin" />
						</div>
					) : users?.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Benutzer</TableHead>
									<TableHead>E-Mail</TableHead>
									<TableHead>Rolle</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Letzter Login</TableHead>
									<TableHead>Aktionen</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{users.map((user) => (
									<TableRow key={user.id}>
										<TableCell>
											<div className="flex items-center space-x-3">
												<Avatar>
													<AvatarImage
														src={user.avatar || "/placeholder.svg"}
														alt={user.name}
													/>
													<AvatarFallback>
														{user.name
															.split(" ")
															.map((n) => n[0])
															.join("")
															.toUpperCase()}
													</AvatarFallback>
												</Avatar>
												<span>{user.name}</span>
											</div>
										</TableCell>
										<TableCell>{user.email}</TableCell>
										<TableCell>
											<Badge className={roleColors[user.role.key]}>
												{roleLabels[user.role.key]}
											</Badge>
										</TableCell>
										<TableCell>
											<Badge variant={user.active ? "default" : "outline"}>
												{user.active ? "Aktiv" : "Inaktiv"}
											</Badge>
										</TableCell>
										<TableCell>
											{formatDate(user.lastLogin?.toISOString() ?? "-")}
										</TableCell>
										<TableCell>
											<div className="flex space-x-2">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => {
														setCurrentUser(user);
														setIsEditUserDialogOpen(true);
													}}
													disabled={isPending}
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleToggleActive(user.id)}
													disabled={isPending}
												>
													<Shield className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleDeleteUser(user.id)}
													disabled={isPending}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<div className="p-4 text-center text-muted-foreground">
							Keine Benutzer gefunden.
						</div>
					)}
				</CardContent>
			</Card>

			<Dialog
				open={isEditUserDialogOpen}
				onOpenChange={setIsEditUserDialogOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Benutzer bearbeiten</DialogTitle>
						<DialogDescription>
							Bearbeiten Sie die Informationen des Benutzers.
						</DialogDescription>
					</DialogHeader>
					<form action={handleEditUser}>
						{currentUser && (
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="edit-name">Name</Label>
									<Input
										id="edit-name"
										value={currentUser.name}
										name="name"
										onChange={(e) =>
											setCurrentUser({ ...currentUser, name: e.target.value })
										}
										disabled={isPending}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-email">E-Mail</Label>
									<Input
										id="edit-email"
										type="email"
										name="email"
										value={currentUser.email}
										onChange={(e) =>
											setCurrentUser({ ...currentUser, email: e.target.value })
										}
										disabled={isPending}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-role">Rolle</Label>
									<Select
										value={currentUser.role.key}
										name="role"
										onValueChange={(value) =>
											setCurrentUser({ ...currentUser, role: value })
										}
										disabled={isPending}
									>
										<SelectTrigger id="edit-role">
											<SelectValue placeholder="Wählen Sie eine Rolle" />
										</SelectTrigger>
										<SelectContent>
											{roles.map((role) => (
												<SelectItem
													className="capitalize"
													key={role.id}
													value={role.id}
												>
													{role.key}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="flex items-center space-x-2">
									<Switch
										id="edit-active"
										name="active"
										checked={currentUser.active}
										onCheckedChange={(checked) =>
											setCurrentUser({ ...currentUser, active: checked })
										}
										disabled={isPending}
									/>
									<Label htmlFor="edit-active">Aktiv</Label>
								</div>
							</div>
						)}
						<DialogFooter>
							<Button
								variant="outline"
								type="button"
								onClick={() => setIsEditUserDialogOpen(false)}
								disabled={isPending}
							>
								Abbrechen
							</Button>
							<Button type="submit" disabled={isPending}>
								Änderungen speichern
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<PasswordPolicyForm />
		</div>
	);
}
