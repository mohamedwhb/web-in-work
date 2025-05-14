"use client";

import {
	type ArticleItem,
	ArticleManagement,
	type Product,
} from "@/components/article-management";
import AutosaveIndicator from "@/components/autosave-indicator";
import DocumentPreview from "@/components/document-preview";
import EmailDialog from "@/components/email-dialog";
import PdfPreview from "@/components/pdf-preview";
import RestoreAutosaveDialog from "@/components/restore-autosave-dialog";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAutosave } from "@/hooks/use-autosave";
import { useToast } from "@/hooks/use-toast";
import { getCompanyInfoForDocuments } from "@/lib/company-service";
import type { DocumentData, DocumentType } from "@/lib/pdf-generator";
import type { Customer } from "@prisma/client";
import { FileDown, Mail, Save } from "lucide-react";
import { useEffect, useState } from "react";

type FormState = {
	betreff: string;
	datum: string;
	leistungszeitraum: string;
	referenz: string;
	bearbeiter: string;
	kunde: string;
	customerNumber: string;
	uid: string;
	steuer: string;
	street: string;
	items: ArticleItem[];
	email: string;
	status: "OPEN" | "ACCEPTED" | "REJECTED";
	statusDate: string;
	statusNote: string;
};

type DocumentFormProps = {
	type: DocumentType;
	onCancel: () => void;
	onSave: (data: DocumentData) => void;
	initialData?: FormState;
};

// Initial form state
const getInitialFormState = (type: DocumentType): FormState => ({
	betreff: `${
		type === "angebot"
			? "Angebot"
			: type === "rechnung"
				? "Rechnung"
				: "Lieferschein"
	} 2025-123456`,
	datum: new Date().toISOString().split("T")[0],
	leistungszeitraum: "",
	referenz: "",
	bearbeiter: "mohamed",
	kunde: "",
	customerNumber: "",
	uid: "",
	steuer: "",
	street: "",
	items: [],
	email: "",
	status: "OPEN",
	statusDate: new Date().toISOString().split("T")[0],
	statusNote: "",
	bankRecipient: "",
	bankInstitute: "",
	bankIban: "",
	bankBic: "",
	bankReference: "",
});

export default function DocumentForm({
	type,
	onCancel,
	onSave,
	initialData,
}: DocumentFormProps) {
	const [formState, setFormState] = useState<FormState>(
		initialData || getInitialFormState(type),
	);
	const [showPreview, setShowPreview] = useState(false);
	const [showPdfPreview, setShowPdfPreview] = useState(false);
	const [showEmailDialog, setShowEmailDialog] = useState(false);
	const [showRestoreDialog, setShowRestoreDialog] = useState(false);
	const [savedData, setSavedData] = useState<{
		data: FormState;
		timestamp: Date;
	} | null>(null);
	const { toast } = useToast();

	// State for customers and products
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const companyInfo = getCompanyInfoForDocuments();

	// Fetch customers and products
	useEffect(() => {
		const fetchData = async () => {
			try {
				// Fetch customers
				const customersRes = await fetch("/api/customers?limit=100");
				const customersData = await customersRes.json();
				setCustomers(customersData.customers);

				// Fetch products
				const productsRes = await fetch("/api/products?limit=100");
				const productsData = await productsRes.json();
				setProducts(productsData.products);
			} catch (error) {
				console.error("Error fetching data:", error);
				toast({
					title: "Fehler beim Laden",
					description: "Die Daten konnten nicht geladen werden.",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [toast]);

	const documentTitle = {
		angebot: "Angebot",
		rechnung: "Rechnung",
		lieferschein: "Lieferschein",
	}[type];

	const addressLabel =
		type === "lieferschein" ? "Lieferadresse" : "Rechnungsadresse";

	// Set up autosave
	const { lastSaved, isSaving, getSavedData, clearSavedData, save } =
		useAutosave({
			key: `document-form-${type}`,
			data: formState,
			interval: 10000, // Autosave every 10 seconds
			onSave: () => {
				// Optional callback when save occurs
			},
		});

	// Check for saved data on mount
	useEffect(() => {
		const saved = getSavedData();
		if (saved) {
			setSavedData(saved);
			setShowRestoreDialog(true);
		}
	}, [getSavedData]);

	// Handle form input changes
	const handleInputChange = (field: string, value: string) => {
		setFormState((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	// Handle items change
	const handleItemsChange = (items: ArticleItem[]) => {
		setFormState((prev) => ({
			...prev,
			items,
		}));
	};

	// Handle restore from autosave
	const handleRestore = () => {
		if (savedData) {
			setFormState(savedData.data);
			setShowRestoreDialog(false);
			toast({
				title: "Daten wiederhergestellt",
				description:
					"Ihre automatisch gespeicherten Daten wurden erfolgreich wiederhergestellt.",
			});
		}
	};

	// Handle discard autosave
	const handleDiscard = () => {
		clearSavedData();
		setShowRestoreDialog(false);
		toast({
			title: "Gespeicherte Daten verworfen",
			description: "Die automatisch gespeicherten Daten wurden verworfen.",
		});
	};

	// Handle manual save
	const handleManualSave = () => {
		save();
		toast({
			title: "Änderungen gespeichert",
			description: "Ihre Änderungen wurden gespeichert.",
		});
	};

	// Handle final save
	const handleFinalSave = () => {
		clearSavedData();
		const dataToSave = {
			...documentData,
			customer: {
				...documentData.customer,
				id: formState.kunde,
			},
			bankDetails: {
				recipient:
					formState.bankRecipient ||
					companyInfo.bankDetails?.holder ||
					companyInfo.name,
				institute:
					formState.bankInstitute || companyInfo.bankDetails?.name || "",
				iban: formState.bankIban || companyInfo.bankDetails?.iban || "",
				bic: formState.bankBic || companyInfo.bankDetails?.bic || "",
				reference: formState.bankReference || formState.referenz || "",
			},
			processor:
				formState.bearbeiter === "mohamed"
					? "Mohamed Wahba"
					: formState.bearbeiter,
			status: formState.status.toUpperCase() as
				| "OPEN"
				| "ACCEPTED"
				| "REJECTED",
			statusDate: formState.statusDate,
			statusNote: formState.statusNote,
		};
		console.log("Saving data:", dataToSave);
		onSave(dataToSave);
	};

	// Calculate totals
	const subtotal = formState.items.reduce((sum, item) => sum + item.total, 0);
	const tax = subtotal * 0.1; // 10% tax
	const total = subtotal + tax;

	// Create document data for preview and export
	const documentData: DocumentData = {
		id: formState.betreff.split(" ")[1] || "2025-123456",
		date: new Date(formState.datum).toLocaleDateString("de-DE"),
		customer: {
			id: formState.kunde,
			name: formState.street?.split("\n")[0] || "",
			address: formState.street?.split("\n")[1] || "",
			city: formState.street?.split("\n")[2]?.split(" ")[1] || "",
			zip: formState.street?.split("\n")[2]?.split(" ")[0] || "",
			country: formState.street?.split("\n")[3] || "Österreich",
			customerNumber: formState.customerNumber,
			vatId: formState.uid,
			taxId: formState.steuer,
			email: formState.email,
		},
		items: formState.items.map((item) => ({
			id: typeof item.id === "string" ? Number.parseInt(item.id) : item.id,
			product: item.product || item.name || "",
			artNr: item.artNr || "",
			quantity: item.quantity,
			price: item.price,
			total: item.total,
		})),
		subtotal,
		tax,
		taxRate: 10,
		total,
		processor:
			formState.bearbeiter === "mohamed"
				? "Mohamed Wahba"
				: formState.bearbeiter,
		reference: formState.referenz,
		period: formState.leistungszeitraum,
		bankDetails: {
			recipient:
				formState.bankRecipient ||
				companyInfo.bankDetails?.holder ||
				companyInfo.name,
			institute: formState.bankInstitute || companyInfo.bankDetails?.name || "",
			iban: formState.bankIban || companyInfo.bankDetails?.iban || "",
			bic: formState.bankBic || companyInfo.bankDetails?.bic || "",
			reference: formState.bankReference || formState.referenz || "",
		},
		status:
			type === "angebot"
				? (formState.status.toUpperCase() as "OPEN" | "ACCEPTED" | "REJECTED")
				: undefined,
		statusDate: type === "angebot" ? formState.statusDate : undefined,
		statusNote: type === "angebot" ? formState.statusNote : undefined,
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (showPreview) {
		return (
			<DocumentPreview
				type={type}
				data={documentData}
				onBack={() => setShowPreview(false)}
			/>
		);
	}

	if (showPdfPreview) {
		return (
			<PdfPreview
				type={type}
				data={documentData}
				onClose={() => setShowPdfPreview(false)}
			/>
		);
	}

	return (
		<div className="space-y-6 ">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>{documentTitle} erstellen</CardTitle>
					<AutosaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="allgemein">
						<TabsList className="mb-4 flex-wrap h-auto w-fit">
							<TabsTrigger value="allgemein">Allgemein</TabsTrigger>
							<TabsTrigger value="kunde">Kunde</TabsTrigger>
							<TabsTrigger value="bank">Bankverbindung</TabsTrigger>
							<TabsTrigger value="artikel">Artikel</TabsTrigger>
							<TabsTrigger value="status">Status</TabsTrigger>
						</TabsList>

						<TabsContent value="allgemein" className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="betreff">Betreff</Label>
									<Input
										id="betreff"
										value={formState.betreff}
										onChange={(e) =>
											handleInputChange("betreff", e.target.value)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="datum">Datum</Label>
									<Input
										id="datum"
										type="date"
										value={formState.datum}
										onChange={(e) => handleInputChange("datum", e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="leistungszeitraum">Leistungszeitraum</Label>
									<Input
										id="leistungszeitraum"
										value={formState.leistungszeitraum}
										onChange={(e) =>
											handleInputChange("leistungszeitraum", e.target.value)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="referenz">Referenz</Label>
									<Input
										id="referenz"
										value={formState.referenz}
										onChange={(e) =>
											handleInputChange("referenz", e.target.value)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="bearbeiter">Bearbeiter</Label>
									<Select
										value={formState.bearbeiter}
										onValueChange={(value) =>
											handleInputChange("bearbeiter", value)
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Bearbeiter auswählen" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="mohamed">Mohamed Wahba</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="kunde" className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="kunde">Kunde</Label>
								<Select
									value={formState.kunde}
									onValueChange={(value) => {
										// When customer changes, update all related fields
										const selectedCustomer = customers.find(
											(c) => c.id === value,
										);
										if (selectedCustomer) {
											handleInputChange("kunde", selectedCustomer.id);
											handleInputChange(
												"customerNumber",
												selectedCustomer.customerNumber || "",
											);
											handleInputChange("uid", selectedCustomer.vatId || "");
											handleInputChange("steuer", selectedCustomer.taxId || "");
											handleInputChange("email", selectedCustomer.email || "");
											handleInputChange(
												"street",
												`${selectedCustomer.name}
${selectedCustomer.street || ""}
${selectedCustomer.zip || ""} ${selectedCustomer.city || ""}
${selectedCustomer.country || "Österreich"}`,
											);
											console.log("Selected customer:", selectedCustomer); // Add debug log
										}
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Kunde auswählen" />
									</SelectTrigger>
									<SelectContent>
										{customers.map((customer) => (
											<SelectItem key={customer.id} value={customer.id}>
												{customer.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="customerNumber">Kunden-Nr.</Label>
									<Input
										id="customerNumber"
										value={formState.customerNumber}
										readOnly
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="uid">UID-Nr.</Label>
									<Input id="uid" value={formState.uid} readOnly />
								</div>
								<div className="space-y-2">
									<Label htmlFor="steuer">Steuer-Nr.</Label>
									<Input id="steuer" value={formState.steuer} readOnly />
								</div>
								<div className="space-y-2">
									<Label htmlFor="email">E-Mail</Label>
									<Input
										id="email"
										type="email"
										value={formState.email}
										onChange={(e) => handleInputChange("email", e.target.value)}
									/>
								</div>
								<div className="space-y-2 md:col-span-2">
									<Label htmlFor="street">{addressLabel}</Label>
									<textarea
										id="street"
										className="w-full min-h-[100px] p-2 border rounded-md"
										value={formState.street}
										readOnly
									/>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="bank" className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="bankRecipient">Empfänger</Label>
									<Input
										id="bankRecipient"
										value={
											formState.bankRecipient ||
											companyInfo.bankDetails?.holder ||
											companyInfo.name
										}
										onChange={(e) =>
											handleInputChange("bankRecipient", e.target.value)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="bankInstitute">Institut</Label>
									<Input
										id="bankInstitute"
										value={
											formState.bankInstitute ||
											companyInfo.bankDetails?.name ||
											""
										}
										onChange={(e) =>
											handleInputChange("bankInstitute", e.target.value)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="bankIban">IBAN</Label>
									<Input
										id="bankIban"
										value={
											formState.bankIban || companyInfo.bankDetails?.iban || ""
										}
										onChange={(e) =>
											handleInputChange("bankIban", e.target.value)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="bankBic">BIC</Label>
									<Input
										id="bankBic"
										value={
											formState.bankBic || companyInfo.bankDetails?.bic || ""
										}
										onChange={(e) =>
											handleInputChange("bankBic", e.target.value)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="bankReference">Referenz</Label>
									<Input
										id="bankReference"
										value={formState.bankReference || formState.referenz || ""}
										onChange={(e) =>
											handleInputChange("bankReference", e.target.value)
										}
									/>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="artikel">
							<div className="space-y-4">
								<ArticleManagement
									items={formState.items}
									onItemsChange={handleItemsChange}
									products={products}
									showTax={true}
									showDiscount={true}
									allowReordering={true}
								/>

								<div className="border-t pt-4 space-y-2">
									<div className="flex justify-between">
										<span>Zwischensumme:</span>
										<span>€ {subtotal.toFixed(2)}</span>
									</div>
									<div className="flex justify-between">
										<span>MwSt. (10%):</span>
										<span>€ {tax.toFixed(2)}</span>
									</div>
									<div className="flex justify-between font-bold">
										<span>Gesamtbetrag:</span>
										<span>€ {total.toFixed(2)}</span>
									</div>
								</div>

								<div className="border-t pt-4">
									<h3 className="font-medium mb-2">Bankverbindung</h3>
									<p className="text-sm">
										Empfänger: Mohamed Wahba - Institut: Erste Bank - Referenz:
										12456789
										<br />
										IBAN: AT12 3456 7890 3456 - BIC: GTRHMLKTGH
									</p>
								</div>
							</div>
						</TabsContent>
						<TabsContent value="status" className="space-y-4">
							{type === "angebot" && (
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="status">Angebotsstatus</Label>
										<Select
											value={formState.status}
											onValueChange={(value) => {
												handleInputChange("status", value);
												handleInputChange(
													"statusDate",
													new Date().toISOString().split("T")[0],
												);
											}}
										>
											<SelectTrigger>
												<SelectValue placeholder="Status auswählen" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="OPEN">Offen</SelectItem>
												<SelectItem value="ACCEPTED">Angenommen</SelectItem>
												<SelectItem value="REJECTED">Abgelehnt</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="statusDate">Statusdatum</Label>
										<Input
											id="statusDate"
											type="date"
											value={formState.statusDate}
											onChange={(e) =>
												handleInputChange("statusDate", e.target.value)
											}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="statusNote">Notiz</Label>
										<Textarea
											id="statusNote"
											placeholder="Optionale Notiz zum Status"
											value={formState.statusNote}
											onChange={(e) =>
												handleInputChange("statusNote", e.target.value)
											}
										/>
									</div>
								</div>
							)}
						</TabsContent>
					</Tabs>
				</CardContent>
				<CardFooter className="flex flex-col gap-2 lg:gap-0 lg:flex-row lg:justify-between">
					<Button variant="outline" onClick={onCancel}>
						Schließen
					</Button>
					<div className="flex gap-2 flex-wrap max-lg:justify-center">
						<Button variant="outline" onClick={handleManualSave}>
							<Save className="h-4 w-4 mr-2" />
							Speichern
						</Button>
						<Button variant="outline" onClick={() => setShowPreview(true)}>
							<FileDown className="h-4 w-4 mr-2" />
							Vorschau
						</Button>
						<Button variant="outline" onClick={() => setShowPdfPreview(true)}>
							<FileDown className="h-4 w-4 mr-2" />
							PDF Vorschau
						</Button>
						<Button variant="outline" onClick={() => setShowEmailDialog(true)}>
							<Mail className="h-4 w-4 mr-2" />
							Per E-Mail senden
						</Button>
						<Button onClick={handleFinalSave}>Fertigstellen</Button>
					</div>
				</CardFooter>
			</Card>

			<RestoreAutosaveDialog
				open={showRestoreDialog}
				onOpenChange={setShowRestoreDialog}
				timestamp={savedData?.timestamp || new Date()}
				onRestore={handleRestore}
				onDiscard={handleDiscard}
			/>

			<EmailDialog
				open={showEmailDialog}
				onOpenChange={setShowEmailDialog}
				recipient={formState.email}
				subject={formState.betreff}
				documentType={type}
				documentData={documentData}
			/>
		</div>
	);
}
