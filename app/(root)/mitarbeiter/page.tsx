"use client";

import EmployeeForm from "@/components/employee-form";
import { PermissionGate } from "@/components/permission-gate";
import { PermissionManager } from "@/components/permission-manager";
import { ResetPasswordDialog } from "@/components/reset-password-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import type { PermissionKey } from "@/lib/permissions";
import { secureFetch } from "@/lib/secure-fetch";
import type { EmployeeStatus, Prisma } from "@prisma/client";
import {
	AtSign,
	Briefcase,
	Calendar,
	CalendarPlus,
	Check,
	ChevronDown,
	Clock,
	Copy,
	Download,
	Eye,
	FileIcon,
	FileText,
	GraduationCap,
	Lock,
	LogIn,
	Mail,
	MapPin,
	MoreHorizontal,
	Palmtree,
	Pencil,
	Phone,
	Plus,
	RefreshCw,
	Search,
	Shield,
	SlidersHorizontal,
	Stethoscope,
	Trash2,
	Upload,
	User,
	UserCog,
	Users,
	X,
} from "lucide-react";
import { FormEvent, useEffect, useState, useTransition } from "react";

// Hilfsfunktion zur Berechnung der Beschäftigungsdauer
function calculateEmploymentDuration(joinDate: string): string {
	const start = new Date(joinDate);
	const now = new Date();

	const yearDiff = now.getFullYear() - start.getFullYear();
	const monthDiff = now.getMonth() - start.getMonth();

	if (yearDiff > 0) {
		return yearDiff === 1
			? "1 Jahr"
			: `${yearDiff} Jahre${monthDiff > 0 ? ` und ${monthDiff} Monate` : ""}`;
	}
	return monthDiff === 1 ? "1 Monat" : `${monthDiff} Monate`;
}

// Erweiterte Mitarbeiterdaten mit mehr Informationen und Berechtigungen
export type Employee = Prisma.EmployeeGetPayload<{
	include: {
		user: {
			include: {
				role: true;
			};
		};
		department: true;
		position: true;
		permissions: true;
		skills: true;
		documents: true;
	};
}>;

export default function MitarbeiterPage() {
	const [showForm, setShowForm] = useState(false);
	const [editEmployee, setEditEmployee] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [departmentFilter, setDepartmentFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [sortBy, setSortBy] = useState<string>("name");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [notes, setNotes] = useState("");
	const [employees, setEmployees] = useState<{
		employees: Employee[];
		totalCount: number;
	}>({
		employees: [],
		totalCount: 0,
	});
	const [isLoading, startTransition] = useTransition();
	const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
	const [showFilters, setShowFilters] = useState(false);
	const [showEmployeeDetails, setShowEmployeeDetails] = useState<string | null>(
		null,
	);
	const [activeTab, setActiveTab] = useState("info");
	const [showResetPassword, setShowResetPassword] = useState(false);
	const [resetPasswordEmployee, setResetPasswordEmployee] =
		useState<Employee | null>(null);

	const itemsPerPage = 5;

	// Simuliere Ladezeit
	useEffect(() => {
		const getEmployees = async () => {
			startTransition(async () => {
				try {
					const qs = new URLSearchParams({
						page: currentPage.toString(),
						limit: itemsPerPage.toString(),
						search: searchTerm,
						department: departmentFilter,
						status: statusFilter,
						sortBy: sortBy,
						sortDirection: sortDirection,
					});
					const response = await fetch(`/api/employee?${qs.toString()}`);

					const data = await response.json();
					setEmployees({
						employees: data.employees ?? [],
						totalCount: data.totalCount ?? 0,
					});

					setTotalPages(Math.ceil(data.totalCount / itemsPerPage));
				} catch (error) {
					console.error("Fehler beim Laden der Mitarbeiter:", error);
					toast({
						title: "Fehler beim Laden der Mitarbeiter",
						description: "Bitte versuchen Sie es später erneut.",
					});
				}
			});
		};
		getEmployees();
	}, [
		currentPage,
		searchTerm,
		departmentFilter,
		statusFilter,
		sortBy,
		sortDirection,
	]);

	const handleSaveNotes = (employeeId: string) => {
		startTransition(async () => {
			try {
				const res = await secureFetch(`/api/employee/${employeeId}`, {
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						data: {
							notes: notes,
						},
					}),
				});

				if (!res.ok) {
					throw new Error("Fehler beim Speichern der Notizen");
				}
				const data = await res.json();
				setEmployees((prev) => ({
					...prev,
					employees: prev.employees.map((emp) =>
						emp.id === employeeId ? data : emp,
					),
				}));
				toast({
					title: "Notizen gespeichert",
					description: "Die Notizen wurden erfolgreich gespeichert.",
				});
			} catch (error) {
				toast({
					title: "Fehler beim Speichern der Notizen",
					description: "Bitte versuchen Sie es später erneut.",
				});
			}
		});
	};

	// Extrahiere eindeutige Abteilungen für Filter
	const departments = Array.from(
		new Set(employees.employees.map((emp) => emp.department)),
	);

	const handleAddSkill = async (
		e: FormEvent<HTMLFormElement>,
		employeeId: string,
	) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const skill = formData.get("skill") as string;
		const level = formData.get("level") as string;

		try {
			const res = await secureFetch(`/api/employee/${employeeId}/skills`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					skill,
					level,
				}),
			});

			if (!res.ok) {
				throw new Error("Fehler beim Hinzufügen der Fähigkeit");
			}
			const data = await res.json();
			setEmployees((prev) => ({
				...prev,
				employees: prev.employees.map((emp) =>
					emp.id === employeeId
						? {
								...emp,
								skills: [...emp.skills, data.newSkill],
							}
						: emp,
				),
			}));
			toast({
				title: "Fähigkeit hinzugefügt",
				description: "Die Fähigkeit wurde erfolgreich hinzugefügt.",
			});
		} catch (error) {
			toast({
				title: "Fehler beim Hinzufügen der Fähigkeit",
				description: "Bitte versuchen Sie es später erneut.",
			});
		}
	};

	// Alle Mitarbeiter auswählen/abwählen
	const toggleSelectAll = () => {
		if (selectedEmployees.length === employees.employees.length) {
			setSelectedEmployees([]);
		} else {
			setSelectedEmployees(employees.employees.map((emp) => emp.id));
		}
	};

	// Einzelnen Mitarbeiter auswählen/abwählen
	const toggleSelectEmployee = (id: string) => {
		if (selectedEmployees.includes(id)) {
			setSelectedEmployees(selectedEmployees.filter((empId) => empId !== id));
		} else {
			setSelectedEmployees([...selectedEmployees, id]);
		}
	};

	// Sortierrichtung umschalten
	const toggleSort = (column: string) => {
		if (sortBy === column) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortBy(column);
			setSortDirection("asc");
		}
	};

	// CSV Export Funktion
	const exportToCSV = () => {
		const employeesToExport =
			selectedEmployees.length > 0
				? employees.employees.filter((emp) =>
						selectedEmployees.includes(emp.id),
					)
				: employees.employees;

		// Define CSV headers
		const headers = [
			"ID",
			"Name",
			"Email",
			"Rolle",
			"Position",
			"Abteilung",
			"Status",
		];

		// Convert employees to CSV rows
		const csvRows = employeesToExport.map((emp) => [
			emp.id,
			emp.user.name,
			emp.user.email,
			emp.user.role.key,
			emp.position.name,
			emp.department.name,
			emp.status,
		]);

		// Combine headers and rows
		const csvContent = [
			headers.join(","),
			...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
		].join("\n");

		// Create blob and download link
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);

		link.setAttribute("href", url);
		link.setAttribute(
			"download",
			`mitarbeiter_export_${new Date().toISOString().split("T")[0]}.csv`,
		);
		link.style.visibility = "hidden";

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// Status Badge Komponente
	const StatusBadge = ({ status }: { status: EmployeeStatus }) => {
		switch (status) {
			case "active":
				return (
					<Badge className="bg-green-500 hover:bg-green-600 w-fit">Aktiv</Badge>
				);
			case "inactive":
				return (
					<Badge className="bg-red-500 hover:bg-red-600 w-fit">Inaktiv</Badge>
				);
			case "on_leave":
				return (
					<Badge className="bg-yellow-500 hover:bg-yellow-600 w-fit">
						Abwesend
					</Badge>
				);
			default:
				return <Badge className="w-fit">Unbekannt</Badge>;
		}
	};

	// Filter zurücksetzen
	const resetFilters = () => {
		setSearchTerm("");
		setDepartmentFilter("all");
		setStatusFilter("all");
		setSortBy("name");
		setSortDirection("asc");
		setCurrentPage(1);
	};

	// Berechtigungen aktualisieren
	const updateEmployeePermissions = (
		employeeId: string,
		newPermissions: PermissionKey[],
	) => {
		startTransition(async () => {
			try {
				const res = await secureFetch(`/employee/$${employeeId}`, {
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						permissions: newPermissions,
					}),
				});

				if (!res.ok) {
					throw new Error("Fehler beim Aktualisieren der Berechtigungen");
				}
				const data = await res.json();

				setEmployees((prev) => ({
					...prev,
					employees: prev.employees.map((emp) =>
						emp.id === employeeId ? data : emp,
					),
				}));
				toast({
					title: "Berechtigungen aktualisiert",
					description: "Die Berechtigungen wurden erfolgreich aktualisiert.",
				});
			} catch (error) {
				toast({
					title: "Fehler beim Aktualisieren der Berechtigungen",
					description: "Bitte versuchen Sie es später erneut.",
				});
			}
		});
	};

	return (
		<div className="p-6 space-y-6">
			<header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
				<h1 className="text-2xl font-bold">Mitarbeiter:innen</h1>
				<div className="flex flex-col sm:flex-row gap-2">
					<div className="relative w-full sm:w-64">
						<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Suche..."
							className="pl-8"
							value={searchTerm}
							onChange={(e) => {
								setSearchTerm(e.target.value);
								setCurrentPage(1);
							}}
						/>
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="icon"
							onClick={() => setShowFilters(!showFilters)}
							className={showFilters ? "bg-muted" : ""}
						>
							<SlidersHorizontal className="h-4 w-4" />
						</Button>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="icon">
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>Aktionen</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={exportToCSV}>
									<Download className="h-4 w-4 mr-2" />
									Exportieren
								</DropdownMenuItem>
								<DropdownMenuItem onClick={resetFilters}>
									<X className="h-4 w-4 mr-2" />
									Filter zurücksetzen
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Nur anzeigen, wenn der Benutzer die Berechtigung hat, Mitarbeiter zu erstellen */}
						<PermissionGate permissions={["CREATE_EMPLOYEES"]}>
							<Button onClick={() => setShowForm(true)}>
								<Plus className="h-4 w-4 mr-2" />
								Neu
							</Button>
						</PermissionGate>
					</div>
				</div>
			</header>

			{showFilters && (
				<Card className="p-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label
								htmlFor="department-select"
								className="text-sm font-medium mb-1 block"
							>
								Abteilung
							</label>
							<Select
								value={departmentFilter}
								onValueChange={(value) => {
									setDepartmentFilter(value);
									setCurrentPage(1);
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Alle Abteilungen" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Alle Abteilungen</SelectItem>
									{departments.map((dept) => (
										<SelectItem key={dept.id} value={dept.id}>
											{dept.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<label
								htmlFor="status-select"
								className="text-sm font-medium mb-1 block"
							>
								Status
							</label>
							<Select
								value={statusFilter}
								onValueChange={(value) => {
									setStatusFilter(value);
									setCurrentPage(1);
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Alle Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Alle Status</SelectItem>
									<SelectItem value="active">Aktiv</SelectItem>
									<SelectItem value="inactive">Inaktiv</SelectItem>
									<SelectItem value="on_leave">Abwesend</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<label
								htmlFor="sort-select"
								className="text-sm font-medium mb-1 block"
							>
								Sortieren nach
							</label>
							<Select
								value={sortBy}
								onValueChange={(value) => {
									setSortBy(value);
									setCurrentPage(1);
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Sortieren nach" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="name">Name</SelectItem>
									<SelectItem value="department">Abteilung</SelectItem>
									<SelectItem value="joinDate">Eintrittsdatum</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</Card>
			)}

			{showForm ? (
				<EmployeeForm
					employee={
						editEmployee
							? employees.employees.find((e) => e.id === editEmployee)
							: undefined
					}
					onCancel={() => {
						setShowForm(false);
						setEditEmployee(null);
					}}
					onSave={() => {
						setShowForm(false);
						setEditEmployee(null);
					}}
				/>
			) : (
				<>
					<div className="flex justify-between items-center mb-2">
						<div className="text-sm text-muted-foreground">
							{employees.employees.length} Mitarbeiter gefunden
						</div>
						{selectedEmployees.length > 0 && (
							<div className="flex items-center gap-2">
								<span className="text-sm">
									{selectedEmployees.length} ausgewählt
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setSelectedEmployees([])}
								>
									Auswahl aufheben
								</Button>
							</div>
						)}
					</div>

					{isLoading ? (
						// Skeleton Loader
						<div className="space-y-4">
							{Array.from({ length: 3 }).map((_, i) => (
								<Card
									key={`skeleton-${i}-${i + 1}`}
									className="overflow-hidden"
								>
									<CardContent className="p-0">
										<div className="flex flex-col md:flex-row">
											<div className="p-4 flex-1">
												<Skeleton className="h-6 w-32 mb-2" />
												<Skeleton className="h-4 w-24" />
											</div>
											<div className="p-4 flex-1">
												<Skeleton className="h-4 w-40 mb-2" />
												<Skeleton className="h-4 w-32" />
											</div>
											<div className="p-4 flex-1">
												<Skeleton className="h-4 w-24 mb-2" />
												<Skeleton className="h-4 w-36" />
											</div>
											<div className="p-4 flex justify-end items-center gap-2">
												<Skeleton className="h-9 w-24" />
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : employees.employees.length === 0 ? (
						<div className="text-center py-10">
							<div className="text-muted-foreground mb-2">
								Keine Mitarbeiter gefunden
							</div>
							<Button variant="outline" onClick={resetFilters}>
								Filter zurücksetzen
							</Button>
						</div>
					) : (
						<>
							<Card className="overflow-hidden">
								<div className="overflow-x-auto">
									<table className="w-full">
										<thead>
											<tr className="bg-muted/50">
												<th className="w-10 p-2 text-left">
													<div className="flex items-center">
														<input
															type="checkbox"
															checked={
																selectedEmployees.length ===
																	employees.employees.length &&
																employees.employees.length > 0
															}
															onChange={toggleSelectAll}
															className="rounded border-gray-300"
														/>
													</div>
												</th>
												<th className="p-2 text-left font-medium text-sm cursor-pointer">
													<Button
														variant="ghost"
														onClick={() => toggleSort("name")}
														asChild
													>
														<div className="flex items-center">
															Name
															{sortBy === "name" && (
																<ChevronDown
																	className={`h-4 w-4 ml-1 ${
																		sortDirection === "desc" ? "rotate-180" : ""
																	}`}
																/>
															)}
														</div>
													</Button>
												</th>
												<th className="p-2 text-left font-medium text-sm">
													Position
												</th>
												<th className="p-2 text-left font-medium text-sm cursor-pointer hidden md:table-cell">
													<Button
														variant="ghost"
														asChild
														onClick={() => toggleSort("department")}
													>
														<div className="flex items-center">
															Abteilung
															{sortBy === "department" && (
																<ChevronDown
																	className={`h-4 w-4 ml-1 ${
																		sortDirection === "desc" ? "rotate-180" : ""
																	}`}
																/>
															)}
														</div>
													</Button>
												</th>
												<th className="p-2 text-left font-medium text-sm hidden md:table-cell">
													Kontakt
												</th>
												<th className="p-2 text-left font-medium text-sm">
													Status
												</th>
												<th className="p-2 text-left font-medium text-sm cursor-pointer hidden lg:table-cell">
													<Button
														variant="ghost"
														asChild
														onClick={() => toggleSort("joinDate")}
													>
														<div className="flex items-center">
															Eintrittsdatum
															{sortBy === "joinDate" && (
																<ChevronDown
																	className={`h-4 w-4 ml-1 ${
																		sortDirection === "desc" ? "rotate-180" : ""
																	}`}
																/>
															)}
														</div>
													</Button>
												</th>
												<th className="p-2 text-right font-medium text-sm">
													Aktionen
												</th>
											</tr>
										</thead>
										<tbody>
											{employees.employees.map((employee) => (
												<tr
													key={employee.id}
													className="border-b hover:bg-muted/50"
												>
													<td className="p-2">
														<input
															type="checkbox"
															checked={selectedEmployees.includes(employee.id)}
															onChange={() => toggleSelectEmployee(employee.id)}
															className="rounded border-gray-300"
														/>
													</td>
													<td className="p-2">
														<div className="font-medium">
															{employee.user.name}
														</div>
														<div className="text-xs text-muted-foreground">
															ID: {employee.userId}
														</div>
													</td>
													<td className="p-2">
														{employee.position?.name || "N/A"}
													</td>
													<td className="p-2 hidden md:table-cell">
														{employee.department?.name || "N/A"}
													</td>
													<td className="p-2 hidden md:table-cell">
														<div className="flex flex-col">
															<div className="flex items-center text-xs">
																<Mail className="h-3 w-3 mr-1" />
																<span className="truncate max-w-[150px]">
																	{employee.user.email}
																</span>
															</div>
															<div className="flex items-center text-xs mt-1">
																<Phone className="h-3 w-3 mr-1" />
																<span>{employee.phone}</span>
															</div>
														</div>
													</td>
													<td className="p-2">
														<StatusBadge status={employee.status || "active"} />
													</td>
													<td className="p-2 hidden lg:table-cell">
														{employee.createdAt
															? new Date(employee.createdAt).toLocaleDateString(
																	"de-DE",
																)
															: "N/A"}
													</td>
													<td className="p-2 text-right">
														<div className="flex justify-end gap-2">
															<TooltipProvider>
																<Tooltip>
																	<TooltipTrigger asChild>
																		<Button
																			variant="ghost"
																			size="icon"
																			onClick={() => {
																				setShowEmployeeDetails(employee.id);
																				setActiveTab("info"); // Standardmäßig Info-Tab anzeigen
																			}}
																		>
																			<User className="h-4 w-4" />
																		</Button>
																	</TooltipTrigger>
																	<TooltipContent>
																		<p>Details anzeigen</p>
																	</TooltipContent>
																</Tooltip>
															</TooltipProvider>

															{/* Berechtigungen-Button nur anzeigen, wenn der Benutzer die Berechtigung hat */}
															<PermissionGate
																permissions={["MANAGE_PERMISSIONS"]}
															>
																<TooltipProvider>
																	<Tooltip>
																		<TooltipTrigger asChild>
																			<Button
																				variant="ghost"
																				size="icon"
																				onClick={() => {
																					setShowEmployeeDetails(employee.id);
																					setActiveTab("permissions"); // Direkt zum Berechtigungen-Tab wechseln
																				}}
																			>
																				<Shield className="h-4 w-4" />
																			</Button>
																		</TooltipTrigger>
																		<TooltipContent>
																			<p>Berechtigungen verwalten</p>
																		</TooltipContent>
																	</Tooltip>
																</TooltipProvider>
															</PermissionGate>

															<DropdownMenu>
																<DropdownMenuTrigger asChild>
																	<Button variant="ghost" size="icon">
																		<MoreHorizontal className="h-4 w-4" />
																	</Button>
																</DropdownMenuTrigger>
																<DropdownMenuContent align="end">
																	{/* Bearbeiten-Option nur anzeigen, wenn der Benutzer die Berechtigung hat */}
																	<PermissionGate
																		permissions={["EDIT_EMPLOYEES"]}
																		fallback={
																			<DropdownMenuItem
																				disabled
																				className="text-muted-foreground"
																			>
																				<UserCog className="h-4 w-4 mr-2" />
																				Bearbeiten (keine Berechtigung)
																			</DropdownMenuItem>
																		}
																	>
																		<DropdownMenuItem
																			onClick={() => {
																				setEditEmployee(employee.id);
																				setShowForm(true);
																			}}
																		>
																			<UserCog className="h-4 w-4 mr-2" />
																			Bearbeiten
																		</DropdownMenuItem>
																	</PermissionGate>

																	<DropdownMenuItem>
																		<FileText className="h-4 w-4 mr-2" />
																		Dokumente
																	</DropdownMenuItem>
																	<DropdownMenuSeparator />
																	<PermissionGate
																		permissions={["MANAGE_PERMISSIONS"]}
																	>
																		<DropdownMenuItem
																			onClick={() => {
																				setResetPasswordEmployee(employee);
																				setShowResetPassword(true);
																			}}
																		>
																			<Lock className="h-4 w-4 mr-2" />
																			Passwort zurücksetzen
																		</DropdownMenuItem>
																	</PermissionGate>

																	{/* Status-Änderung nur anzeigen, wenn der Benutzer die Berechtigung hat */}
																	<PermissionGate
																		permissions={["EDIT_EMPLOYEES"]}
																		fallback={
																			<DropdownMenuItem
																				disabled
																				className="text-muted-foreground"
																			>
																				{employee.status === "active" ? (
																					<>
																						<X className="h-4 w-4 mr-2" />
																						Deaktivieren (keine Berechtigung)
																					</>
																				) : (
																					<>
																						<Check className="h-4 w-4 mr-2" />
																						Aktivieren (keine Berechtigung)
																					</>
																				)}
																			</DropdownMenuItem>
																		}
																	>
																		<DropdownMenuItem
																			className={
																				employee.status === "active"
																					? "text-red-600"
																					: "text-green-600"
																			}
																		>
																			{employee.status === "active" ? (
																				<>
																					<X className="h-4 w-4 mr-2" />
																					Deaktivieren
																				</>
																			) : (
																				<>
																					<Check className="h-4 w-4 mr-2" />
																					Aktivieren
																				</>
																			)}
																		</DropdownMenuItem>
																	</PermissionGate>
																</DropdownMenuContent>
															</DropdownMenu>
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</Card>

							{/* Paginierung */}
							{totalPages > 1 && (
								<Pagination className="mt-4">
									<PaginationContent>
										<PaginationItem>
											<PaginationPrevious
												href="#"
												onClick={(e) => {
													e.preventDefault();
													if (currentPage > 1) setCurrentPage(currentPage - 1);
												}}
												className={
													currentPage === 1
														? "pointer-events-none opacity-50"
														: ""
												}
											/>
										</PaginationItem>

										{Array.from({ length: totalPages }).map((_, i) => {
											const page = i + 1;
											// Zeige nur bestimmte Seiten an, um die Paginierung übersichtlich zu halten
											if (
												page === 1 ||
												page === totalPages ||
												(page >= currentPage - 1 && page <= currentPage + 1)
											) {
												return (
													<PaginationItem key={page}>
														<PaginationLink
															href="#"
															onClick={(e) => {
																e.preventDefault();
																setCurrentPage(page);
															}}
															isActive={page === currentPage}
														>
															{page}
														</PaginationLink>
													</PaginationItem>
												);
											}
											if (
												(page === currentPage - 2 && currentPage > 3) ||
												(page === currentPage + 2 &&
													currentPage < totalPages - 2)
											) {
												return (
													<PaginationItem key={page}>
														<PaginationEllipsis />
													</PaginationItem>
												);
											}
											return null;
										})}

										<PaginationItem>
											<PaginationNext
												href="#"
												onClick={(e) => {
													e.preventDefault();
													if (currentPage < totalPages)
														setCurrentPage(currentPage + 1);
												}}
												className={
													currentPage === totalPages
														? "pointer-events-none opacity-50"
														: ""
												}
											/>
										</PaginationItem>
									</PaginationContent>
								</Pagination>
							)}
						</>
					)}
				</>
			)}

			{/* Mitarbeiter-Details Dialog */}
			<Dialog
				open={showEmployeeDetails !== null}
				onOpenChange={(open) => {
					if (!open) setShowEmployeeDetails(null);
				}}
			>
				{showEmployeeDetails !== null && (
					<DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto p-0">
						{(() => {
							const employee = employees.employees.find(
								(e) => e.id === showEmployeeDetails,
							);
							if (!employee) return null;

							return (
								<Tabs
									defaultValue={activeTab}
									value={activeTab}
									onValueChange={setActiveTab}
									className="w-full"
								>
									{/* Header mit Basisinformationen */}
									<div className="sticky top-0 z-10 bg-background p-4 sm:p-6 border-b">
										<DialogHeader className="mb-4">
											<div className="flex flex-col sm:flex-row items-center gap-4">
												<div className="relative group mx-auto sm:mx-0">
													<div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
														{employee.user.avatar ? (
															<img
																src={employee.user.avatar || "/placeholder.svg"}
																alt={employee.user.name}
																className="h-full w-full object-cover"
															/>
														) : (
															<User className="h-10 w-10 text-muted-foreground" />
														)}
													</div>
													<PermissionGate permissions={["EDIT_EMPLOYEES"]}>
														<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8 text-white"
															>
																<Upload className="h-4 w-4" />
															</Button>
														</div>
													</PermissionGate>
												</div>
												<div className="flex-1 text-center sm:text-left">
													<DialogTitle className="text-xl mb-1">
														{employee.user.name}
													</DialogTitle>
													<div className="flex flwx-wrap items-center sm:items-center gap-2 text-muted-foreground justify-center sm:justify-start">
														<p>{employee.position?.name || "N/A"}</p>
														<span className="hidden sm:inline">•</span>
														<p>{employee.department?.name || "N/A"}</p>
														<StatusBadge status={employee.status || "active"} />
													</div>
													<DialogDescription className="mt-1">
														ID: {employee.userId} | Seit{" "}
														{calculateEmploymentDuration(
															new Date(employee.createdAt).toISOString(),
														)}
													</DialogDescription>
												</div>
												<div className="flex flex-row sm:flex-col gap-2 justify-center w-full sm:w-auto sm:self-start mt-2 sm:mt-0">
													<PermissionGate permissions={["EDIT_EMPLOYEES"]}>
														<Button
															variant="outline"
															size="sm"
															className="flex items-center gap-2 flex-1 sm:flex-auto justify-center"
															onClick={() => {
																setShowEmployeeDetails(null);
																setEditEmployee(employee.id);
																setShowForm(true);
															}}
														>
															<UserCog className="h-4 w-4" />
															<span>Bearbeiten</span>
														</Button>
													</PermissionGate>
													<PermissionGate permissions={["EDIT_EMPLOYEES"]}>
														<Button
															variant={
																employee.status === "active"
																	? "destructive"
																	: "default"
															}
															size="sm"
															className="flex items-center gap-2 flex-1 sm:flex-auto justify-center"
														>
															{employee.status === "active" ? (
																<>
																	<X className="h-4 w-4" />
																	<span>Deaktivieren</span>
																</>
															) : (
																<>
																	<Check className="h-4 w-4" />
																	<span>Aktivieren</span>
																</>
															)}
														</Button>
													</PermissionGate>
												</div>
											</div>
										</DialogHeader>

										<TabsList className="flex flex-wrap h-auto gap-2 justify-start w-full">
											<TabsTrigger value="info" className="text-xs sm:text-sm">
												Informationen
											</TabsTrigger>
											<PermissionGate permissions={["MANAGE_PERMISSIONS"]}>
												<TabsTrigger
													value="permissions"
													className="text-xs sm:text-sm"
												>
													Berechtigungen
												</TabsTrigger>
											</PermissionGate>
											<TabsTrigger
												value="activity"
												className="text-xs sm:text-sm"
											>
												Aktivität
											</TabsTrigger>
											<TabsTrigger
												value="documents"
												className="text-xs sm:text-sm"
											>
												Dokumente
											</TabsTrigger>
											<TabsTrigger
												value="schedule"
												className="text-xs sm:text-sm"
											>
												Zeitplan
											</TabsTrigger>
										</TabsList>
									</div>

									<div className="p-4 sm:p-6">
										{/* Statistik-Kacheln */}
										<div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4 mb-6">
											<Card>
												<CardContent className="p-3 sm:p-4 flex flex-wrap flex-col items-center justify-center text-center">
													<Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mb-1 sm:mb-2" />
													<p className="text-xs sm:text-sm text-muted-foreground">
														Beschäftigungsdauer
													</p>
													<p className="font-medium text-sm sm:text-base">
														{calculateEmploymentDuration(
															new Date(employee.createdAt).toISOString() || "",
														)}
													</p>
												</CardContent>
											</Card>
											<Card>
												<CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center">
													<FileText className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mb-1 sm:mb-2" />
													<p className="text-xs sm:text-sm text-muted-foreground">
														Dokumente
													</p>
													<p className="font-medium text-sm sm:text-base">
														{employee.documents.length}
													</p>
												</CardContent>
											</Card>
											<Card>
												<CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center">
													<Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 mb-1 sm:mb-2" />
													<p className="text-xs sm:text-sm text-muted-foreground">
														Urlaubstage
													</p>
													<p className="font-medium text-sm sm:text-base">
														{employee.vacationDays || 0} / 25
													</p>
												</CardContent>
											</Card>
											<Card>
												<CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center">
													<Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 mb-1 sm:mb-2" />
													<p className="text-xs sm:text-sm text-muted-foreground">
														Team
													</p>
													<p className="font-medium text-sm sm:text-base truncate max-w-full">
														{employee.department?.name || "N/A"}
													</p>
												</CardContent>
											</Card>
										</div>

										{/* Tab-Inhalte */}
										<TabsContent value="info" className="space-y-4 mt-0">
											<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
												{/* Kontaktinformationen */}
												<Card>
													<CardHeader className="pb-2">
														<div className="flex justify-between items-center flex-wrap gap-2">
															<CardTitle className="text-base">
																Kontaktinformationen
															</CardTitle>
															<PermissionGate permissions={["EDIT_EMPLOYEES"]}>
																<Button
																	variant="ghost"
																	size="sm"
																	className="h-8"
																>
																	<Pencil className="h-3.5 w-3.5 mr-1 sm:mr-2" />
																	<span className="text-xs sm:text-sm">
																		Bearbeiten
																	</span>
																</Button>
															</PermissionGate>
														</div>
													</CardHeader>
													<CardContent className="space-y-3">
														<div className="flex items-center text-xs sm:text-sm">
															<Mail className="h-4 w-4 mr-2 sm:mr-3 text-muted-foreground flex-shrink-0" />
															<span className="flex-1 truncate">
																{employee.user.email}
															</span>
															<Button
																variant="ghost"
																size="icon"
																className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
															>
																<Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
															</Button>
														</div>
														<div className="flex items-center text-xs sm:text-sm">
															<Phone className="h-4 w-4 mr-2 sm:mr-3 text-muted-foreground flex-shrink-0" />
															<span className="flex-1">{employee.phone}</span>
															<Button
																variant="ghost"
																size="icon"
																className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
															>
																<Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
															</Button>
														</div>
														<div className="flex items-start text-xs sm:text-sm">
															<MapPin className="h-4 w-4 mr-2 sm:mr-3 text-muted-foreground mt-0.5 flex-shrink-0" />
															<span className="break-words">
																{`${employee.street}, ${employee.city}`}
															</span>
														</div>
														<div className="flex items-center text-xs sm:text-sm">
															<AtSign className="h-4 w-4 mr-2 sm:mr-3 text-muted-foreground flex-shrink-0" />
															<span>@{employee.user.username}</span>
														</div>
													</CardContent>
												</Card>

												{/* Beschäftigungsinformationen */}
												<Card>
													<CardHeader className="pb-2">
														<div className="flex justify-between items-center flex-wrap gap-2">
															<CardTitle className="text-base">
																Beschäftigungsinformationen
															</CardTitle>
															{/* <PermissionGate permissions={["EDIT_EMPLOYEES"]}> */}
															<Button variant="ghost" size="sm" className="h-8">
																<Pencil className="h-3.5 w-3.5 mr-1 sm:mr-2" />
																<span className="text-xs sm:text-sm">
																	Bearbeiten
																</span>
															</Button>
															{/* </PermissionGate> */}
														</div>
													</CardHeader>
													<CardContent className="space-y-3">
														<div className="flex items-center text-xs sm:text-sm">
															<Briefcase className="h-4 w-4 mr-2 sm:mr-3 text-muted-foreground flex-shrink-0" />
															<span>
																Position: {employee.position?.name || "N/A"}
															</span>
														</div>
														<div className="flex items-center text-xs sm:text-sm">
															<Users className="h-4 w-4 mr-2 sm:mr-3 text-muted-foreground flex-shrink-0" />
															<span>
																Abteilung: {employee.department?.name || "N/A"}
															</span>
														</div>
														<div className="flex items-center text-xs sm:text-sm">
															<Calendar className="h-4 w-4 mr-2 sm:mr-3 text-muted-foreground flex-shrink-0" />
															<span>
																Eingetreten am:{" "}
																{employee.createdAt
																	? new Date(
																			employee.createdAt,
																		).toLocaleDateString("de-DE")
																	: "N/A"}
															</span>
														</div>
														<div className="flex items-center text-xs sm:text-sm">
															<Clock className="h-4 w-4 mr-2 sm:mr-3 text-muted-foreground flex-shrink-0" />
															<span>
																Beschäftigungsdauer:{" "}
																{calculateEmploymentDuration(
																	new Date(employee.createdAt).toISOString(),
																)}
															</span>
														</div>
													</CardContent>
												</Card>

												{/* Notizen */}
												<Card className="md:col-span-2">
													<CardHeader className="pb-2">
														<CardTitle className="text-base">Notizen</CardTitle>
													</CardHeader>
													<CardContent>
														<Textarea
															placeholder="Notizen zu diesem Mitarbeiter hinzufügen..."
															className="min-h-[80px] sm:min-h-[100px] text-sm"
															defaultValue={employee.notes || ""}
															onChange={(e) => {
																setNotes(e.target.value);
															}}
															//TODO: Add read only permission
															// readOnly={
															// 	!employee.permissions.some(
															// 		(per) => per.key === "EDIT_EMPLOYEES",
															// 	)
															// }
														/>
														<PermissionGate permissions={["EDIT_EMPLOYEES"]}>
															<div className="flex justify-end mt-2">
																<Button
																	size="sm"
																	onClick={() => {
																		handleSaveNotes(employee.id);
																	}}
																>
																	Speichern
																</Button>
															</div>
														</PermissionGate>
													</CardContent>
												</Card>

												{/* Qualifikationen */}
												<Card className="md:col-span-2">
													<CardHeader className="pb-2">
														<div className="flex justify-between items-center flex-wrap gap-2">
															<CardTitle className="text-base">
																Qualifikationen & Fähigkeiten
															</CardTitle>
															<PermissionGate permissions={["EDIT_EMPLOYEES"]}>
																<Dialog>
																	<DialogTrigger asChild>
																		<Button
																			variant="outline"
																			size="sm"
																			className="h-8"
																		>
																			<Plus className="h-3.5 w-3.5 mr-1 sm:mr-2" />
																			<span className="text-xs sm:text-sm">
																				Hinzufügen
																			</span>
																		</Button>
																	</DialogTrigger>
																	<DialogContent>
																		<DialogHeader>
																			<DialogTitle>
																				Qualifikation hinzufügen
																			</DialogTitle>
																		</DialogHeader>

																		<form
																			className="space-y-4"
																			onSubmit={(e) =>
																				handleAddSkill(e, employee.id)
																			}
																		>
																			<div className="space-y-4">
																				<label htmlFor="skill">
																					Vaardigheid
																				</label>
																				<Input
																					type="text"
																					id="skill"
																					name="skill"
																				/>
																			</div>
																			<div className="space-y-4">
																				<label htmlFor="level">Niveau</label>
																				<Input
																					type="number"
																					id="level"
																					name="level"
																					min={1}
																					max={100}
																				/>
																			</div>
																			<Button type="submit">Toevoegen</Button>
																		</form>
																	</DialogContent>
																</Dialog>
															</PermissionGate>
														</div>
													</CardHeader>
													<CardContent>
														<div className="space-y-2">
															{employee.skills ? (
																employee.skills.map((skill) => (
																	<div key={skill.id} className="space-y-1">
																		<div className="flex justify-between items-center">
																			<span className="text-xs sm:text-sm">
																				{skill.name}
																			</span>
																			<span className="text-xs sm:text-sm text-muted-foreground">
																				{skill.level}%
																			</span>
																		</div>
																		<div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
																			<div
																				className="h-full bg-blue-500 rounded-full"
																				style={{ width: `${skill.level}%` }}
																			/>
																		</div>
																	</div>
																))
															) : (
																<p className="text-xs sm:text-sm text-muted-foreground">
																	Keine Fähigkeiten hinzugefügt
																</p>
															)}
														</div>
													</CardContent>
												</Card>
											</div>
										</TabsContent>

										{/* Berechtigungen Tab */}
										<TabsContent value="permissions" className="mt-0">
											<PermissionGate permissions={["MANAGE_PERMISSIONS"]}>
												<PermissionManager
													userId={employee.id}
													userName={employee.user.name}
													initialPermissions={employee.permissions.map(
														(per) => per.key,
													)}
													onSave={(newPermissions) =>
														updateEmployeePermissions(
															employee.id,
															newPermissions,
														)
													}
												/>
											</PermissionGate>
										</TabsContent>

										{/* Aktivität Tab */}
										<TabsContent value="activity" className="mt-0">
											<Card>
												<CardHeader className="pb-2">
													<div className="flex flex-wrap gap-1 justify-between items-center">
														<div>
															<CardTitle className="text-base">
																Aktivitätsprotokoll
															</CardTitle>
															<CardDescription>
																Letzte Aktivitäten und Systeminteraktionen
															</CardDescription>
														</div>
														<div className="flex items-center gap-2">
															<Select defaultValue="all">
																<SelectTrigger className="w-[150px]">
																	<SelectValue placeholder="Aktivitätstyp" />
																</SelectTrigger>
																<SelectContent>
																	<SelectItem value="all">
																		Alle Aktivitäten
																	</SelectItem>
																	<SelectItem value="login">
																		Anmeldungen
																	</SelectItem>
																	<SelectItem value="document">
																		Dokumente
																	</SelectItem>
																	<SelectItem value="customer">
																		Kunden
																	</SelectItem>
																	<SelectItem value="system">System</SelectItem>
																</SelectContent>
															</Select>
															<Button variant="outline" size="icon">
																<RefreshCw className="h-4 w-4" />
															</Button>
														</div>
													</div>
												</CardHeader>
												<CardContent>
													<div className="space-y-4">
														{[
															{
																date: "2023-05-02T14:30:00",
																action: "Anmeldung im System",
																icon: LogIn,
																type: "login",
															},
															{
																date: "2023-05-02T11:15:00",
																action: "Rechnung #1234 erstellt",
																icon: FileText,
																type: "document",
															},
															{
																date: "2023-05-01T16:45:00",
																action:
																	"Kundendaten aktualisiert: Mustermann GmbH",
																icon: UserCog,
																type: "customer",
															},
															{
																date: "2023-04-30T09:20:00",
																action: "Angebot #5678 erstellt",
																icon: FileText,
																type: "document",
															},
															{
																date: "2023-04-29T13:10:00",
																action: "Passwort geändert",
																icon: Lock,
																type: "system",
															},
														].map((activity, index) => (
															<div
																key={`${index}-${index + 1}`}
																className="flex items-start"
															>
																<div className="mr-3 mt-0.5">
																	<div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
																		<activity.icon className="h-4 w-4 text-muted-foreground" />
																	</div>
																</div>
																<div className="flex-1">
																	<p className="text-sm">{activity.action}</p>
																	<p className="text-xs text-muted-foreground">
																		{new Date(activity.date).toLocaleString(
																			"de-DE",
																		)}
																	</p>
																</div>
																<Badge variant="outline" className="ml-2">
																	{activity.type}
																</Badge>
															</div>
														))}
													</div>
													<div className="flex justify-center mt-4">
														<Button variant="outline" size="sm">
															Mehr anzeigen
														</Button>
													</div>
												</CardContent>
											</Card>
										</TabsContent>

										{/* Dokumente Tab */}
										<TabsContent value="documents" className="mt-0">
											<Card>
												<CardHeader className="pb-2">
													<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
														<div>
															<CardTitle className="text-base">
																Dokumente
															</CardTitle>
															<CardDescription>
																Mitarbeiterbezogene Dokumente und Dateien
															</CardDescription>
														</div>
														<div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
															<Select defaultValue="all">
																<SelectTrigger className="w-full sm:w-[150px]">
																	<SelectValue placeholder="Dokumententyp" />
																</SelectTrigger>
																<SelectContent>
																	<SelectItem value="all">
																		Alle Dokumente
																	</SelectItem>
																	<SelectItem value="contract">
																		Verträge
																	</SelectItem>
																	<SelectItem value="payroll">
																		Gehaltsabrechnungen
																	</SelectItem>
																	<SelectItem value="certificate">
																		Zertifikate
																	</SelectItem>
																	<SelectItem value="other">
																		Sonstige
																	</SelectItem>
																</SelectContent>
															</Select>
															<PermissionGate permissions={["EDIT_EMPLOYEES"]}>
																<Button className="w-full sm:w-auto">
																	<Upload className="h-4 w-4 mr-2" />
																	<span className="text-xs sm:text-sm">
																		Dokument hochladen
																	</span>
																</Button>
															</PermissionGate>
														</div>
													</div>
												</CardHeader>
												<CardContent>
													<div className="space-y-2">
														{[
															{
																name: "Arbeitsvertrag.pdf",
																type: "contract",
																size: "1.2 MB",
																date: "2022-01-15",
															},
															{
																name: "Gehaltsabrechnung_April.pdf",
																type: "payroll",
																size: "0.8 MB",
																date: "2023-05-01",
															},
															{
																name: "Mitarbeiterausweis.jpg",
																type: "other",
																size: "2.4 MB",
																date: "2022-01-20",
															},
															{
																name: "Schulungszertifikat.pdf",
																type: "certificate",
																size: "1.5 MB",
																date: "2022-06-10",
															},
														].map((doc, index) => (
															<div
																key={`${index}-${index + 1}`}
																className="flex flex-wrap items-center p-2 hover:bg-muted rounded-md"
															>
																<div className="mr-2 sm:mr-3">
																	<FileIcon className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />
																</div>
																<div className="flex-1 min-w-0 mr-2">
																	<p className="text-xs sm:text-sm font-medium truncate">
																		{doc.name}
																	</p>
																	<div className="flex flex-wrap text-xs text-muted-foreground">
																		<span>{doc.size}</span>
																		<span className="mx-1 sm:mx-2">•</span>
																		<span>
																			{new Date(doc.date).toLocaleDateString(
																				"de-DE",
																			)}
																		</span>
																	</div>
																</div>
																<Badge
																	variant="outline"
																	className="mr-2 mb-1 sm:mb-0 text-xs"
																>
																	{doc.type}
																</Badge>
																<div className="flex gap-1 ml-auto">
																	<Button
																		variant="ghost"
																		size="icon"
																		className="h-7 w-7 sm:h-8 sm:w-8"
																	>
																		<Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
																	</Button>
																	<Button
																		variant="ghost"
																		size="icon"
																		className="h-7 w-7 sm:h-8 sm:w-8"
																	>
																		<Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
																	</Button>
																	<PermissionGate
																		permissions={["EDIT_EMPLOYEES"]}
																	>
																		<Button
																			variant="ghost"
																			size="icon"
																			className="h-7 w-7 sm:h-8 sm:w-8"
																		>
																			<Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
																		</Button>
																	</PermissionGate>
																</div>
															</div>
														))}
													</div>
												</CardContent>
											</Card>
										</TabsContent>

										{/* Zeitplan Tab */}
										<TabsContent value="schedule" className="mt-0">
											<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
												{/* Arbeitszeiten */}
												<Card className="md:col-span-2">
													<CardHeader className="pb-2">
														<div className="flex justify-between items-center flex-wrap gap-2">
															<CardTitle className="text-base">
																Arbeitszeiten
															</CardTitle>
															<PermissionGate permissions={["EDIT_EMPLOYEES"]}>
																<Button
																	variant="outline"
																	size="sm"
																	className="h-8"
																>
																	<Pencil className="h-3.5 w-3.5 mr-1 sm:mr-2" />
																	<span className="text-xs sm:text-sm">
																		Bearbeiten
																	</span>
																</Button>
															</PermissionGate>
														</div>
													</CardHeader>
													<CardContent>
														<div className="space-y-1 sm:space-y-2">
															{[
																{
																	day: "Montag",
																	hours: "08:00 - 16:30",
																	status: "regular",
																},
																{
																	day: "Dienstag",
																	hours: "08:00 - 16:30",
																	status: "regular",
																},
																{
																	day: "Mittwoch",
																	hours: "08:00 - 16:30",
																	status: "regular",
																},
																{
																	day: "Donnerstag",
																	hours: "08:00 - 16:30",
																	status: "regular",
																},
																{
																	day: "Freitag",
																	hours: "08:00 - 14:00",
																	status: "short",
																},
																{
																	day: "Samstag",
																	hours: "Nicht geplant",
																	status: "off",
																},
																{
																	day: "Sonntag",
																	hours: "Nicht geplant",
																	status: "off",
																},
															].map((schedule, index) => (
																<div
																	key={`${index}-${index + 1}`}
																	className="flex items-center p-1 sm:p-2 rounded-md"
																>
																	<div className="w-24 sm:w-32 text-xs sm:text-sm font-medium">
																		{schedule.day}
																	</div>
																	<div className="flex-1 text-xs sm:text-sm">
																		{schedule.status === "off" ? (
																			<span className="text-muted-foreground">
																				{schedule.hours}
																			</span>
																		) : (
																			<span>{schedule.hours}</span>
																		)}
																	</div>
																	<div>
																		{schedule.status === "regular" && (
																			<Badge
																				variant="outline"
																				className="bg-blue-50 text-xs"
																			>
																				Regulär
																			</Badge>
																		)}
																		{schedule.status === "short" && (
																			<Badge
																				variant="outline"
																				className="bg-green-50 text-xs"
																			>
																				Verkürzt
																			</Badge>
																		)}
																		{schedule.status === "off" && (
																			<Badge
																				variant="outline"
																				className="bg-gray-50 text-xs"
																			>
																				Frei
																			</Badge>
																		)}
																	</div>
																</div>
															))}
														</div>
													</CardContent>
												</Card>

												{/* Urlaub */}
												<Card>
													<CardHeader className="pb-2">
														<CardTitle className="text-base">
															Urlaubsübersicht
														</CardTitle>
													</CardHeader>
													<CardContent>
														<div className="space-y-4">
															<div className="flex items-center justify-between">
																<span className="text-sm font-medium">
																	Urlaubstage gesamt
																</span>
																<span className="font-medium">25 Tage</span>
															</div>
															<div className="flex items-center justify-between">
																<span className="text-sm font-medium">
																	Genommen
																</span>
																<span className="font-medium">10 Tage</span>
															</div>
															<div className="flex items-center justify-between">
																<span className="text-sm font-medium">
																	Verbleibend
																</span>
																<span className="font-medium">15 Tage</span>
															</div>
															<div className="h-2 bg-muted rounded-full overflow-hidden">
																<div
																	className="h-full bg-green-500 rounded-full"
																	style={{ width: "40%" }}
																/>
															</div>
															<PermissionGate permissions={["EDIT_EMPLOYEES"]}>
																<div className="pt-2">
																	<Button
																		variant="outline"
																		size="sm"
																		className="w-full"
																	>
																		<CalendarPlus className="h-4 w-4 mr-2" />
																		Urlaub beantragen
																	</Button>
																</div>
															</PermissionGate>
														</div>
													</CardContent>
												</Card>

												{/* Nächste Abwesenheiten */}
												<Card className="md:col-span-3">
													<CardHeader className="pb-2">
														<CardTitle className="text-base">
															Geplante Abwesenheiten
														</CardTitle>
													</CardHeader>
													<CardContent>
														<div className="space-y-2">
															{[
																{
																	type: "Urlaub",
																	start: "2023-06-15",
																	end: "2023-06-22",
																	status: "approved",
																},
																{
																	type: "Krankheit",
																	start: "2023-04-03",
																	end: "2023-04-05",
																	status: "completed",
																},
																{
																	type: "Fortbildung",
																	start: "2023-07-10",
																	end: "2023-07-12",
																	status: "pending",
																},
															].map((absence, index) => (
																<div
																	key={`${index}-${index + 1}`}
																	className="flex items-center p-2 hover:bg-muted rounded-md"
																>
																	<div className="mr-3">
																		{absence.type === "Urlaub" && (
																			<Palmtree className="h-5 w-5 text-green-500" />
																		)}
																		{absence.type === "Krankheit" && (
																			<Stethoscope className="h-5 w-5 text-red-500" />
																		)}
																		{absence.type === "Fortbildung" && (
																			<GraduationCap className="h-5 w-5 text-blue-500" />
																		)}
																	</div>
																	<div className="flex-1">
																		<p className="text-sm font-medium">
																			{absence.type}
																		</p>
																		<p className="text-xs text-muted-foreground">
																			{new Date(
																				absence.start,
																			).toLocaleDateString("de-DE")}{" "}
																			bis{" "}
																			{new Date(absence.end).toLocaleDateString(
																				"de-DE",
																			)}
																		</p>
																	</div>
																	<div>
																		{absence.status === "approved" && (
																			<Badge className="bg-green-500">
																				Genehmigt
																			</Badge>
																		)}
																		{absence.status === "pending" && (
																			<Badge className="bg-yellow-500">
																				Ausstehend
																			</Badge>
																		)}
																		{absence.status === "completed" && (
																			<Badge variant="outline">
																				Abgeschlossen
																			</Badge>
																		)}
																	</div>
																</div>
															))}
														</div>
													</CardContent>
												</Card>
											</div>
										</TabsContent>
									</div>

									<div className="sticky bottom-0 z-10 bg-background p-4 border-t flex justify-end">
										<Button
											variant="outline"
											onClick={() => setShowEmployeeDetails(null)}
										>
											Schließen
										</Button>
									</div>
								</Tabs>
							);
						})()}
					</DialogContent>
				)}
			</Dialog>
			{/* Passwort-Zurücksetzen-Dialog */}
			{resetPasswordEmployee && (
				<ResetPasswordDialog
					open={showResetPassword}
					onOpenChange={setShowResetPassword}
					employeeId={resetPasswordEmployee.id}
					employeeName={resetPasswordEmployee.user.name}
					userId={resetPasswordEmployee.user.id}
				/>
			)}
		</div>
	);
}
