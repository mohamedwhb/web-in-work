"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
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
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
	ArrowDown,
	ArrowUp,
	Calculator,
	Clipboard,
	Plus,
	Search,
	Tag,
	Trash2,
	X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// Produktdaten-Typ
export type Product = {
	id: number | string;
	name: string;
	artNr?: string;
	price: number;
	unit?: string;
	group?: string;
	stock?: number;
	description?: string;
	taxRate?: number;
};

// Artikel-Typ für die Formulare
export type ArticleItem = {
	id: number | string;
	product?: string;
	artNr?: string;
	quantity: number;
	price: number;
	total: number;
	name?: string;
	description?: string;
	unit?: string;
	taxRate?: number;
	discount?: number;
	position?: number;
};

interface ArticleManagementProps {
	items: ArticleItem[];
	onItemsChange: (items: ArticleItem[]) => void;
	products: Product[];
	readOnly?: boolean;
	showTax?: boolean;
	defaultTaxRate?: number;
	showDiscount?: boolean;
	showPositions?: boolean;
	allowReordering?: boolean;
	allowBatchInput?: boolean;
	showStock?: boolean;
	compact?: boolean;
	toast?: (props: {
		title: string;
		description: string;
		duration?: number;
	}) => void;
}

export function ArticleManagement({
	items,
	onItemsChange,
	products,
	readOnly = false,
	showTax = false,
	defaultTaxRate = 20,
	showDiscount = false,
	showPositions = true,
	allowReordering = true,
	allowBatchInput = true,
	showStock = true,
	compact = false,
	toast,
}: ArticleManagementProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [batchDialogOpen, setBatchDialogOpen] = useState(false);
	const [batchText, setBatchText] = useState("");
	const [batchError, setBatchError] = useState<string | null>(null);
	const [calculatorOpen, setCalculatorOpen] = useState(false);
	const [calculatorItem, setCalculatorItem] = useState<number | null>(null);
	const [calculatorValue, setCalculatorValue] = useState("");
	const [calculatorResult, setCalculatorResult] = useState<number | null>(null);

	// Filtern der Produkte basierend auf der Suche
	const filteredProducts =
		searchTerm.trim() === ""
			? products
			: products.filter((product) => {
					const searchLower = searchTerm.toLowerCase();
					return (
						product.name.toLowerCase().includes(searchLower) ||
						product.artNr?.toLowerCase().includes(searchLower) ||
						product.group?.toLowerCase().includes(searchLower) ||
						product.description?.toLowerCase().includes(searchLower)
					);
				});

	// Nächste ID für neue Artikel generieren
	const getNextId = () => {
		if (items.length === 0) return 1;
		const maxId = Math.max(
			...items.map((item) =>
				typeof item.id === "number"
					? item.id
					: Number.parseInt(item.id.toString(), 10),
			),
		);
		return maxId + 1;
	};

	// Nächste Position für neue Artikel generieren
	const getNextPosition = () => {
		if (items.length === 0) return 1;
		const maxPosition = Math.max(...items.map((item) => item.position || 0));
		return maxPosition + 10;
	};

	// Artikel hinzufügen
	const addItem = () => {
		const newItem: ArticleItem = {
			id: getNextId(),
			product: "",
			artNr: "",
			quantity: 1,
			price: 0,
			total: 0,
			unit: "Stück",
			taxRate: defaultTaxRate,
			discount: 0,
			position: getNextPosition(),
		};
		onItemsChange([...items, newItem]);
	};

	// Artikel entfernen
	const removeItem = (id: number | string) => {
		onItemsChange(items.filter((item) => item.id !== id));
	};

	// Artikel aktualisieren
	const updateItem = (
		id: number | string,
		field: keyof ArticleItem,
		value: string | number,
	) => {
		const updatedItems = items.map((item) => {
			if (item.id === id) {
				const updatedItem = { ...item, [field]: value };

				// Gesamtsumme neu berechnen
				if (field === "quantity" || field === "price" || field === "discount") {
					const quantity = field === "quantity" ? value : item.quantity;
					const price = field === "price" ? value : item.price;
					const discount = field === "discount" ? value : item.discount || 0;

					const discountedPrice = Number(price) * (1 - Number(discount) / 100);
					updatedItem.total = Number(quantity) * discountedPrice;
				}

				return updatedItem;
			}
			return item;
		});

		onItemsChange(updatedItems);
	};

	// Produkt auswählen
	const selectProduct = (itemId: number | string, product: Product) => {
		const updatedItems = items.map((item) => {
			if (item.id === itemId) {
				const updatedItem: ArticleItem = {
					...item,
					product: product.name,
					name: product.name,
					artNr: product.artNr || "",
					price: product.price,
					unit: product.unit || "Stück",
					description: product.description || "",
					taxRate: product.taxRate || defaultTaxRate,
				};

				// Gesamtsumme neu berechnen
				const discount = item.discount || 0;
				const discountedPrice = product.price * (1 - discount / 100);
				updatedItem.total = item.quantity * discountedPrice;

				return updatedItem;
			}
			return item;
		});

		onItemsChange(updatedItems);
	};

	// Neues Produkt hinzufügen
	const addProduct = (product: Product) => {
		// Prüfe, ob das Produkt bereits in der Liste ist
		const existingItemIndex = items.findIndex(
			(item) =>
				(item.product &&
					item.product.toLowerCase() === product.name.toLowerCase()) ||
				(item.name && item.name.toLowerCase() === product.name.toLowerCase()),
		);

		if (existingItemIndex >= 0) {
			// Wenn das Produkt bereits existiert, erhöhe die Menge
			const updatedItems = [...items];
			updatedItems[existingItemIndex].quantity += 1;
			updatedItems[existingItemIndex].total =
				updatedItems[existingItemIndex].quantity *
				updatedItems[existingItemIndex].price *
				(1 - (updatedItems[existingItemIndex].discount || 0) / 100);

			onItemsChange(updatedItems);

			// Zeige Feedback an
			toast?.({
				title: "Menge erhöht",
				description: `${product.name} wurde bereits hinzugefügt. Menge wurde erhöht.`,
				duration: 2000,
			});
		} else {
			// Neues Produkt hinzufügen
			const newItem: ArticleItem = {
				id: getNextId(),
				product: product.name,
				name: product.name,
				artNr: product.artNr || "",
				quantity: 1,
				price: product.price,
				total: product.price,
				unit: product.unit || "Stück",
				description: product.description || "",
				taxRate: product.taxRate || defaultTaxRate,
				discount: 0,
				position: getNextPosition(),
			};

			onItemsChange([...items, newItem]);
		}
	};

	// Artikel nach oben verschieben
	const moveItemUp = (index: number) => {
		if (index <= 0) return;

		const newItems = [...items];

		if (showPositions) {
			// Positionen tauschen
			const tempPosition = newItems[index].position;
			newItems[index].position = newItems[index - 1].position;
			newItems[index - 1].position = tempPosition;
		}
		// Elemente tauschen
		[newItems[index], newItems[index - 1]] = [
			newItems[index - 1],
			newItems[index],
		];

		onItemsChange(newItems);
	};

	// Artikel nach unten verschieben
	const moveItemDown = (index: number) => {
		if (index >= items.length - 1) return;

		const newItems = [...items];

		if (showPositions) {
			// Positionen tauschen
			const tempPosition = newItems[index].position;
			newItems[index].position = newItems[index + 1].position;
			newItems[index + 1].position = tempPosition;
		}
		// Elemente tauschen
		[newItems[index], newItems[index + 1]] = [
			newItems[index + 1],
			newItems[index],
		];

		onItemsChange(newItems);
	};

	// Tastaturkürzel für häufige Aktionen
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (readOnly) return;

			// Alt+N: Neuen Artikel hinzufügen
			if (e.altKey && e.key === "n") {
				e.preventDefault();
				addItem();
			}

			// Alt+S: Suche fokussieren
			if (e.altKey && e.key === "s") {
				e.preventDefault();
				const searchInput = document.querySelector(
					'input[placeholder="Produkt suchen..."]',
				) as HTMLInputElement;
				if (searchInput) {
					searchInput.focus();
				}
			}

			// Alt+B: Batch-Dialog öffnen
			if (e.altKey && e.key === "b" && allowBatchInput) {
				e.preventDefault();
				setBatchDialogOpen(true);
			}
		},
		[readOnly, allowBatchInput, addItem],
	);

	useEffect(() => {
		if (readOnly) return;

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [readOnly, handleKeyDown]);

	// Batch-Artikel hinzufügen
	const handleAddBatch = () => {
		if (!batchText.trim()) {
			setBatchError("Bitte geben Sie Artikel ein.");
			return;
		}

		try {
			// Nach Zeilen aufteilen
			const lines = batchText.split("\n").filter((line) => line.trim());

			// Jede Zeile parsen
			const newItems: ArticleItem[] = lines.map((line) => {
				// Format: "Menge x Produkt" oder nur "Produkt"
				const match =
					line.match(/^(\d+(?:[.,]\d+)?)\s*[xX]\s*(.+)$/) ||
					line.match(/^(.+)$/);

				if (!match) {
					throw new Error(`Konnte Zeile nicht verarbeiten: ${line}`);
				}

				let quantity = 1;
				let productName = "";

				if (match[2]) {
					// Format: "Menge x Produkt"
					quantity = Number.parseFloat(match[1].replace(",", "."));
					productName = match[2].trim();
				} else {
					// Format: nur "Produkt"
					productName = match[1].trim();
				}

				// Produkt in der Produktliste suchen
				const matchedProduct = products.find(
					(p) =>
						p.name.toLowerCase() === productName.toLowerCase() ||
						(p.artNr && p.artNr.toLowerCase() === productName.toLowerCase()),
				);

				if (matchedProduct) {
					return {
						id: getNextId() + Math.floor(Math.random() * 1000), // Eindeutige ID
						product: matchedProduct.name,
						name: matchedProduct.name,
						artNr: matchedProduct.artNr || "",
						quantity,
						price: matchedProduct.price,
						total: matchedProduct.price * quantity,
						unit: matchedProduct.unit || "Stück",
						description: matchedProduct.description || "",
						taxRate: matchedProduct.taxRate || defaultTaxRate,
						discount: 0,
						position: getNextPosition() + Math.floor(Math.random() * 1000), // Eindeutige Position
					};
				}

				// Wenn kein Produkt gefunden wurde, generisches Produkt erstellen
				return {
					id: getNextId() + Math.floor(Math.random() * 1000), // Eindeutige ID
					product: productName,
					name: productName,
					artNr: "",
					quantity,
					price: 0,
					total: 0,
					unit: "Stück",
					taxRate: defaultTaxRate,
					discount: 0,
					position: getNextPosition() + Math.floor(Math.random() * 1000), // Eindeutige Position
				};
			});

			// Neue Artikel hinzufügen und IDs und Positionen korrigieren
			const updatedItems = [...items, ...newItems].map((item, index) => ({
				...item,
				id:
					typeof item.id === "number"
						? item.id
						: Number.parseInt(item.id.toString(), 10),
				position: showPositions ? (index + 1) * 10 : undefined,
			}));

			onItemsChange(updatedItems);
			setBatchText("");
			setBatchError(null);
			setBatchDialogOpen(false);
		} catch (err) {
			setBatchError(
				err instanceof Error
					? err.message
					: "Fehler beim Verarbeiten der Artikel",
			);
		}
	};

	// Taschenrechner-Funktion
	const calculateValue = () => {
		try {
			// Replace eval with a safer calculation function
			const sanitizedValue = calculatorValue.replace(/,/g, ".");
			const result = Function(`"use strict";return (${sanitizedValue})`)();
			setCalculatorResult(result);

			if (calculatorItem !== null) {
				updateItem(items[calculatorItem].id, "quantity", result);
				setCalculatorOpen(false);
				setCalculatorValue("");
				setCalculatorResult(null);
				setCalculatorItem(null);
			}
		} catch (error) {
			setCalculatorResult(null);
		}
	};

	// Artikel in die Zwischenablage kopieren
	const copyItemsToClipboard = () => {
		const text = items
			.map(
				(item) =>
					`${item.quantity} x ${
						item.product || item.name || ""
					} (${item.price.toFixed(2)} €)`,
			)
			.join("\n");

		navigator.clipboard.writeText(text).then(() => {
			// Erfolg-Feedback hier einfügen, falls gewünscht
		});
	};

	return (
		<div className="space-y-4">
			{!readOnly && (
				<div className="flex flex-col gap-4 mb-4">
					<div className="flex flex-wrap gap-2">
						<div className="relative flex-1 min-w-[200px]">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Produkt suchen..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-8 pr-8"
								onKeyDown={(e) => {
									if (e.key === "Enter" && filteredProducts.length > 0) {
										e.preventDefault();
										addProduct(filteredProducts[0]);
										setSearchTerm("");
									}
								}}
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

						<div className="flex gap-2 flex-wrap">
							<Button
								variant="outline"
								onClick={addItem}
								className="whitespace-nowrap"
							>
								<Plus className="h-4 w-4 mr-2" />
								Leere Position
							</Button>

							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="outline"
											size="icon"
											onClick={copyItemsToClipboard}
										>
											<Clipboard className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>Artikel in die Zwischenablage kopieren</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>

							{allowBatchInput && (
								<Dialog
									open={batchDialogOpen}
									onOpenChange={setBatchDialogOpen}
								>
									<DialogTrigger asChild>
										<Button variant="outline" className="whitespace-nowrap">
											<Clipboard className="h-4 w-4 mr-2" />
											Mehrere Artikel
										</Button>
									</DialogTrigger>
									<DialogContent className="sm:max-w-[500px]">
										<DialogHeader>
											<DialogTitle>Mehrere Artikel einfügen</DialogTitle>
											<DialogDescription>
												Geben Sie jeden Artikel in einer neuen Zeile ein.
												Format: "Menge x Produkt" oder nur "Produkt"
											</DialogDescription>
										</DialogHeader>
										<div className="space-y-4 py-4">
											<div className="space-y-2">
												<Textarea
													value={batchText}
													onChange={(e) => setBatchText(e.target.value)}
													placeholder="2 x Mango&#10;1 x Avocado&#10;Kartoffel"
													className="min-h-[200px]"
												/>
												{batchError && (
													<p className="text-sm text-destructive">
														{batchError}
													</p>
												)}
											</div>
											<div className="text-sm text-muted-foreground">
												<p>Beispiele:</p>
												<ul className="list-disc pl-4">
													<li>2 x Mango</li>
													<li>1,5 x Kartoffel</li>
													<li>Avocado (Menge wird auf 1 gesetzt)</li>
												</ul>
											</div>
										</div>
										<DialogFooter>
											<Button onClick={handleAddBatch} className="w-full">
												Artikel hinzufügen
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							)}
						</div>
					</div>

					{!readOnly && (
						<div className="text-xs text-muted-foreground mb-2">
							<span className="font-semibold">Tastaturkürzel:</span> Alt+N (Neue
							Position), Alt+S (Suche fokussieren), Alt+B (Mehrere Artikel)
						</div>
					)}

					{searchTerm && (
						<div className="border rounded-md overflow-hidden">
							<div className="max-h-[300px] overflow-y-auto">
								{filteredProducts.length === 0 ? (
									<div className="p-4 text-center text-muted-foreground">
										Keine Produkte gefunden
										<Button
											variant="link"
											className="ml-2"
											onClick={() => {
												// Füge ein neues Produkt mit dem Suchbegriff als Namen hinzu
												const newProduct = {
													id: `new-${Date.now()}`,
													name: searchTerm,
													artNr: "",
													price: 0,
													unit: "Stück",
												};
												addProduct(newProduct);
												setSearchTerm("");
											}}
										>
											Neues Produkt "{searchTerm}" erstellen
										</Button>
									</div>
								) : (
									<div className="grid grid-cols-1 divide-y">
										{filteredProducts.map((product) => (
											<div
												key={product.id}
												className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer w-full text-left"
												onClick={() => {
													addProduct(product);
													setSearchTerm("");
												}}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														e.preventDefault();
														addProduct(product);
														setSearchTerm("");
													}
												}}
											>
												<div className="flex flex-col">
													<div className="font-medium">{product.name}</div>
													<div className="text-xs text-muted-foreground">
														{product.artNr && `Art.-Nr.: ${product.artNr} | `}
														{Number(product.price).toFixed(2)} € /{" "}
														{product.unit || "Stück"}
														{showStock &&
															product.stock !== undefined &&
															` | Bestand: ${product.stock}`}
													</div>
												</div>
												<div className="flex items-center gap-2">
													{product.group && (
														<Badge variant="outline" className="ml-2">
															<Tag className="h-3 w-3 mr-1" />
															{product.group}
														</Badge>
													)}
													<Button
														variant="ghost"
														size="sm"
														className="h-8 w-8 p-0"
														onClick={(e) => {
															e.stopPropagation();
															// Schnellhinzufügen mit Menge 1
															const newItem = {
																id: getNextId(),
																product: product.name,
																name: product.name,
																artNr: product.artNr || "",
																quantity: 1,
																price: product.price,
																total: product.price,
																unit: product.unit || "Stück",
																description: product.description || "",
																taxRate: product.taxRate || defaultTaxRate,
																discount: 0,
																position: getNextPosition(),
															};
															onItemsChange([...items, newItem]);
														}}
													>
														<Plus className="h-4 w-4" />
													</Button>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			)}

			{items.length === 0 ? (
				<div className="text-center py-8 border rounded-md bg-muted/20">
					<p className="text-muted-foreground">Keine Artikel vorhanden</p>
					{!readOnly && (
						<Button variant="outline" className="mt-2" onClick={addItem}>
							<Plus className="h-4 w-4 mr-2" />
							Artikel hinzufügen
						</Button>
					)}
				</div>
			) : (
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								{showPositions && <TableHead className="w-16">Pos.</TableHead>}
								<TableHead>Artikel</TableHead>
								{!compact && <TableHead>Beschreibung</TableHead>}
								<TableHead className="w-24">Menge</TableHead>
								{!compact && <TableHead className="w-24">Einheit</TableHead>}
								<TableHead className="w-32">Einzelpreis</TableHead>
								{showDiscount && (
									<TableHead className="w-24">Rabatt %</TableHead>
								)}
								{showTax && <TableHead className="w-24">MwSt. %</TableHead>}
								<TableHead className="w-32">Gesamt</TableHead>
								{!readOnly && (
									<TableHead className="w-24 text-right">
										<span className="sr-only">Aktionen</span>
									</TableHead>
								)}
							</TableRow>
						</TableHeader>
						<TableBody>
							{items.map((item, index) => (
								<TableRow key={item.id}>
									{showPositions && (
										<TableCell>{item.position || (index + 1) * 10}</TableCell>
									)}
									<TableCell>
										{readOnly ? (
											<div>
												<div>
													{item.product || item.name || "Unbenannter Artikel"}
												</div>
												<div className="text-xs text-muted-foreground">
													{item.artNr && `Art.-Nr.: ${item.artNr}`}
												</div>
											</div>
										) : (
											<Popover>
												<PopoverTrigger asChild>
													<Button
														variant="outline"
														className="w-full justify-start"
													>
														<div className="truncate text-left">
															{item.product || item.name || "Artikel auswählen"}
															{item.artNr && (
																<div className="text-xs text-muted-foreground">
																	Art.-Nr.: {item.artNr}
																</div>
															)}
														</div>
													</Button>
												</PopoverTrigger>
												<PopoverContent className="w-[300px] p-0">
													<Command>
														<CommandInput placeholder="Produkt suchen..." />
														<CommandList>
															<CommandEmpty>
																Keine Produkte gefunden
															</CommandEmpty>
															<CommandGroup>
																<ScrollArea className="h-[200px]">
																	{products.map((product) => (
																		<CommandItem
																			key={product.id}
																			value={`${product.name}-${
																				product.artNr || ""
																			}`}
																			onSelect={() =>
																				selectProduct(item.id, product)
																			}
																		>
																			<div className="flex flex-col">
																				<span>{product.name}</span>
																				<span className="text-xs text-muted-foreground">
																					{product.artNr &&
																						`Art.-Nr.: ${product.artNr} | `}
																					{Number(product.price).toFixed(2)} € /{" "}
																					{product.unit || "Stück"}
																					{showStock &&
																						product.stock !== undefined &&
																						` | Bestand: ${product.stock}`}
																				</span>
																			</div>
																		</CommandItem>
																	))}
																</ScrollArea>
															</CommandGroup>
														</CommandList>
													</Command>
												</PopoverContent>
											</Popover>
										)}
									</TableCell>

									{!compact && (
										<TableCell>
											{readOnly ? (
												item.description
											) : (
												<Input
													value={item.description || ""}
													onChange={(e) =>
														updateItem(item.id, "description", e.target.value)
													}
													placeholder="Beschreibung"
												/>
											)}
										</TableCell>
									)}

									<TableCell>
										{readOnly ? (
											item.quantity
										) : (
											<div className="flex items-center">
												<Input
													type="number"
													min="0"
													step="0.01"
													value={item.quantity}
													onChange={(e) =>
														updateItem(
															item.id,
															"quantity",
															Number.parseFloat(e.target.value) || 0,
														)
													}
													className="w-16"
												/>
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8"
																onClick={() => {
																	setCalculatorItem(index);
																	setCalculatorOpen(true);
																}}
															>
																<Calculator className="h-4 w-4" />
															</Button>
														</TooltipTrigger>
														<TooltipContent>
															<p>Taschenrechner</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</div>
										)}
									</TableCell>

									{!compact && (
										<TableCell>
											{readOnly ? (
												item.unit || "Stück"
											) : (
												<Input
													value={item.unit || "Stück"}
													onChange={(e) =>
														updateItem(item.id, "unit", e.target.value)
													}
													className="w-20"
												/>
											)}
										</TableCell>
									)}

									<TableCell>
										{readOnly ? (
											`${item.price.toFixed(2)} €`
										) : (
											<div className="flex items-center">
												<Input
													type="number"
													min="0"
													step="0.01"
													value={item.price}
													onChange={(e) =>
														updateItem(
															item.id,
															"price",
															Number.parseFloat(e.target.value) || 0,
														)
													}
													className="w-24"
												/>
												<span className="ml-1">€</span>
											</div>
										)}
									</TableCell>

									{showDiscount && (
										<TableCell>
											{readOnly ? (
												`${item.discount || 0}%`
											) : (
												<div className="flex items-center">
													<Input
														type="number"
														min="0"
														max="100"
														step="0.1"
														value={item.discount || 0}
														onChange={(e) =>
															updateItem(
																item.id,
																"discount",
																Number.parseFloat(e.target.value) || 0,
															)
														}
														className="w-16"
													/>
													<span className="ml-1">%</span>
												</div>
											)}
										</TableCell>
									)}

									{showTax && (
										<TableCell>
											{readOnly ? (
												`${item.taxRate || defaultTaxRate}%`
											) : (
												<div className="flex items-center">
													<Input
														type="number"
														min="0"
														max="100"
														step="1"
														value={item.taxRate || defaultTaxRate}
														onChange={(e) =>
															updateItem(
																item.id,
																"taxRate",
																Number.parseFloat(e.target.value) ||
																	defaultTaxRate,
															)
														}
														className="w-16"
													/>
													<span className="ml-1">%</span>
												</div>
											)}
										</TableCell>
									)}

									<TableCell>{item.total.toFixed(2)} €</TableCell>

									{!readOnly && (
										<TableCell className="text-right">
											<div className="flex justify-end">
												{allowReordering && (
													<>
														<TooltipProvider>
															<Tooltip>
																<TooltipTrigger asChild>
																	<Button
																		variant="ghost"
																		size="icon"
																		onClick={() => moveItemUp(index)}
																		disabled={index === 0}
																		className={cn(
																			"h-8 w-8",
																			index === 0 && "opacity-50",
																		)}
																	>
																		<ArrowUp className="h-4 w-4" />
																	</Button>
																</TooltipTrigger>
																<TooltipContent>
																	<p>Nach oben</p>
																</TooltipContent>
															</Tooltip>
														</TooltipProvider>

														<TooltipProvider>
															<Tooltip>
																<TooltipTrigger asChild>
																	<Button
																		variant="ghost"
																		size="icon"
																		onClick={() => moveItemDown(index)}
																		disabled={index === items.length - 1}
																		className={cn(
																			"h-8 w-8",
																			index === items.length - 1 &&
																				"opacity-50",
																		)}
																	>
																		<ArrowDown className="h-4 w-4" />
																	</Button>
																</TooltipTrigger>
																<TooltipContent>
																	<p>Nach unten</p>
																</TooltipContent>
															</Tooltip>
														</TooltipProvider>
													</>
												)}

												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																onClick={() => removeItem(item.id)}
																className="h-8 w-8 text-destructive"
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</TooltipTrigger>
														<TooltipContent>
															<p>Entfernen</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</div>
										</TableCell>
									)}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			{/* Taschenrechner-Dialog */}
			<Dialog open={calculatorOpen} onOpenChange={setCalculatorOpen}>
				<DialogContent className="sm:max-w-[400px]">
					<DialogHeader>
						<DialogTitle>Taschenrechner</DialogTitle>
						<DialogDescription>
							Geben Sie eine Berechnung ein (z.B. 2+3*4)
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="calculator-input">Berechnung</Label>
							<div className="flex gap-2">
								<Input
									id="calculator-input"
									value={calculatorValue}
									onChange={(e) => setCalculatorValue(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											calculateValue();
										}
									}}
								/>
								<Button onClick={calculateValue}>=</Button>
							</div>
						</div>
						{calculatorResult !== null && (
							<div className="p-2 bg-muted rounded-md">
								<p className="font-mono">Ergebnis: {calculatorResult}</p>
							</div>
						)}
					</div>
					<DialogFooter>
						<Button
							onClick={() => {
								if (calculatorResult !== null && calculatorItem !== null) {
									updateItem(
										items[calculatorItem].id,
										"quantity",
										calculatorResult,
									);
								}
								setCalculatorOpen(false);
								setCalculatorValue("");
								setCalculatorResult(null);
								setCalculatorItem(null);
							}}
						>
							Übernehmen
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
