"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type * as z from "zod";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getAllCategories } from "@/lib/category-service";
import { updateProductSchema } from "@/schemas/product-schema";
import type { Category, Product } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { AuthGuard } from "./auth-guard";

type ProductFormProps = {
	product?: Product;
	onCancel: () => void;
	onSave: (product: any) => void;
};

export default function ProductForm({
	product,
	onCancel,
	onSave,
}: ProductFormProps) {
	const isEdit = !!product;
	const [isLoading, setIsLoading] = useState(false);
	const [categories, setCategories] = useState<Category[]>([]);
	// Initialize form with default values or product data
	const form = useForm<z.infer<typeof updateProductSchema>>({
		resolver: zodResolver(updateProductSchema),
		defaultValues: {
			name: product?.name || "",
			artNr: product?.artNr || "",
			category: product?.categoryId || "",
			unit: product?.unit || "kg",
			price: product?.price ? Number(product.price) : 0,
			stock: product?.stock || 0,
			minStock: product?.minStock || 5,
			description: product?.description || "",
			barcode: product?.barcode || "",
		},
	});

	// Fetch categories
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				setIsLoading(true);
				const data = await getAllCategories();
				setCategories(data);
			} catch (error) {
				console.error("Error fetching categories:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchCategories();
	}, []);

	// Handle form submission
	const onSubmit = (data: z.infer<typeof updateProductSchema>) => {
		// Submit form
		onSave({
			...product,
			...data,
		});
	};

	// Format category name with indentation based on level
	const formatCategoryName = (category: Category & { level: number }) => {
		const indent = "—".repeat(category.level);
		return category.level > 0 ? `${indent} ${category.name}` : category.name;
	};

	// Berechne Pfade für Kategorien und sortiere sie hierarchisch
	const sortedCategories = [...categories]
		.map((category) => {
			// Finde alle Elternkategorien
			let currentCat = category;
			let path = category.name;
			let level = 0;

			// Suche nach Elternkategorien, um den Pfad zu erstellen
			while (currentCat.parentId) {
				const parentCat = categories.find((c) => c.id === currentCat.parentId);
				if (parentCat) {
					path = `${parentCat.name} > ${path}`;
					currentCat = parentCat;
					level++;
				} else {
					break;
				}
			}

			return {
				...category,
				path,
				level,
			};
		})
		.sort((a, b) => {
			// Sortiere zuerst nach Ebene, dann nach Name
			if (a.level !== b.level) {
				return a.level - b.level;
			}
			return a.name.localeCompare(b.name);
		});

	return (
		<AuthGuard
			requiredPermissions={isEdit ? ["EDIT_PRODUCTS"] : ["CREATE_PRODUCTS"]}
		>
			<Card>
				<CardHeader>
					<CardTitle>
						{isEdit ? "Produkt bearbeiten" : "Produkt hinzufügen"}
					</CardTitle>
				</CardHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<CardContent className="max-md:overflow-y-auto max-md:max-h-[50dvh]">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Name *</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="artNr"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Artikel-Nr. *</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="barcode"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Barcode</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="category"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Kategorie *</FormLabel>
											{isLoading ? (
												<div className="flex items-center space-x-2">
													<Loader2 className="h-4 w-4 animate-spin" />
													<span className="text-sm text-muted-foreground">
														Kategorien werden geladen...
													</span>
												</div>
											) : (
												<Select
													onValueChange={field.onChange}
													value={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Kategorie auswählen" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{sortedCategories.map((category) => (
															<SelectItem key={category.id} value={category.id}>
																<div className="flex items-center gap-2">
																	<div
																		className="w-3 h-3 rounded-full"
																		style={{ backgroundColor: category.color }}
																	/>
																	<span
																		className={category.level > 0 ? "ml-4" : ""}
																	>
																		{formatCategoryName(category)}
																	</span>
																</div>
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											)}
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="unit"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Einheit</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Einheit auswählen" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="kg">Kg</SelectItem>
													<SelectItem value="gramm">Gramm</SelectItem>
													<SelectItem value="stück">Stück</SelectItem>
													<SelectItem value="bund">Bund</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="price"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Preis Netto</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.01"
													{...field}
													onChange={(e) =>
														field.onChange(Number.parseFloat(e.target.value))
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="stock"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Lagerbestand</FormLabel>
											<FormControl>
												<Input
													type="number"
													{...field}
													onChange={(e) =>
														field.onChange(Number.parseInt(e.target.value))
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="minStock"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Mindestbestand</FormLabel>
											<FormControl>
												<Input
													type="number"
													{...field}
													onChange={(e) =>
														field.onChange(Number.parseInt(e.target.value))
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem className="md:col-span-2">
											<FormLabel>Beschreibung</FormLabel>
											<FormControl>
												<Textarea {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</CardContent>
						<CardFooter className="flex justify-between">
							<Button variant="outline" onClick={onCancel} type="button">
								Schließen
							</Button>
							<Button type="submit">Speichern</Button>
						</CardFooter>
					</form>
				</Form>
			</Card>
		</AuthGuard>
	);
}
