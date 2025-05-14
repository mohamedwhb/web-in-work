"use client";

import { AuthGuard } from "@/components/auth-guard";
import { CategoryBadge } from "@/components/category-badge";
import { CategoryTree } from "@/components/category-tree";
import ProductForm from "@/components/product-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getAllCategories } from "@/lib/category-service";
import { getInventoryStatus } from "@/lib/inventory";
import { secureFetch } from "@/lib/secure-fetch";
import type { Category, Prisma } from "@prisma/client";
import {
	Download,
	Edit,
	Eye,
	Filter,
	MoreHorizontal,
	Package2,
	Plus,
	Search,
	Trash2,
	Upload,
	X,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";

type Product = Prisma.ProductGetPayload<{
	include: {
		Category: true;
		group: true;
	};
}>;

// Definiere Ansichtstypen
type ViewType = "grid" | "table";

export default function ProduktePage() {
	const { toast } = useToast();
	// State für Produkte und UI
	const [products, setProducts] = useState<{
		products: Product[];
		totalCount: number;
	}>({
		products: [],
		totalCount: 0,
	});
	const [showForm, setShowForm] = useState(false);
	const [editProduct, setEditProduct] = useState<string | null>(null);
	const [viewProduct, setViewProduct] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [viewType, setViewType] = useState<ViewType>("grid");
	const [categories, setCategories] = useState<Category[]>([]);
	const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
	const [sortBy, setSortBy] = useState<string>("name");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
	const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [stockFilter, setStockFilter] = useState<
		"all" | "in-stock" | "low-stock" | "out-of-stock"
	>("all");
	const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
	const [isLoading, startTransition] = useTransition();
	const [totalPages, setTotalPages] = useState(1);

	// Lade Produkte und Kategorien beim ersten Rendern
	useEffect(() => {
		const loadData = async () => {
			startTransition(async () => {
				try {
					// Lade Kategorien
					const categoriesData = await getAllCategories();
					setCategories(categoriesData);

					// Lade Produkte mit Filtern
					const searchParams = new URLSearchParams();
					if (searchTerm) searchParams.set("search", searchTerm);
					if (categoryFilter) searchParams.set("category", categoryFilter);
					if (stockFilter) searchParams.set("stockStatus", stockFilter);
					if (sortBy) searchParams.set("sortBy", sortBy);
					if (sortOrder) searchParams.set("sortOrder", sortOrder);
					if (currentPage) searchParams.set("page", currentPage.toString());
					if (itemsPerPage) searchParams.set("limit", itemsPerPage.toString());

					const res = await fetch(`/api/products?${searchParams.toString()}`);
					const data = await res.json();
					setProducts({
						products: data.products,
						totalCount: data.totalCount,
					});
					setTotalPages(Math.ceil(data.totalCount / itemsPerPage));
				} catch (error) {
					console.error("Fehler beim Laden der Daten:", error);
					toast({
						title: "Fehler",
						description: "Die Produkte konnten nicht geladen werden.",
						variant: "destructive",
					});
				}
			});
		};

		loadData();
	}, [
		searchTerm,
		categoryFilter,
		sortBy,
		sortOrder,
		stockFilter,
		currentPage,
		itemsPerPage,
	]);

	const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
	const indexOfLastItem = Math.min(
		indexOfFirstItem + itemsPerPage,
		products.totalCount,
	);

	// Funktion zum Speichern eines Produkts
	const handleSaveProduct = (product: Product) => {
		startTransition(async () => {
			try {
				let method: "PATCH" | "POST";
				if (editProduct) {
					method = "PATCH";
				} else {
					method = "POST";
				}

				const res = await secureFetch(`/api/products/${editProduct || ""}`, {
					method,
					body: JSON.stringify(product),
					headers: {
						"Content-Type": "application/json",
					},
				});

				if (res.ok) {
					const data = await res.json();
					if (products.products.length < itemsPerPage && !editProduct) {
						setProducts((prevProducts) => ({
							...prevProducts,
							products: [...prevProducts.products, data.product],
						}));
					} else if (
						editProduct &&
						products.products.some((p) => p.id === data.product.id)
					) {
						setProducts((prevProducts) => ({
							...prevProducts,
							products: prevProducts.products.map((p) =>
								p.id === editProduct ? data.product : p,
							),
						}));
					}
				}

				toast({
					title: editProduct ? "Produkt aktualisiert" : "Produkt hinzugefügt",
					description: `${product.name} wurde erfolgreich ${editProduct ? "aktualisiert" : "hinzugefügt"}.`,
				});

				setShowForm(false);
				setEditProduct(null);
			} catch (error) {
				console.error("Fehler beim Speichern des Produkts:", error);
				toast({
					title: "Fehler",
					description: "Das Produkt konnte nicht gespeichert werden.",
					variant: "destructive",
				});
			}
		});
	};

	// Funktion zum Löschen eines Produkts
	const handleDeleteProduct = () => {
		startTransition(async () => {
			try {
				const res = await secureFetch(
					`/api/products/${selectedProducts.length > 0 ? "" : deleteProductId}`,
					{
						method: "DELETE",
						headers: {
							"Content-Type": "application/json",
						},
						...(selectedProducts.length > 0 && {
							body: JSON.stringify({
								productIds: selectedProducts,
							}),
						}),
					},
				);

				if (res.ok) {
					if (selectedProducts.length > 0) {
						setProducts((prevProducts) => ({
							...prevProducts,
							products: prevProducts.products.filter(
								(p) => !selectedProducts.includes(p.id),
							),
						}));
						toast({
							title: "Produkte gelöscht",
							description: `${selectedProducts.length} Produkte wurden erfolgreich gelöscht.`,
						});
						setSelectedProducts([]);
					} else {
						setProducts((prevProducts) => ({
							...prevProducts,
							products: prevProducts.products.filter(
								(p) => p.id !== deleteProductId,
							),
						}));
						setSelectedProducts((prevSelected) =>
							prevSelected.filter((id) => id !== deleteProductId),
						);
						setShowDeleteDialog(false);
						setDeleteProductId(null);
						toast({
							title: "Produkt gelöscht",
							description: "Das Produkt wurde erfolgreich gelöscht.",
						});
					}
				}
			} catch (error) {
				toast({
					title: "Fehler",
					description: "Das Produkt konnte nicht gelöscht werden.",
					variant: "destructive",
				});
			}
		});
	};

	// Funktion zum Umschalten der Auswahl eines Produkts
	const toggleProductSelection = (productId: string) => {
		setSelectedProducts((prevSelected) =>
			prevSelected.includes(productId)
				? prevSelected.filter((id) => id !== productId)
				: [...prevSelected, productId],
		);
	};

	// Funktion zum Umschalten der Auswahl aller Produkte
	const toggleSelectAll = () => {
		if (selectedProducts.length === products.products.length) {
			setSelectedProducts([]);
		} else {
			setSelectedProducts(products.products.map((p) => p.id));
		}
	};

	// Funktion zum Exportieren von Produkten
	const handleExportProducts = () => {
		const productsToExport =
			selectedProducts.length > 0
				? products.products.filter((p) => selectedProducts.includes(p.id))
				: products.products;

		const csv = [
			[
				"ID",
				"Artikelnummer",
				"Name",
				"Preis",
				"Einheit",
				"Kategorie",
				"Lagerbestand",
				"Mindestbestand",
				"Barcode",
				"Beschreibung",
			].join(","),
			...productsToExport.map((p: Product) =>
				[
					p.id,
					p.artNr,
					`"${p.name}"`,
					p.price,
					p.unit,
					p.group?.name || "",
					p.stock,
					p.minStock || "",
					p.barcode || "",
					`"${p.description || ""}"`,
				].join(","),
			),
		].join("\n");

		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute(
			"download",
			`produkte_export_${new Date().toISOString().split("T")[0]}.csv`,
		);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		toast({
			title: "Export erfolgreich",
			description: `${productsToExport.length} Produkte wurden exportiert.`,
		});
	};

	// Funktion zum Importieren von Produkten
	const handleImportProducts = () => {
		// In einer echten Anwendung würde hier ein Datei-Upload-Dialog geöffnet werden
		toast({
			title: "Import-Funktion",
			description: "Diese Funktion ist noch nicht implementiert.",
		});
	};

	// Funktion zum Ändern der Seite
	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	// Funktion zum Ändern der Anzahl der Elemente pro Seite
	const handleItemsPerPageChange = (value: string) => {
		setItemsPerPage(Number.parseFloat(value));
		setCurrentPage(1); // Zurück zur ersten Seite
	};

	// Funktion zum Ändern der Sortierung
	const handleSortChange = (column: string) => {
		if (sortBy === column) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortBy(column);
			setSortOrder("asc");
		}
	};

	// Funktion zum Ändern des Lagerbestandsfilters
	const handleStockFilterChange = (
		value: "all" | "in-stock" | "low-stock" | "out-of-stock",
	) => {
		setStockFilter(value);
	};

	// Funktion zum Ändern des Kategoriefilters
	const handleCategorySelect = (categoryId: string | null) => {
		setCategoryFilter(categoryId);
		setCategoryPopoverOpen(false);
	};

	// Funktion zum Anzeigen der Produktdetails
	const handleViewProduct = (productId: string) => {
		setViewProduct(productId);
	};

	// Funktion zum Bearbeiten eines Produkts
	const handleEditProduct = (productId: string) => {
		setEditProduct(productId);
		setShowForm(true);
	};

	// Funktion zum Löschen eines Produkts
	const handleDeleteConfirm = (productId: string) => {
		setDeleteProductId(productId);
		setShowDeleteDialog(true);
	};

	// Funktion zum Löschen mehrerer Produkte
	const handleBatchDelete = () => {
		if (selectedProducts.length === 0) return;
		setShowDeleteDialog(true);
	};

	// Funktion zum Rendern der Paginierung
	const renderPagination = () => {
		if (totalPages <= 1) return null;

		const pageItems = [];
		const maxVisiblePages = 5;

		// Vorherige Seite
		pageItems.push(
			<PaginationItem key="prev">
				<Button asChild disabled={currentPage === 1}>
					<PaginationPrevious
						onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
					/>
				</Button>
			</PaginationItem>,
		);

		// Erste Seite
		if (currentPage > 3) {
			pageItems.push(
				<PaginationItem key={1}>
					<PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
				</PaginationItem>,
			);

			if (currentPage > 4) {
				pageItems.push(
					<PaginationItem key="ellipsis1">
						<PaginationEllipsis />
					</PaginationItem>,
				);
			}
		}

		// Seitenzahlen
		const startPage = Math.max(
			1,
			currentPage - Math.floor(maxVisiblePages / 2),
		);
		const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

		for (let i = startPage; i <= endPage; i++) {
			pageItems.push(
				<PaginationItem key={i}>
					<PaginationLink
						onClick={() => handlePageChange(i)}
						isActive={i === currentPage}
					>
						{i}
					</PaginationLink>
				</PaginationItem>,
			);
		}

		// Letzte Seite
		if (currentPage < totalPages - 2) {
			if (currentPage < totalPages - 3) {
				pageItems.push(
					<PaginationItem key="ellipsis2">
						<PaginationEllipsis />
					</PaginationItem>,
				);
			}

			pageItems.push(
				<PaginationItem key={totalPages}>
					<PaginationLink onClick={() => handlePageChange(totalPages)}>
						{totalPages}
					</PaginationLink>
				</PaginationItem>,
			);
		}

		// Nächste Seite
		pageItems.push(
			<PaginationItem key="next">
				<Button asChild disabled={currentPage === totalPages}>
					<PaginationNext
						onClick={() =>
							handlePageChange(Math.min(totalPages, currentPage + 1))
						}
					/>
				</Button>
			</PaginationItem>,
		);

		return (
			<Pagination>
				<PaginationContent>{pageItems}</PaginationContent>
			</Pagination>
		);
	};

	// Funktion zum Rendern der Produktkarte
	const renderProductCard = (product: Product) => {
		const isSelected = selectedProducts.includes(product.id);
		const category = categories.find(
			(c) => c.id === product.categoryId || c.parentId === product.categoryId,
		);

		return (
			<Card
				key={product.id}
				className={`overflow-hidden ${isSelected ? "ring-2 ring-primary" : ""}`}
			>
				<CardContent className="p-0">
					<div className="flex flex-col">
						<div className="p-4 flex justify-between items-start">
							<div className="flex-1">
								<div className="flex items-center gap-2">
									<Checkbox
										checked={isSelected}
										onCheckedChange={() => toggleProductSelection(product.id)}
										aria-label={`Produkt ${product.name} auswählen`}
									/>
									<div>
										<div className="font-medium">{product.name}</div>
										<div className="text-sm text-muted-foreground">
											Art.-Nr.: {product.artNr}
										</div>
									</div>
								</div>
							</div>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon">
										<MoreHorizontal className="h-4 w-4" />
										<span className="sr-only">Aktionen</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem
										onClick={() => handleViewProduct(product.id)}
									>
										<Eye className="mr-2 h-4 w-4" />
										Details
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => handleEditProduct(product.id)}
									>
										<Edit className="mr-2 h-4 w-4" />
										Bearbeiten
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => handleDeleteConfirm(product.id)}
										className="text-destructive focus:text-destructive"
									>
										<Trash2 className="mr-2 h-4 w-4" />
										Löschen
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						<div className="border-t p-4">
							<div className="grid grid-cols-2 gap-2">
								<div>
									<div className="text-sm font-medium">Preis:</div>
									<div className="text-sm">
										{Number.parseFloat(
											product.price?.toString() || "0",
										).toFixed(2)}{" "}
										€/{product.unit}
									</div>
								</div>
								<div>
									<div className="text-sm font-medium">Lagerbestand:</div>
									<div className="text-sm">
										{product.stock} {product.unit}
									</div>
								</div>
							</div>
						</div>

						<div className="border-t p-4 flex flex-wrap gap-2">
							{category && (
								<CategoryBadge name={category.name} color={category.color} />
							)}

							{renderStockBadge(product)}
						</div>
					</div>
				</CardContent>
			</Card>
		);
	};

	// Funktion zum Rendern der Produkttabelle
	const renderProductTable = () => {
		return (
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[50px]">
							<Checkbox
								checked={
									selectedProducts.length === products.products.length &&
									products.totalCount > 0
								}
								onCheckedChange={toggleSelectAll}
								aria-label="Alle Produkte auswählen"
							/>
						</TableHead>
						<TableHead
							className="cursor-pointer"
							onClick={() => handleSortChange("name")}
						>
							Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
						</TableHead>
						<TableHead
							className="cursor-pointer"
							onClick={() => handleSortChange("artNr")}
						>
							Art.-Nr. {sortBy === "artNr" && (sortOrder === "asc" ? "↑" : "↓")}
						</TableHead>
						<TableHead>Kategorie</TableHead>
						<TableHead
							className="cursor-pointer"
							onClick={() => handleSortChange("price")}
						>
							Preis {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}
						</TableHead>
						<TableHead
							className="cursor-pointer"
							onClick={() => handleSortChange("stock")}
						>
							Lagerbestand{" "}
							{sortBy === "stock" && (sortOrder === "asc" ? "↑" : "↓")}
						</TableHead>
						<TableHead>Status</TableHead>
						<TableHead className="text-right">Aktionen</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{products.products.length === 0 ? (
						<TableRow>
							<TableCell colSpan={8} className="text-center py-4">
								Keine Produkte gefunden
							</TableCell>
						</TableRow>
					) : (
						products.products.map((product) => {
							const isSelected = selectedProducts.includes(product.id);
							const category = categories.find(
								(c) =>
									c.id === product.categoryId ||
									c.parentId === product.categoryId,
							);

							return (
								<TableRow
									key={product.id}
									className={isSelected ? "bg-primary/5" : ""}
								>
									<TableCell>
										<Checkbox
											checked={isSelected}
											onCheckedChange={() => toggleProductSelection(product.id)}
											aria-label={`Produkt ${product.name} auswählen`}
										/>
									</TableCell>
									<TableCell className="font-medium">{product.name}</TableCell>
									<TableCell>{product.artNr}</TableCell>
									<TableCell>
										{category && (
											<CategoryBadge
												name={category.name}
												color={category.color}
											/>
										)}
									</TableCell>
									<TableCell>
										{Number.parseFloat(
											product.price?.toString() || "0",
										).toFixed(2)}{" "}
										€/{product.unit}
									</TableCell>
									<TableCell>
										{product.stock} {product.unit}
									</TableCell>
									<TableCell>{renderStockBadge(product)}</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleViewProduct(product.id)}
											>
												<Eye className="h-4 w-4" />
												<span className="sr-only">Details</span>
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleEditProduct(product.id)}
											>
												<Edit className="h-4 w-4" />
												<span className="sr-only">Bearbeiten</span>
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleDeleteConfirm(product.id)}
											>
												<Trash2 className="h-4 w-4" />
												<span className="sr-only">Löschen</span>
											</Button>
										</div>
									</TableCell>
								</TableRow>
							);
						})
					)}
				</TableBody>
			</Table>
		);
	};

	// Funktion zum Rendern des Lagerbestand-Badges
	const renderStockBadge = (product: Product) => {
		const status = getInventoryStatus(product);

		switch (status) {
			case "out-of-stock":
				return <Badge variant="destructive">Nicht verfügbar</Badge>;
			case "low-stock":
				return <Badge variant="secondary">Niedriger Bestand</Badge>;
			case "in-stock":
				return (
					<Badge
						variant="outline"
						className="bg-green-50 text-green-700 border-green-200"
					>
						Verfügbar
					</Badge>
				);
			default:
				return null;
		}
	};

	// Funktion zum Rendern der Produktdetails
	const renderProductDetails = () => {
		if (!viewProduct) return null;

		const product = products.products.find((p) => p.id === viewProduct);
		if (!product) return null;

		const category = categories.find(
			(c) => c.id === product.categoryId || c.parentId === product.categoryId,
		);

		return (
			<Dialog open={!!viewProduct} onOpenChange={() => setViewProduct(null)}>
				<DialogContent className="max-w-3x">
					<DialogHeader>
						<DialogTitle>Produktdetails</DialogTitle>
						<DialogDescription>
							Detaillierte Informationen zum Produkt
						</DialogDescription>
					</DialogHeader>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-md:overflow-y-auto max-md:max-h-[60dvh]">
						<div>
							<h3 className="text-lg font-semibold mb-2">{product.name}</h3>
							<p className="text-sm text-muted-foreground mb-4">
								Art.-Nr.: {product.artNr}
							</p>

							{product.description && (
								<div className="mb-4">
									<h4 className="text-sm font-medium mb-1">Beschreibung</h4>
									<p className="text-sm">{product.description}</p>
								</div>
							)}

							<div className="grid grid-cols-2 gap-4 mb-4">
								<div>
									<h4 className="text-sm font-medium mb-1">Preis</h4>
									<p className="text-sm">
										{Number.parseFloat(
											product.price?.toString() || "0",
										).toFixed(2)}{" "}
										€/{product.unit}
									</p>
								</div>
								<div>
									<h4 className="text-sm font-medium mb-1">MwSt.</h4>
									<p className="text-sm">{product.taxRate || 19}%</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4 mb-4">
								<div>
									<h4 className="text-sm font-medium mb-1">Lagerbestand</h4>
									<p className="text-sm">
										{product.stock} {product.unit}
									</p>
								</div>
								<div>
									<h4 className="text-sm font-medium mb-1">Mindestbestand</h4>
									<p className="text-sm">
										{product.minStock || "-"} {product.unit}
									</p>
								</div>
							</div>

							{product.barcode && (
								<div className="mb-4">
									<h4 className="text-sm font-medium mb-1">Barcode</h4>
									<p className="text-sm font-mono">{product.barcode}</p>
								</div>
							)}

							<div className="mb-4">
								<h4 className="text-sm font-medium mb-1">Kategorie</h4>
								{category ? (
									<CategoryBadge name={category.name} color={category.color} />
								) : (
									<p className="text-sm">Keine Kategorie</p>
								)}
							</div>
						</div>

						<div>
							<div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center mb-4">
								<Package2 className="h-16 w-16 text-gray-400" />
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<h4 className="text-sm font-medium mb-1">Erstellt am</h4>
									<p className="text-sm">
										{new Date(product.createdAt).toLocaleDateString() || "-"}
									</p>
								</div>
								<div>
									<h4 className="text-sm font-medium mb-1">
										Letzte Aktualisierung
									</h4>
									<p className="text-sm">
										{new Date(product.updatedAt).toLocaleDateString() || "-"}
									</p>
								</div>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setViewProduct(null)}>
							Schließen
						</Button>
						<Button
							onClick={() => {
								setViewProduct(null);
								handleEditProduct(product.id);
							}}
						>
							Bearbeiten
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	};

	return (
		<AuthGuard requiredPermissions={["VIEW_PRODUCTS"]}>
			<div className="p-6 space-y-6">
				<header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
					<h1 className="text-2xl font-bold">Produkte</h1>
					<div className="flex flex-wrap gap-2">
						<Button onClick={() => setShowForm(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Neu
						</Button>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline">
									<Download className="h-4 w-4 mr-2" />
									Export
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem onClick={handleExportProducts}>
									Als CSV exportieren
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleExportProducts}>
									Als Excel exportieren
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleExportProducts}>
									Als PDF exportieren
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
						<Button variant="outline" onClick={handleImportProducts}>
							<Upload className="h-4 w-4 mr-2" />
							Import
						</Button>
					</div>
				</header>

				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
					<div className="flex flex-wrap gap-2 w-full md:w-auto">
						<div className="relative w-full md:w-64">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Suche..."
								className="pl-8 pr-8"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
							{searchTerm && (
								<Button
									variant="ghost"
									size="sm"
									className="absolute right-0 top-0 h-full px-3 py-0"
									onClick={() => setSearchTerm("")}
								>
									<X className="h-4 w-4" />
									<span className="sr-only">Suche löschen</span>
								</Button>
							)}
						</div>

						<Popover
							open={categoryPopoverOpen}
							onOpenChange={setCategoryPopoverOpen}
						>
							<PopoverTrigger asChild>
								<Button variant="outline" className="w-full md:w-auto">
									<Filter className="h-4 w-4 mr-2" />
									{categoryFilter
										? categories.find(
												(c) =>
													c.id === categoryFilter ||
													c.parentId === categoryFilter,
											)?.name || "Kategorie"
										: "Kategorie"}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-[300px] p-0" align="start">
								<div className="p-2">
									<Button
										variant="ghost"
										className="w-full justify-start mb-2"
										onClick={() => handleCategorySelect(null)}
									>
										Alle Kategorien
									</Button>
									<div className="max-h-[300px] overflow-y-auto">
										<CategoryTree
											categories={categories}
											onSelectCategory={(category) =>
												handleCategorySelect(category.id)
											}
											selectedCategoryId={categoryFilter}
										/>
									</div>
								</div>
							</PopoverContent>
						</Popover>

						<Select value={stockFilter} onValueChange={handleStockFilterChange}>
							<SelectTrigger className="w-full md:w-auto">
								<SelectValue placeholder="Lagerbestand" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Alle Produkte</SelectItem>
								<SelectItem value="in-stock">Verfügbar</SelectItem>
								<SelectItem value="low-stock">Niedriger Bestand</SelectItem>
								<SelectItem value="out-of-stock">Nicht verfügbar</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex flex-wrap gap-2 w-full md:w-auto">
						<Tabs
							value={viewType}
							onValueChange={(value) => setViewType(value as ViewType)}
							className="w-full md:w-auto"
						>
							<TabsList>
								<TabsTrigger value="grid">Kacheln</TabsTrigger>
								<TabsTrigger value="table">Tabelle</TabsTrigger>
							</TabsList>
						</Tabs>

						{selectedProducts.length > 0 && (
							<Button variant="destructive" onClick={handleBatchDelete}>
								<Trash2 className="h-4 w-4 mr-2" />
								{selectedProducts.length} löschen
							</Button>
						)}
					</div>
				</div>

				{isLoading ? (
					<div className="flex justify-center items-center py-12">
						<div className="flex flex-col items-center gap-2">
							<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
							<p className="text-sm text-muted-foreground">
								Produkte werden geladen...
							</p>
						</div>
					</div>
				) : (
					<>
						{products.totalCount === 0 ? (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<Package2 className="h-12 w-12 text-muted-foreground mb-4" />
								<h3 className="text-lg font-medium">Keine Produkte gefunden</h3>
								<p className="text-sm text-muted-foreground mt-1 mb-4">
									Es wurden keine Produkte gefunden, die den Filterkriterien
									entsprechen.
								</p>
								<Button
									onClick={() => {
										setSearchTerm("");
										setCategoryFilter(null);
										setStockFilter("all");
									}}
								>
									Filter zurücksetzen
								</Button>
							</div>
						) : (
							<>
								{viewType === "grid" ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
										{products.products.map(renderProductCard)}
									</div>
								) : (
									<Card>
										<CardContent className="p-0">
											{renderProductTable()}
										</CardContent>
									</Card>
								)}

								<div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-4">
									<div className="text-sm text-muted-foreground">
										Zeige {indexOfFirstItem + 1} bis{" "}
										{Math.min(indexOfLastItem, products.totalCount)} von{" "}
										{products.totalCount} Produkten
									</div>

									<div className="flex max-md:flex-wrap max-md:justify-center items-center gap-2">
										<Select
											value={itemsPerPage.toString()}
											onValueChange={handleItemsPerPageChange}
										>
											<SelectTrigger className="w-[120px]">
												<SelectValue placeholder="Einträge pro Seite" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="5">5 pro Seite</SelectItem>
												<SelectItem value="10">10 pro Seite</SelectItem>
												<SelectItem value="25">25 pro Seite</SelectItem>
												<SelectItem value="50">50 pro Seite</SelectItem>
												<SelectItem value="100">100 pro Seite</SelectItem>
											</SelectContent>
										</Select>

										{renderPagination()}
									</div>
								</div>
							</>
						)}
					</>
				)}

				{showForm && (
					<Dialog open={showForm} onOpenChange={setShowForm}>
						<DialogContent className="max-w-4xl">
							<DialogHeader>
								<DialogTitle>
									{editProduct ? "Produkt bearbeiten" : "Neues Produkt"}
								</DialogTitle>
							</DialogHeader>
							<ProductForm
								product={
									editProduct
										? products.products.find((p) => p.id === editProduct)
										: undefined
								}
								onCancel={() => {
									setShowForm(false);
									setEditProduct(null);
								}}
								onSave={handleSaveProduct}
							/>
						</DialogContent>
					</Dialog>
				)}

				{renderProductDetails()}

				<AuthGuard requiredPermissions={["DELETE_PRODUCTS"]}>
					<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Produkt löschen</DialogTitle>
								<DialogDescription>
									{deleteProductId
										? "Sind Sie sicher, dass Sie dieses Produkt löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
										: `Sind Sie sicher, dass Sie ${selectedProducts.length} Produkte löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`}
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => {
										setShowDeleteDialog(false);
										setDeleteProductId(null);
									}}
								>
									Abbrechen
								</Button>
								<Button variant="destructive" onClick={handleDeleteProduct}>
									Löschen
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</AuthGuard>
			</div>
		</AuthGuard>
	);
}
