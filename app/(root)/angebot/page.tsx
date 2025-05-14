"use client";

import { AuthGuard } from "@/components/auth-guard";
import DeliveryNoteToolbar, {
	type ViewMode,
} from "@/components/delivery-note-toolbar";
import DocumentForm from "@/components/document-form";
import DocumentPreview from "@/components/document-preview";
import EmailDialog from "@/components/email-dialog";
import { PrintableOffers } from "@/components/print/offers-print";
import StatusChangeDialog from "@/components/status-change-dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
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
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import type { DocumentData } from "@/lib/pdf-generator";
import { secureFetch } from "@/lib/secure-fetch";
import type { OfferStatus, Prisma } from "@prisma/client";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@radix-ui/react-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import {
	CheckCircle,
	Clock,
	Copy,
	Download,
	Edit,
	FileDown,
	FileText,
	Mail,
	MoreHorizontal,
	Plus,
	Search,
	SortAsc,
	SortDesc,
	Trash2,
	XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

// Define types
export type SortField = "date" | "customer" | "total" | "status";
type SortOrder = "asc" | "desc";
type Offer = Prisma.OfferGetPayload<{
	include: {
		customer: true;
		bankDetails: true;
		items: true;
	};
}>;

const DeliveryNoteToolbarItems: {
	id: string;
	column: SortField;
	label: string;
}[] = [
	{
		id: "show-customer",
		column: "customer",
		label: "Kunde",
	},
	{
		id: "show-date",
		column: "date",
		label: "Datum",
	},
	{
		id: "show-status",
		column: "status",
		label: "Status",
	},
	{
		id: "show-total",
		column: "total",
		label: "Summe",
	},
];

export default function AngebotPage() {
	const router = useRouter();
	const { toast } = useToast();

	// State for UI
	const [showForm, setShowForm] = useState(false);
	const [showPreview, setShowPreview] = useState(false);
	const [selectedDocument, setSelectedDocument] = useState<Offer | null>(null);
	const [isLoading, startTransition] = useTransition();
	const [showStatusDialog, setShowStatusDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showEmailDialog, setShowEmailDialog] = useState(false);
	const [showExportDialog, setShowExportDialog] = useState(false);
	const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);

	// State for filtering and sorting
	const params = useSearchParams();
	const [query, setQuery] = useState({
		page: Number(params.get("page") || 1),
		perPage: Number(params.get("perPage") || 10),
		status: (params.get("status") as OfferStatus) || "all",
		sort: (params.get("sort") as SortField) || "date",
		order: (params.get("order") as SortOrder) || "desc",
		search: params.get("search") || "",
		dateRange: {
			from: params.get("from") || "",
			to: params.get("to") || "",
		},
	});

	const [viewMode, setViewMode] = useState<ViewMode>("list");

	// State for offers
	const [offers, setOffers] = useState<{
		offers: Offer[];
		totalCount: number;
	}>({ offers: [], totalCount: 0 });
	const [totalPages, setTotalPages] = useState(0);

	const [visibleColumns, setVisibleColumns] = useState<string[]>([
		"date",
		"customer",
		"total",
		"status",
	]);

	const [exportFormat, setExportFormat] = useState<"pdf" | "csv" | "excel">(
		"pdf",
	);

	const toggleItemSelection = (id: string) => {
		setSelectedItems((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
		);
	};

	const [selectedItems, setSelectedItems] = useState<string[]>([]);

	// Filter state for Angebote
	// const [filters, setFilters] = useState({
	// 	status: searchParams.get("status"),
	// 	dateRange: null,
	// 	search: searchParams.get("search") || "",
	// 	sortBy: "date",
	// 	sortOrder: "desc",
	// 	minTotal: null,
	// 	maxTotal: null,
	// });

	// Fetch offers
	useEffect(() => {
		startTransition(async () => {
			const qs = new URLSearchParams({
				page: String(query.page),
				limit: String(query.perPage),
				status: query.status,
				sort: query.sort,
				order: query.order,
				search: query.search,
				from: query.dateRange.from,
				to: query.dateRange.to,
			});
			try {
				const res = await fetch(`/api/offers?${qs.toString()}`);
				const data = await res.json();

				setOffers({
					offers: data.offers ?? [],
					totalCount: data.totalCount ?? 0,
				});

				setTotalPages(Math.ceil(data.totalCount / Number(qs.get("limit"))));
			} catch (error) {
				console.error(error);
			} finally {
				router.replace(`/angebot?${qs.toString()}`, { scroll: false });
			}
		});
	}, [query, router]);

	const toggleSelectAll = () => {
		if (selectedItems.length === offers.offers.length) {
			setSelectedItems([]);
		} else {
			setSelectedItems(offers.offers.map((doc) => doc.id));
		}
	};

	// Handle page change
	const handlePageChange = (page: number) => {
		if (page < 1 || page > totalPages) return;
		setQuery((prev) => ({ ...prev, page }));
	};

	// Handle sort change
	const handleSortChange = (field: SortField) => {
		if (field === query.sort) {
			setQuery((prev) => ({
				...prev,
				sort: field,
				order: query.order === "asc" ? "desc" : "asc",
			}));
		} else {
			setQuery((prev) => ({
				...prev,
				sort: field,
				order: "asc",
			}));
		}
	};

	// Handle status change
	const handleStatusChange = (
		docId: string,
		newStatus: OfferStatus,
		note?: string,
	) => {
		startTransition(async () => {
			try {
				const date = new Date();
				const res = await secureFetch(`/api/offers/${docId}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						status: newStatus,
						statusDate: date.toLocaleDateString("de-DE"),
						statusNote: note,
					}),
				});

				const data = await res.json();

				setOffers((prev) => {
					const updatedOffers = prev.offers.map((offer) =>
						offer.id === docId
							? {
									...offer,
									status: data.status,
									statusDate: data.statusDate,
									statusNote: data.statusNote,
								}
							: offer,
					);

					return {
						...prev,
						offers: updatedOffers,
					};
				});
				toast({
					title: "Status geändert",
					description: `Angebot ${docId} wurde auf "${getStatusLabel(
						newStatus,
					)}" gesetzt.`,
				});
			} catch (error) {
				console.error(error);
			} finally {
				setShowStatusDialog(false);
			}
		});
	};

	// Handle document deletion
	const handleDeleteDocument = (docId: string) => {
		startTransition(async () => {
			try {
				const res = await secureFetch(`/api/offers/${docId}`, {
					method: "DELETE",
				});

				if (!res.ok) {
					throw new Error("Failed to delete offer");
				}

				setOffers((prev) => ({
					...prev,
					offers: prev.offers.filter((offer) => offer.id !== docId),
				}));

				toast({
					title: "Angebot gelöscht",
					description: `Angebot ${docId} wurde erfolgreich gelöscht.`,
				});
			} catch (error) {
				console.error(error);
				toast({
					title: "Fehler beim Löschen",
					description: `Angebot ${docId} konnte nicht gelöscht werden.`,
				});
			} finally {
				setShowDeleteDialog(false);
				setDocumentToDelete(null);
			}
		});
	};

	// Handle document duplication
	const handleDuplicateDocument = (doc: DocumentData) => {
		startTransition(async () => {
			const date = new Date();

			const newDoc = {
				...doc,
				date: date.toLocaleDateString("de-DE"),
				status: "OPEN" as OfferStatus,
				statusDate: date.toLocaleDateString("de-DE"),
				statusNote: "",
			};
			try {
				const res = await secureFetch("/api/offers", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(newDoc),
				});

				if (!res.ok) {
					throw new Error("Failed to duplicate offer");
				}

				const data = await res.json();

				toast({
					title: "Angebot dupliziert",
					description: `Angebot ${doc.id} wurde als ${data.id} dupliziert.`,
				});
			} catch (error) {
				console.error(error);
				toast({
					title: "Fehler beim Duplizieren",
					description: `Angebot ${doc.id} konnte nicht dupliziert werden.`,
				});
			}
		});
	};

	// Handle document creation
	const handleCreateDocument = () => {
		setShowForm(true);
	};

	// Handle document save
	const handleSaveDocument = (data: DocumentData) => {
		startTransition(async () => {
			const date = new Date();
			const newDoc = {
				...data,
				date: date.toLocaleDateString("de-DE"),
				status: "OPEN" as OfferStatus,
				statusDate: date.toLocaleDateString("de-DE"),
				customer: data.customer,
			};

			try {
				const res = await secureFetch("/api/offers", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(newDoc),
				});

				if (!res.ok) {
					throw new Error("Failed to create offer");
				}

				const data = await res.json();

				toast({
					title: "Angebot erstellt",
					description: `Angebot ${data.offer.id} wurde erfolgreich erstellt.`,
				});
			} catch (error) {
				console.error(error);
				toast({
					title: "Fehler beim Erstellen",
					description: "Angebot konnte nicht erstellt werden.",
					variant: "destructive",
				});
			} finally {
				setShowForm(false);
			}
		});
	};

	// Handle email sending
	const handleSendEmail = () => {
		startTransition(async () => {
			try {
				const res = await secureFetch(
					`/api/offers/${selectedDocument?.id}/email`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({}),
					},
				);

				if (!res.ok) {
					throw new Error("Failed to send email");
				}

				toast({
					title: "E-Mail gesendet",
					description: `Angebot ${selectedDocument?.id} wurde erfolgreich per E-Mail versendet.`,
				});
			} catch (error) {
				console.error(error);
				toast({
					title: "Fehler beim Senden",
					description: `Angebot ${selectedDocument?.id} konnte nicht per E-Mail versendet werden.`,
				});
			} finally {
				setShowEmailDialog(false);
			}
		});
	};

	// Handle batch print
	const printableRef = useRef<HTMLDivElement>(null);

	const offersToPrint = (offers.offers ?? []).filter((doc) =>
		selectedItems.includes(doc.id),
	);

	// Handle batch status update
	const handleBatchStatusUpdate = (status: OfferStatus) => {
		// In a real app, you would update the status of the selected items
		toast({
			title: "Status aktualisiert",
			description: `${selectedItems.length} Angebote wurden auf "${
				status === "OPEN"
					? "Vorbereitet"
					: status === "ACCEPTED"
						? "Angenommen"
						: "Abgelehnt"
			}" gesetzt.`,
		});
		setShowStatusDialog(false);
	};

	// Handle batch export
	const handleBatchExport = () => {
		// In a real app, you would export the selected items
		toast({
			title: `Angebote als ${exportFormat.toUpperCase()} exportiert`,
			description: `${selectedItems.length} Angebote wurden erfolgreich exportiert.`,
		});
		setShowExportDialog(false);
	};

	// Get status badge
	const getStatusBadge = (status: string) => {
		switch (status) {
			case "OPEN":
				return (
					<Badge
						variant="outline"
						className="bg-blue-100 text-blue-800 hover:bg-blue-100"
					>
						<Clock className="h-3 w-3 mr-1" />
						Offen
					</Badge>
				);
			case "ACCEPTED":
				return (
					<Badge
						variant="outline"
						className="bg-green-100 text-green-800 hover:bg-green-100"
					>
						<CheckCircle className="h-3 w-3 mr-1" />
						Angenommen
					</Badge>
				);
			case "REJECTED":
				return (
					<Badge
						variant="outline"
						className="bg-red-100 text-red-800 hover:bg-red-100"
					>
						<XCircle className="h-3 w-3 mr-1" />
						Abgelehnt
					</Badge>
				);
			default:
				return null;
		}
	};

	// Get status label
	const getStatusLabel = (status: OfferStatus): string => {
		switch (status) {
			case "OPEN":
				return "Offen";
			case "ACCEPTED":
				return "Angenommen";
			case "REJECTED":
				return "Abgelehnt";
			default:
				return "";
		}
	};

	// Format currency
	const formatCurrency = (value: number): string => {
		return new Intl.NumberFormat("de-DE", {
			style: "currency",
			currency: "EUR",
		}).format(value);
	};

	// Render pagination
	const renderPagination = () => {
		const pages = [];
		const maxVisiblePages = 5;

		if (totalPages <= maxVisiblePages) {
			// Show all pages if total pages is less than max visible pages
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Show first page, last page, current page, and pages around current page
			const leftSide = Math.floor(maxVisiblePages / 2);
			const rightSide = maxVisiblePages - leftSide - 1;

			// Always show first page
			pages.push(1);

			// Calculate start and end of middle pages
			let startPage = Math.max(2, currentPage - leftSide);
			let endPage = Math.min(totalPages - 1, currentPage + rightSide);

			// Adjust if we're near the start or end
			if (startPage === 2) {
				endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
			}
			if (endPage === totalPages - 1) {
				startPage = Math.max(2, endPage - (maxVisiblePages - 3));
			}

			// Add ellipsis after first page if needed
			if (startPage > 2) {
				pages.push(-1); // -1 represents ellipsis
			}

			// Add middle pages
			for (let i = startPage; i <= endPage; i++) {
				pages.push(i);
			}

			// Add ellipsis before last page if needed
			if (endPage < totalPages - 1) {
				pages.push(-2); // -2 represents ellipsis
			}

			// Always show last page
			pages.push(totalPages);
		}

		return (
			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							href="#"
							onClick={(e) => {
								e.preventDefault();
								handlePageChange(currentPage - 1);
							}}
							className={
								currentPage === 1 ? "pointer-events-none opacity-50" : ""
							}
						/>
					</PaginationItem>

					{pages.map((page, index) => {
						if (page < 0) {
							// Render ellipsis
							return (
								<PaginationItem key={`ellipsis-${index}-${page}`}>
									<PaginationEllipsis />
								</PaginationItem>
							);
						}

						return (
							<PaginationItem key={page}>
								<PaginationLink
									href="#"
									onClick={(e) => {
										e.preventDefault();
										handlePageChange(page);
									}}
									isActive={page === currentPage}
								>
									{page}
								</PaginationLink>
							</PaginationItem>
						);
					})}

					<PaginationItem>
						<PaginationNext
							href="#"
							onClick={(e) => {
								e.preventDefault();
								handlePageChange(currentPage + 1);
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
		);
	};

	// Render items per page selector
	const renderItemsPerPageSelector = () => {
		return (
			<div className="flex items-center gap-2 px-2">
				<span className="text-sm text-muted-foreground">Zeige</span>
				<Select
					value={itemsPerPage.toString()}
					onValueChange={(value) => {
						setItemsPerPage(Number.parseInt(value));
						setCurrentPage(1); // Reset to first page when changing items per page
					}}
				>
					<SelectTrigger className="w-[70px]">
						<SelectValue placeholder="10" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="5">5</SelectItem>
						<SelectItem value="10">10</SelectItem>
						<SelectItem value="20">20</SelectItem>
						<SelectItem value="50">50</SelectItem>
					</SelectContent>
				</Select>
				<span className="text-sm text-muted-foreground">pro Seite</span>
			</div>
		);
	};

	// Render sort indicator
	const renderSortIndicator = (field: SortField) => {
		if (sortField !== field) return null;

		return <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>;
	};

	// menu
	const menu = () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm">
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					onClick={() => {
						setSelectedDocument(ensureValidCustomer(document));
						setShowStatusDialog(true);
					}}
				>
					Status ändern
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => {
						router.push(`/angebot/${document.id}/edit`);
					}}
				>
					<Edit className="h-4 w-4 mr-2" />
					Bearbeiten
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => handleDuplicateDocument(document)}>
					<Copy className="h-4 w-4 mr-2" />
					Duplizieren
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => {
						setSelectedDocument(ensureValidCustomer(document));
						setShowEmailDialog(true);
					}}
				>
					<Mail className="h-4 w-4 mr-2" />
					Per E-Mail senden
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => {
						router.push(`/angebot/${document.id}/convert`);
					}}
				>
					In Rechnung umwandeln
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="text-destructive focus:text-destructive"
					onClick={() => {
						setDocumentToDelete(document.id);
						setShowDeleteDialog(true);
					}}
				>
					<Trash2 className="h-4 w-4 mr-2" />
					Löschen
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);

	// Render document list
	const renderListView = () => {
		return (
			<div className="overflow-y-auto max-h-[calc(100dvh-16rem)]">
				{offers.offers.map((offer, index) => (
					<div
						key={offer.id}
						className={`border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
							selectedItems.includes(offer.id) ? "bg-primary/5" : ""
						}`}
					>
						<div className="flex flex-col md:flex-row">
							<div className="p-4 flex-1 flex items-start gap-3">
								<Checkbox
									checked={selectedItems.includes(offer.id)}
									onCheckedChange={() => toggleItemSelection(offer.id)}
									aria-label={`Angebot ${offer.id} auswählen`}
								/>
								<div>
									<div className="font-medium">Angebot {offer.id}</div>
									<div className="text-sm text-muted-foreground">
										{offer.customer.name}
									</div>
									<div className="text-sm text-muted-foreground">
										Datum: {new Date(offer.date).toLocaleDateString()}
									</div>
									<div className="text-sm text-muted-foreground">
										Summe: €{offer.total.toFixed(2)}
									</div>
								</div>
							</div>
							<div className="p-4 flex flex-col justify-center items-end gap-2">
								<div className="flex flex-wrap gap-2">
									{getStatusBadge(offer.status)}
								</div>

								<div className="flex gap-2">
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														setSelectedDocument(offer);
														setShowPreview(true);
													}}
												>
													Anzeigen
												</Button>
											</TooltipTrigger>
											<TooltipContent>Vorschau anzeigen</TooltipContent>
										</Tooltip>
									</TooltipProvider>

									{menu()}
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		);
	};

	const renderGridView = () => {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-1">
				{offers.offers.map((offer) => (
					<Card
						key={offer.id}
						className={selectedItems.includes(offer.id) ? "border-primary" : ""}
					>
						<CardContent className="p-4">
							<div className="flex justify-between items-start mb-3">
								<div>
									<h3 className="font-medium">Angebot #{offer.id}</h3>
									<p className="text-sm text-muted-foreground">
										{offer.customer.name}
									</p>
								</div>
								<Checkbox
									checked={selectedItems.includes(offer.id)}
									onCheckedChange={() => toggleItemSelection(offer.id)}
								/>
							</div>

							<div className="space-y-2 mb-3 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Datum:</span>
									<span>{new Date(offer.date).toLocaleDateString()}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Summe:</span>
									<span>€{offer.total.toFixed(2)}</span>
								</div>
							</div>

							<div className="flex flex-wrap gap-2 mb-4">
								{getStatusBadge(offer.status)}
							</div>

							<div className="flex justify-between">
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										// Ensure the document has a valid customer object before showing preview
										setSelectedDocument(offer);
										setShowPreview(true);
									}}
								>
									Anzeigen
								</Button>

								{menu()}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	};

	const renderCompactView = () => {
		return (
			<div className="overflow-x-auto">
				<table className="border-collapse w-full">
					<thead>
						<tr className="bg-muted">
							<th className="p-2 text-left">
								<Checkbox
									checked={
										selectedItems.length === offers.offers.length &&
										offers.offers.length > 0
									}
									onCheckedChange={toggleSelectAll}
								/>
							</th>
							{visibleColumns.includes("customer") && (
								<th className="p-2 text-left">
									<Button
										variant="ghost"
										size="sm"
										className="font-medium"
										onClick={() => handleSortChange("customer")}
									>
										Kunde
										{query.sort === "customer" &&
											(query.order === "asc" ? (
												<SortAsc className="h-3 w-3 ml-1 inline" />
											) : (
												<SortDesc className="h-3 w-3 ml-1 inline" />
											))}
									</Button>
								</th>
							)}
							{visibleColumns.includes("date") && (
								<th className="p-2 text-left">
									<Button
										variant="ghost"
										size="sm"
										className="font-medium"
										onClick={() => handleSortChange("date")}
									>
										Datum
										{query.sort === "date" &&
											(query.order === "asc" ? (
												<SortAsc className="h-3 w-3 ml-1 inline" />
											) : (
												<SortDesc className="h-3 w-3 ml-1 inline" />
											))}
									</Button>
								</th>
							)}
							{visibleColumns.includes("status") && (
								<th className="p-2 text-left">Status</th>
							)}
							{visibleColumns.includes("total") && (
								<th className="p-2 text-left">
									<Button
										variant="ghost"
										size="sm"
										className="font-medium"
										onClick={() => handleSortChange("total")}
									>
										Summe
										{query.sort === "total" &&
											(query.order === "asc" ? (
												<SortAsc className="h-3 w-3 ml-1 inline" />
											) : (
												<SortDesc className="h-3 w-3 ml-1 inline" />
											))}
									</Button>
								</th>
							)}
							<th className="p-2 text-right">Aktionen</th>
						</tr>
					</thead>
					<tbody>
						{offers.offers.map((offer) => (
							<tr
								key={offer.id}
								className={`border-b hover:bg-muted/50 ${
									selectedItems.includes(offer.id) ? "bg-primary/5" : ""
								}`}
							>
								<td className="p-2">
									<Checkbox
										checked={selectedItems.includes(offer.id)}
										onCheckedChange={() => toggleItemSelection(offer.id)}
									/>
								</td>
								{visibleColumns.includes("customer") && (
									<td className="p-2">{offer.customer.name}</td>
								)}
								{visibleColumns.includes("date") && (
									<td className="p-2">
										{new Date(offer.date).toLocaleDateString()}
									</td>
								)}
								{visibleColumns.includes("status") && (
									<td className="p-2">{getStatusBadge(offer.status)}</td>
								)}
								{visibleColumns.includes("total") && (
									<td className="p-2">€{offer.total.toFixed(2)}</td>
								)}
								<td className="p-2 text-right">
									<div className="flex justify-end gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => {
												const index = offers.offers.findIndex(
													(o) => offer.id === o.id,
												);
												setSelectedDocument(offers.offers[index]);
												setShowPreview(true);
											}}
										>
											<FileText className="h-4 w-4" />
										</Button>
										{menu()}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	};

	return (
		<AuthGuard requiredPermissions={["VIEW_OFFERS"]}>
			<div className="p-6 space-y-6">
				<header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<h1 className="text-2xl font-bold">Angebote</h1>
					<div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
						<div className="relative w-full sm:w-64">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Suche..."
								className="pl-8"
								value={query.search}
								onChange={(e) => {
									setQuery((prev) => ({
										...prev,
										search: e.target.value,
										page: 1,
									}));
								}}
							/>
						</div>
						<Button onClick={handleCreateDocument}>
							<Plus className="h-4 w-4 mr-2" />
							Neu
						</Button>
					</div>
				</header>

				{showForm ? (
					<DocumentForm
						type="angebot"
						onCancel={() => setShowForm(false)}
						onSave={handleSaveDocument}
					/>
				) : showPreview && selectedDocument ? (
					<DocumentPreview
						type="angebot"
						data={selectedDocument}
						onBack={() => {
							setShowPreview(false);
							setSelectedDocument(null);
						}}
					/>
				) : (
					<>
						<div className="flex flex-wrap gap-2 items-center">
							<Button
								variant={query.status === "all" ? "default" : "outline"}
								size="sm"
								onClick={() => {
									setQuery((prev) => ({ ...prev, status: "all", page: 1 }));
								}}
							>
								Alle
							</Button>
							<Button
								variant={query.status === "OPEN" ? "default" : "outline"}
								size="sm"
								onClick={() => {
									setQuery((prev) => ({ ...prev, status: "OPEN", page: 1 }));
								}}
								className={query.status === "OPEN" ? "" : "text-blue-600"}
							>
								<Clock className="h-4 w-4 mr-1" />
								Offen
							</Button>
							<Button
								variant={query.status === "ACCEPTED" ? "default" : "outline"}
								size="sm"
								onClick={() => {
									setQuery((prev) => ({
										...prev,
										status: "ACCEPTED",
										page: 1,
									}));
								}}
								className={query.status === "ACCEPTED" ? "" : "text-green-600"}
							>
								<CheckCircle className="h-4 w-4 mr-1" />
								Angenommen
							</Button>
							<Button
								variant={query.status === "REJECTED" ? "default" : "outline"}
								size="sm"
								onClick={() => {
									setQuery((prev) => ({
										...prev,
										status: "REJECTED",
										page: 1,
									}));
								}}
								className={query.status === "REJECTED" ? "" : "text-red-600"}
							>
								<XCircle className="h-4 w-4 mr-1" />
								Abgelehnt
							</Button>

							<div className="ml-auto flex items-center gap-2">
								<Button variant="outline" size="sm">
									<FileDown className="h-4 w-4 mr-2" />
									Exportieren
								</Button>
							</div>
						</div>

						<DeliveryNoteToolbar
							PrintComponent={
								<PrintableOffers ref={printableRef} offers={offersToPrint} />
							}
							documentsToPrint={offersToPrint}
							printableRef={printableRef}
							documents={offers.offers}
							// searchParams={searchParams}
							viewMode={viewMode}
							setViewMode={setViewMode}
							query={query}
							setQuery={setQuery}
							// filters={filters}
							// setFilters={setFilters}
							handleSortChange={handleSortChange}
							setVisibleColumns={setVisibleColumns}
							visibleColumns={visibleColumns}
							DeliveryNoteToolbarItems={DeliveryNoteToolbarItems}
							selectedItems={selectedItems}
							setShowStatusDialog={setShowStatusDialog}
							setShowDeleteDialog={setShowDeleteDialog}
							handleBatchEmail={handleSendEmail}
							setShowExportDialog={setShowExportDialog}
						/>

						<Card>
							<CardContent className="p-1">
								<div className="p-4 border-b flex items-center">
									<Checkbox
										checked={
											selectedItems.length === offers.offers.length &&
											offers.offers.length > 0
										}
										onCheckedChange={toggleSelectAll}
										aria-label="Alle Angebote auswählen"
										className="mr-4"
									/>
									<div className="text-sm font-medium">
										{selectedItems.length > 0
											? `${selectedItems.length} von ${offers.offers.length} ausgewählt`
											: `${offers.totalCount} Angebote`}
									</div>
								</div>
								{
									<div className="max-h-[600px] overflow-y-auto">
										{viewMode === "list" && renderListView()}
										{viewMode === "grid" && renderGridView()}
										{viewMode === "compact" && renderCompactView()}
									</div>
								}
							</CardContent>
						</Card>
					</>
				)}

				{/* Status Change Dialog */}
				{selectedDocument && (
					<StatusChangeDialog
						open={showStatusDialog}
						onOpenChange={setShowStatusDialog}
						currentStatus={(selectedDocument.status as OfferStatus) || "OPEN"}
						onStatusChange={(status, note) =>
							handleStatusChange(selectedDocument.id, status, note)
						}
					/>
				)}

				<StatusChangeDialog
					open={showStatusDialog}
					onOpenChange={setShowStatusDialog}
					currentStatus="OPEN"
					onStatusChange={handleBatchStatusUpdate}
				/>

				{/* Export dialog */}
				{/* Fixme */}
				<Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Angebote exportieren</DialogTitle>
							<DialogDescription>
								Wählen Sie das Format für den Export von {selectedItems.length}{" "}
								Angeboten.
							</DialogDescription>
						</DialogHeader>
						<div className="py-4 space-y-4">
							<div className="space-y-2">
								<h3 className="text-sm font-medium">Exportformat</h3>
								<Tabs
									value={exportFormat}
									onValueChange={(value) => setExportFormat(value as any)}
								>
									<TabsList className="grid grid-cols-3">
										<TabsTrigger value="pdf">PDF</TabsTrigger>
										<TabsTrigger value="csv">CSV</TabsTrigger>
										<TabsTrigger value="excel">Excel</TabsTrigger>
									</TabsList>
									<TabsContent value="pdf" className="pt-4">
										<p className="text-sm text-muted-foreground">
											Exportiert die Angebote als PDF-Dokumente. Ideal für den
											Druck oder die Weitergabe an Kunden.
										</p>
									</TabsContent>
									<TabsContent value="csv" className="pt-4">
										<p className="text-sm text-muted-foreground">
											Exportiert die Lieferscheindaten als CSV-Datei. Ideal für
											die Weiterverarbeitung in Tabellenkalkulationen.
										</p>
									</TabsContent>
									<TabsContent value="excel" className="pt-4">
										<p className="text-sm text-muted-foreground">
											Exportiert die Lieferscheindaten als Excel-Datei. Ideal
											für die Weiterverarbeitung mit erweiterten Funktionen.
										</p>
									</TabsContent>
								</Tabs>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setShowExportDialog(false)}
							>
								Abbrechen
							</Button>
							<Button onClick={handleBatchExport}>
								<Download className="h-4 w-4 mr-2" />
								Exportieren
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
				{/* Delete Confirmation Dialog */}
				<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Angebot löschen</AlertDialogTitle>
							<AlertDialogDescription>
								Sind Sie sicher, dass Sie dieses Angebot löschen möchten? Diese
								Aktion kann nicht rückgängig gemacht werden.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Abbrechen</AlertDialogCancel>
							<AlertDialogAction
								onClick={() =>
									documentToDelete && handleDeleteDocument(documentToDelete)
								}
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							>
								Löschen
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				{/* Email Dialog */}
				{selectedDocument && (
					<EmailDialog
						open={showEmailDialog}
						onOpenChange={setShowEmailDialog}
						documentType="angebot"
						documentData={selectedDocument}
						defaultTo={selectedDocument.customer?.email || ""}
					/>
				)}
			</div>
		</AuthGuard>
	);
}
