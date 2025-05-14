"use client";

import { AuthGuard } from "@/components/auth-guard";
import CustomerForm from "@/components/customer-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import type { Customer } from "@prisma/client";
import {
	Building,
	ChevronDown,
	Download,
	FileText,
	Filter,
	Mail,
	MapPin,
	Phone,
	Plus,
	Search,
	SlidersHorizontal,
	User,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";

export default function KundenPage() {
	const [showForm, setShowForm] = useState(false);
	const [editCustomer, setEditCustomer] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortField, setSortField] = useState("name");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
	const [currentPage, setCurrentPage] = useState(1);
	const [customers, setCustomers] = useState<{
		customers: Customer[];
		total: number;
	}>({ customers: [], total: 0 });
	const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
	const [isLoading, startTransition] = useTransition();
	const [filters, setFilters] = useState({
		type: "all",
		status: "all",
	});

	const itemsPerPage = 5;

	useEffect(() => {
		const getCustomers = () => {
			startTransition(async () => {
				try {
					const params = new URLSearchParams({
						page: String(currentPage),
						limit: String(itemsPerPage),
						search: searchTerm,
						type: filters.type,
						status: filters.status,
						sortField,
						sortDirection,
					});
					const res = await fetch(`/api/customers?${params.toString()}`);
					const data = await res.json();
					setCustomers({
						customers: data.customers,
						total: data.totalCount,
					});
				} catch (error) {
					console.error("Fehler beim Laden der Kunden:", error);
					setCustomers({ customers: [], total: 0 });
				}
			});
		};
		getCustomers();
	}, [
		currentPage,
		sortField,
		sortDirection,
		searchTerm,
		filters.type,
		filters.status,
	]);

	// Paginierung
	const totalPages = Math.ceil(customers.total / itemsPerPage);

	// Sortierrichtung umschalten
	const toggleSort = (field: string) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	// Alle Kunden auswählen/abwählen
	const toggleSelectAll = () => {
		if (selectedCustomers.length === customers.customers.length) {
			setSelectedCustomers([]);
		} else {
			setSelectedCustomers(customers.customers.map((c) => c.id));
		}
	};

	// Einzelnen Kunden auswählen/abwählen
	const toggleSelectCustomer = (id: string) => {
		if (selectedCustomers.includes(id)) {
			setSelectedCustomers(
				selectedCustomers.filter((customerId) => customerId !== id),
			);
		} else {
			setSelectedCustomers([...selectedCustomers, id]);
		}
	};

	// CSV Export Funktion
	const exportToCsv = (selectedCustomerId: string | null = null) => {
		let selected: Customer | undefined;
		let customersToExport = [];

		if (selectedCustomerId) {
			selected = customers.customers.find((c) => c.id === selectedCustomerId);
			customersToExport = [selected];
		} else if (selectedCustomers.length > 0) {
			customersToExport = customers.customers.filter((c) =>
				selectedCustomers.includes(c.id),
			);
		} else {
			customersToExport = customers.customers;
		}

		const headers = [
			"Name",
			"Email",
			"Telefon",
			"Adresse",
			"Typ",
			"Status",
			"Kontaktperson",
			"Letzte Bestellung",
			"Anzahl Bestellungen",
			"Gesamtumsatz",
			"Notizen",
			"Steuer-ID",
		];
		const csvRows = [
			headers.join(","),
			...customersToExport.map((c) =>
				[
					`"${c?.name}"`,
					`"${c?.email}"`,
					`"${c?.phone}"`,
					`"${c?.street}, ${c?.zip} ${c?.city}"`,
					`"${c?.type}"`,
					`"${c?.status}"`,
					`"${c?.contactPerson}"`,
					`"${c?.lastOrder}"`,
					c?.totalOrders,
					c?.totalRevenue,
					`"${c?.notes}"`,
					`"${c?.taxId}"`,
				].join(","),
			),
		];

		const csvString = csvRows.join("\n");
		const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute(
			"download",
			`${selected ? selected.name : "kunden"}_export.csv`,
		);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// Zurücksetzen der Filter
	const resetFilters = () => {
		setFilters({
			type: "all",
			status: "all",
		});
		setSearchTerm("");
	};

	return (
		<AuthGuard requiredPermissions={["VIEW_CUSTOMERS"]}>
			<div className="p-6 space-y-6">
				<header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
					<h1 className="text-2xl font-bold">Kunden</h1>
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

						<Sheet>
							<SheetTrigger asChild>
								<Button variant="outline" size="icon">
									<Filter className="h-4 w-4" />
								</Button>
							</SheetTrigger>
							<SheetContent>
								<SheetHeader>
									<SheetTitle>Filter</SheetTitle>
									<SheetDescription>
										Filtern Sie die Kundenliste nach verschiedenen Kriterien.
									</SheetDescription>
								</SheetHeader>
								<div className="py-4 space-y-4">
									<div className="space-y-2">
										<Label htmlFor="customerType">Kundentyp</Label>
										<Select
											value={filters.type}
											onValueChange={(value) =>
												setFilters({ ...filters, type: value })
											}
										>
											<SelectTrigger id="customerType">
												<SelectValue placeholder="Alle Typen" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">Alle Typen</SelectItem>
												<SelectItem value="BUSINESS">Unternehmen</SelectItem>
												<SelectItem value="INDIVIDUAL">Privatperson</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="customerStatus">Status</Label>
										<Select
											value={filters.status}
											onValueChange={(value) =>
												setFilters({ ...filters, status: value })
											}
										>
											<SelectTrigger id="customerStatus">
												<SelectValue placeholder="Alle Status" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">Alle Status</SelectItem>
												<SelectItem value="ACTIVE">Aktiv</SelectItem>
												<SelectItem value="INACTIVE">Inaktiv</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
								<SheetFooter>
									<SheetClose asChild>
										<Button variant="outline" onClick={resetFilters}>
											Zurücksetzen
										</Button>
									</SheetClose>
									<SheetClose asChild>
										<Button>Anwenden</Button>
									</SheetClose>
								</SheetFooter>
							</SheetContent>
						</Sheet>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="icon">
									<SlidersHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => toggleSort("name")}>
									Nach Name sortieren{" "}
									{sortField === "name" &&
										(sortDirection === "asc" ? "↑" : "↓")}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => toggleSort("lastOrder")}>
									Nach letzter Bestellung sortieren{" "}
									{sortField === "lastOrder" &&
										(sortDirection === "asc" ? "↑" : "↓")}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => toggleSort("totalOrders")}>
									Nach Anzahl Bestellungen sortieren{" "}
									{sortField === "totalOrders" &&
										(sortDirection === "asc" ? "↑" : "↓")}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => toggleSort("totalRevenue")}>
									Nach Umsatz sortieren{" "}
									{sortField === "totalRevenue" &&
										(sortDirection === "asc" ? "↑" : "↓")}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<Button onClick={() => setShowForm(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Neu
						</Button>
					</div>
				</header>

				{/* Aktionsleiste für ausgewählte Kunden */}
				{selectedCustomers.length > 0 && (
					<div className="bg-muted p-2 rounded-md flex gap-1 flex-wrap justify-between items-center">
						<span>{selectedCustomers.length} Kunden ausgewählt</span>
						<div className="flex flex-wrap gap-2">
							<Button variant="outline" size="sm" onClick={() => exportToCsv()}>
								<Download className="h-4 w-4 mr-1" />
								Exportieren
							</Button>
							<Button variant="outline" size="sm">
								<Mail className="h-4 w-4 mr-1" />
								E-Mail senden
							</Button>
							<Button
								variant="destructive"
								size="sm"
								onClick={() => setSelectedCustomers([])}
							>
								Auswahl aufheben
							</Button>
						</div>
					</div>
				)}

				{showForm ? (
					<CustomerForm
						customer={
							editCustomer
								? customers.customers.find((c) => c.id === editCustomer)
								: undefined
						}
						onCancel={() => {
							setShowForm(false);
							setEditCustomer(null);
						}}
						onSave={() => {
							setShowForm(false);
							setEditCustomer(null);
						}}
					/>
				) : (
					<>
						{isLoading ? (
							// Lade-Zustand
							<div className="space-y-4">
								{[...Array(5)].map((_, i) => (
									<Card
										key={`skeleton-${i}-${Math.random()}`}
										className="overflow-hidden"
									>
										<CardContent className="p-0">
											<div className="flex flex-col md:flex-row">
												<div className="p-4 flex-1">
													<Skeleton className="h-6 w-48 mb-2" />
													<Skeleton className="h-4 w-64" />
												</div>
												<div className="p-4 flex-1">
													<Skeleton className="h-4 w-32 mb-2" />
													<Skeleton className="h-4 w-48" />
												</div>
												<div className="p-4 flex justify-end items-center gap-2">
													<Skeleton className="h-9 w-24" />
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						) : customers.total === 0 ? (
							// Keine Ergebnisse
							<div className="text-center py-12">
								<div className="text-muted-foreground mb-4">
									Keine Kunden gefunden
								</div>
								<Button variant="outline" onClick={resetFilters}>
									Filter zurücksetzen
								</Button>
							</div>
						) : (
							// Kundenliste
							<div className="space-y-4">
								<div className="flex items-center mb-2">
									<Checkbox
										id="selectAll"
										checked={Boolean(
											selectedCustomers.length === customers.customers.length &&
												customers.total > 0,
										)}
										onCheckedChange={toggleSelectAll}
									/>
									<label htmlFor="selectAll" className="ml-2 text-sm">
										Alle auswählen
									</label>
									<div className="ml-auto text-sm text-muted-foreground">
										{customers.total} Kunden gefunden
									</div>
								</div>

								{isLoading ? (
									<div className="flex justify-center items-center">
										<Skeleton className="h-32 w-full" />
									</div>
								) : (
									customers.customers.map((customer) => (
										<Card
											key={customer.id}
											className={`overflow-hidden ${
												selectedCustomers.includes(customer.id)
													? "border-primary"
													: ""
											}`}
										>
											<CardContent className="p-0">
												<div className="flex flex-col md:flex-row">
													<div className="p-4 flex-1 flex items-start gap-3">
														<Checkbox
															checked={selectedCustomers.includes(customer.id)}
															onCheckedChange={() =>
																toggleSelectCustomer(customer.id)
															}
															className="mt-1"
														/>
														<div>
															<div className="font-medium flex items-center gap-2">
																{customer.name}
																<Badge
																	variant={
																		customer.status === "ACTIVE"
																			? "default"
																			: "secondary"
																	}
																>
																	{customer.status === "ACTIVE"
																		? "Aktiv"
																		: "Inaktiv"}
																</Badge>
																<Badge variant="outline">
																	{customer.type === "BUSINESS" ? (
																		<Building className="h-3 w-3 mr-1" />
																	) : (
																		<User className="h-3 w-3 mr-1" />
																	)}
																	{customer.type === "BUSINESS"
																		? "Unternehmen"
																		: "Privatperson"}
																</Badge>
															</div>
															<div className="text-sm text-muted-foreground flex items-center mt-1">
																<MapPin className="h-3 w-3 mr-1" />{" "}
																{customer.street},{customer.zip}
																{customer.city}
															</div>
															{customer.contactPerson && (
																<div className="text-sm mt-1">
																	<span className="font-medium">Kontakt:</span>{" "}
																	{customer.contactPerson}
																</div>
															)}
														</div>
													</div>

													<div className="p-4 flex-1 border-t md:border-t-0 md:border-l border-border">
														<div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
															<div className="flex items-center max-lg:col-span-2">
																<Phone className="h-3 w-3 mr-1 text-muted-foreground" />
																{customer.phone}
															</div>
															<div className="flex items-center max-lg:col-span-2">
																<Mail className="h-3 w-3 mr-1 text-muted-foreground" />
																{customer.email}
															</div>
															<div className="max-lg:col-span-2">
																<span className="text-muted-foreground">
																	Letzte Bestellung:
																</span>{" "}
																{new Date(
																	customer.lastOrder ?? "",
																).toLocaleDateString("de-DE")}
															</div>
															<div className="max-lg:col-span-2">
																<span className="text-muted-foreground">
																	Bestellungen:
																</span>{" "}
																{customer.totalOrders}
															</div>
															<div className="md:col-span-2">
																<span className="text-muted-foreground">
																	Umsatz:
																</span>{" "}
																{(customer.totalRevenue ?? 0).toLocaleString(
																	"de-DE",
																	{
																		style: "currency",
																		currency: "EUR",
																	},
																)}
															</div>
														</div>
													</div>

													<div className="p-4 flex justify-end items-center gap-2 border-t md:border-t-0 md:border-l border-border">
														<Button
															variant="outline"
															size="sm"
															onClick={() => {
																setEditCustomer(customer.id);
																setShowForm(true);
															}}
														>
															Bearbeiten
														</Button>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button variant="ghost" size="sm">
																	<ChevronDown className="h-4 w-4" />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end">
																<DropdownMenuItem>
																	<FileText className="h-4 w-4 mr-2" />
																	Angebot erstellen
																</DropdownMenuItem>
																<DropdownMenuItem>
																	<Mail className="h-4 w-4 mr-2" />
																	E-Mail senden
																</DropdownMenuItem>
																<DropdownMenuItem
																	onClick={() => exportToCsv(customer.id)}
																>
																	<Download className="h-4 w-4 mr-2" />
																	Exportieren
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</div>
												</div>
											</CardContent>
										</Card>
									))
								)}

								{/* Paginierung */}
								{totalPages > 1 && (
									<Pagination>
										<PaginationContent>
											<PaginationItem>
												<Button asChild disabled={currentPage === 1}>
													<PaginationPrevious
														onClick={() =>
															setCurrentPage((prev) => Math.max(prev - 1, 1))
														}
													/>
												</Button>
											</PaginationItem>

											{[...Array(totalPages)].map((_, i) => {
												const page = i + 1;
												// Zeige nur aktuelle Seite, erste, letzte und benachbarte Seiten
												if (
													page === 1 ||
													page === totalPages ||
													(page >= currentPage - 1 && page <= currentPage + 1)
												) {
													return (
														<PaginationItem key={page}>
															<PaginationLink
																isActive={page === currentPage}
																onClick={() => setCurrentPage(page)}
															>
																{page}
															</PaginationLink>
														</PaginationItem>
													);
												}
												if (
													(page === 2 && currentPage > 3) ||
													(page === totalPages - 1 &&
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
												<Button asChild disabled={currentPage === totalPages}>
													<PaginationNext
														onClick={() =>
															setCurrentPage((prev) =>
																Math.min(prev + 1, totalPages),
															)
														}
													/>
												</Button>
											</PaginationItem>
										</PaginationContent>
									</Pagination>
								)}
							</div>
						)}
					</>
				)}
			</div>
		</AuthGuard>
	);
}
