"use client";

import { DateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/hooks/use-toast";
import {
	ArrowUpDown,
	FileDown,
	Filter,
	Grid,
	Mail,
	Printer,
	Table,
	Trash2,
	Truck,
} from "lucide-react";
import type { Dispatch, JSX, RefObject, SetStateAction } from "react";
import { useReactToPrint } from "react-to-print";

export type ViewMode = "list" | "grid" | "compact";

// Define filter state type
type FilterState = {
	status: string | null;
	dateRange: {
		from: Date | undefined;
		to: Date | undefined;
	} | null;
	search: string;
	sortBy: "date" | "deliveryDate" | "id" | "customer" | "total" | "lastUpdated";
	sortOrder: "asc" | "desc";
	shippingMethod: string | null;
	minTotal: number | null;
	maxTotal: number | null;
	processor: string | null;
};

type Props = {
	// searchParams: ReadonlyURLSearchParams;
	// setFilters: Dispatch<SetStateAction<any>>;
	// filters: any;
	DeliveryNoteToolbarItems: {
		id: string;
		column: string;
		label: string;
	}[];
	// setCurrentPage: Dispatch<SetStateAction<number>>;
	handleSortChange: (column: any) => void;
	documents: any[];
	setVisibleColumns: Dispatch<SetStateAction<string[]>>;
	visibleColumns: string[];
	viewMode: ViewMode;
	setViewMode: Dispatch<SetStateAction<ViewMode>>;
	selectedItems: string[];
	setShowStatusDialog: Dispatch<SetStateAction<boolean>>;
	setShowDeleteDialog: Dispatch<SetStateAction<boolean>>;
	setShowExportDialog: Dispatch<SetStateAction<boolean>>;
	handleBatchEmail: () => void;
	query: any;
	setQuery: Dispatch<SetStateAction<any>>;
	PrintComponent: JSX.Element;
	printableRef: RefObject<any>;
	documentsToPrint: any[];
};

export default function DeliveryNoteToolbar({
	// searchParams,
	// setFilters,
	// filters,
	// setCurrentPage,
	handleSortChange,
	documents,
	query,
	setQuery,
	setVisibleColumns,
	visibleColumns,
	viewMode,
	setViewMode,
	DeliveryNoteToolbarItems,
	selectedItems,
	setShowStatusDialog,
	setShowDeleteDialog,
	setShowExportDialog,
	handleBatchEmail,
	PrintComponent,
	printableRef,
	documentsToPrint,
}: Props) {
	const { toast } = useToast();
	// List of processors for filtering
	const processors = [...new Set(documents.map((doc) => doc.processor))];

	// Handle filter changes
	const handleFilterChange = (key: keyof FilterState, value: any) => {
		setQuery((prev: any) => ({ ...prev, page: 1, [key]: value }));
	};

	const resetAllFilters = () => {
		setQuery((prev) => ({
			page: 1,
			limit: 10,
			status: "all",
			sort: "date",
			order: "desc",
			search: "",
			dateRange: {
				from: undefined,
				to: undefined,
			},
		}));
	};

	const toggleColumnVisibility = (column: string) => {
		setVisibleColumns((prev) =>
			prev.includes(column)
				? prev.filter((col) => col !== column)
				: [...prev, column],
		);
	};

	const handlePrint = useReactToPrint({
		contentRef: printableRef.current,
		onAfterPrint: () => {
			toast({
				title: "Print job sent",
				description: `${documentsToPrint.length} offers printed successfully.`,
			});
			return;
		},
	});

	return (
		<>
			<div style={{ display: "none" }}>{PrintComponent}</div>

			<div className="flex flex-wrap gap-2 w-full sm:w-auto">
				<DateRangePicker
					dateRange={query.dateRange || undefined}
					onDateRangeChange={(range) => handleFilterChange("dateRange", range)}
				/>

				<Sheet>
					<SheetTrigger asChild>
						<Button variant="outline" size="sm">
							<Filter className="h-4 w-4 mr-2" />
							Erweiterte Filter
						</Button>
					</SheetTrigger>
					<SheetContent>
						<SheetHeader>
							<SheetTitle>Erweiterte Filter</SheetTitle>
							<SheetDescription>
								Filtern Sie die Lieferscheine nach verschiedenen Kriterien.
							</SheetDescription>
						</SheetHeader>
						<div className="py-4 space-y-4">
							<div className="space-y-2">
								<h3 className="text-sm font-medium">Versandart</h3>
								<Select
									value={query.shippingMethod || "all"}
									onValueChange={(value) =>
										handleFilterChange(
											"shippingMethod",
											value === "all" ? null : value,
										)
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Alle Versandarten" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Alle Versandarten</SelectItem>
										<SelectItem value="standard">Standard</SelectItem>
										<SelectItem value="express">Express</SelectItem>
										<SelectItem value="pickup">Selbstabholung</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<h3 className="text-sm font-medium">Bearbeiter</h3>
								<Select
									value={query.processor || "all"}
									onValueChange={(value) =>
										handleFilterChange(
											"processor",
											value === "all" ? null : value,
										)
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Alle Bearbeiter" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Alle Bearbeiter</SelectItem>
										{processors.map((processor) => (
											<SelectItem key={processor} value={processor}>
												{processor}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<h3 className="text-sm font-medium">Preisbereich</h3>
								<div className="flex gap-2">
									<div className="flex-1">
										<Input
											type="number"
											placeholder="Min €"
											value={query.minTotal !== null ? query.minTotal : ""}
											onChange={(e) =>
												handleFilterChange(
													"minTotal",
													e.target.value ? Number(e.target.value) : null,
												)
											}
										/>
									</div>
									<div className="flex-1">
										<Input
											type="number"
											placeholder="Max €"
											value={query.maxTotal !== null ? query.maxTotal : ""}
											onChange={(e) =>
												handleFilterChange(
													"maxTotal",
													e.target.value ? Number(e.target.value) : null,
												)
											}
										/>
									</div>
								</div>
							</div>

							<div className="space-y-2">
								<h3 className="text-sm font-medium">Spalten anzeigen</h3>
								<div className="space-y-2">
									{DeliveryNoteToolbarItems.map(({ id, column, label }) => (
										<div className="flex items-center space-x-2" key={id}>
											<Checkbox
												id={id}
												checked={visibleColumns.includes(column)}
												onCheckedChange={() => toggleColumnVisibility(column)}
											/>
											<label htmlFor={id} className="text-sm">
												{label}
											</label>
										</div>
									))}
								</div>
							</div>
						</div>
						<SheetFooter>
							<Button variant="outline" onClick={resetAllFilters}>
								Filter zurücksetzen
							</Button>
							<SheetClose asChild>
								<Button>Anwenden</Button>
							</SheetClose>
						</SheetFooter>
					</SheetContent>
				</Sheet>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="sm">
							<ArrowUpDown className="h-4 w-4 mr-2" />
							Sortieren
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{DeliveryNoteToolbarItems.map(({ label, column, id }) => (
							<DropdownMenuItem
								key={id}
								onClick={() => handleSortChange(column)}
							>
								{label}{" "}
								{query.sort === column && (query.order === "asc" ? "↑" : "↓")}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="sm">
							{viewMode === "list" ? (
								<Table className="h-4 w-4 mr-2" />
							) : viewMode === "grid" ? (
								<Grid className="h-4 w-4 mr-2" />
							) : (
								<Table className="h-4 w-4 mr-2" />
							)}
							Ansicht
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuRadioGroup
							value={viewMode}
							onValueChange={(value) => setViewMode(value as ViewMode)}
						>
							<DropdownMenuRadioItem value="list">
								<Table className="h-4 w-4 mr-2" />
								Liste
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="grid">
								<Grid className="h-4 w-4 mr-2" />
								Kacheln
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="compact">
								<Table className="h-4 w-4 mr-2" />
								Kompakt
							</DropdownMenuRadioItem>
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>

				{selectedItems.length > 0 && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="default" size="sm">
								Aktionen ({selectedItems.length})
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => setShowStatusDialog(true)}>
								<Truck className="h-4 w-4 mr-2" />
								Status ändern
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									console.log("Export");
									setShowExportDialog(true);
								}}
							>
								<FileDown className="h-4 w-4 mr-2" />
								Exportieren
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Button
									onClick={handlePrint}
									className="flex items-center w-full"
									disabled={documentsToPrint.length === 0}
								>
									<Printer className="h-4 w-4 mr-2" />
									Drucken
								</Button>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={handleBatchEmail}>
								<Mail className="h-4 w-4 mr-2" />
								E-Mail senden
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => setShowDeleteDialog(true)}
								className="text-destructive"
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Löschen
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>
		</>
	);
}
