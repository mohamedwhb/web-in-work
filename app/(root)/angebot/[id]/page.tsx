"use client";

import EmailDialog from "@/components/email-dialog";
import PdfExportButton from "@/components/pdf-export-button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { DocumentData } from "@/lib/pdf-generator";
import {
	ArrowLeft,
	CheckCircle,
	Clock,
	Copy,
	Edit,
	FileText,
	Loader2,
	Mail,
	Trash2,
	XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OfferDetailPage() {
	const params = useParams();
	const router = useRouter();
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(true);
	const [offerData, setOfferData] = useState<DocumentData | null>(null);
	const [showStatusDialog, setShowStatusDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showEmailDialog, setShowEmailDialog] = useState(false);
	const offerId = params.id as string;

	useEffect(() => {
		const fetchOfferData = async () => {
			try {
				setIsLoading(true);

				// In a real application, you would fetch the offer data from your database
				// For now, we'll simulate loading offer data
				await new Promise((resolve) => setTimeout(resolve, 800));

				// Mock offer data
				const mockOffer: DocumentData = {
					id: offerId,
					date: "05.02.2025",
					customer: {
						name: "Max Mustermann GmbH",
						address: "Max Straße 123",
						city: "Wien",
						zip: "1010",
						country: "Österreich",
						customerNumber: "123456",
						vatId: "ATU 123456",
						taxId: "DN123456",
						email: "max@mustermann.at",
					},
					items: [
						{
							id: 1,
							product: "Mango",
							artNr: "12345",
							quantity: 1,
							price: 15.9,
							total: 15.9,
						},
						{
							id: 2,
							product: "Avocado",
							artNr: "23456",
							quantity: 2,
							price: 12.5,
							total: 25.0,
						},
						{
							id: 3,
							product: "Kartoffel",
							artNr: "34567",
							quantity: 5,
							price: 5.2,
							total: 26.0,
						},
					],
					subtotal: 66.9,
					tax: 6.69,
					taxRate: 10,
					total: 73.59,
					processor: "Mohamed Wahba",
					bankDetails: {
						recipient: "Mohamed Wahba",
						institute: "Erste Bank",
						iban: "AT12 3456 7890 3456",
						bic: "GTRHMLKTGH",
						reference: "12456789",
					},
					status: "open",
					statusDate: "2025-02-05",
					statusNote: "",
				};

				setOfferData(mockOffer);
			} catch (error) {
				console.error("Error fetching offer data:", error);
				toast({
					title: "Fehler beim Laden",
					description: "Das Angebot konnte nicht geladen werden.",
					variant: "destructive",
				});
				router.push("/angebot");
			} finally {
				setIsLoading(false);
			}
		};

		fetchOfferData();
	}, [offerId, router, toast]);

	// Handle status change
	const handleStatusChange = (
		newStatus: "open" | "accepted" | "rejected",
		note?: string,
	) => {
		setIsLoading(true);

		// Simulate API call
		setTimeout(() => {
			if (offerData) {
				const updatedOffer = {
					...offerData,
					status: newStatus,
					statusDate: new Date().toLocaleDateString("de-DE"),
					statusNote: note,
				};
				setOfferData(updatedOffer);
			}

			toast({
				title: "Status geändert",
				description: `Angebot ${offerId} wurde auf "${getStatusLabel(
					newStatus,
				)}" gesetzt.`,
			});

			setIsLoading(false);
			setShowStatusDialog(false);
		}, 500);
	};

	// Handle document deletion
	const handleDeleteDocument = () => {
		setIsLoading(true);

		// Simulate API call
		setTimeout(() => {
			toast({
				title: "Angebot gelöscht",
				description: `Angebot ${offerId} wurde erfolgreich gelöscht.`,
			});

			setIsLoading(false);
			setShowDeleteDialog(false);
			router.push("/angebot");
		}, 500);
	};

	// Handle document duplication
	const handleDuplicateDocument = () => {
		setIsLoading(true);

		// Simulate API call
		setTimeout(() => {
			const newId = `2025-${(
				Number.parseInt(offerId.split("-")[1]) + 100
			).toString()}`;

			toast({
				title: "Angebot dupliziert",
				description: `Angebot ${offerId} wurde als ${newId} dupliziert.`,
			});

			setIsLoading(false);
			router.push(`/angebot/${newId}`);
		}, 500);
	};

	// Get status badge
	const getStatusBadge = (status: string) => {
		switch (status) {
			case "open":
				return (
					<Badge
						variant="outline"
						className="bg-blue-100 text-blue-800 hover:bg-blue-100"
					>
						<Clock className="h-3 w-3 mr-1" />
						Offen
					</Badge>
				);
			case "accepted":
				return (
					<Badge
						variant="outline"
						className="bg-green-100 text-green-800 hover:bg-green-100"
					>
						<CheckCircle className="h-3 w-3 mr-1" />
						Angenommen
					</Badge>
				);
			case "rejected":
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
	const getStatusLabel = (status: "open" | "accepted" | "rejected"): string => {
		switch (status) {
			case "open":
				return "Offen";
			case "accepted":
				return "Angenommen";
			case "rejected":
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

	if (isLoading) {
		return (
			<div className="p-6 flex justify-center items-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<span className="ml-2">Angebot wird geladen...</span>
			</div>
		);
	}

	if (!offerData) {
		return (
			<div className="p-6 flex justify-center items-center h-64">
				<p className="text-lg text-destructive">Angebot nicht gefunden</p>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => router.push("/angebot")}
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Zurück
					</Button>
					<h1 className="text-2xl font-bold">Angebot {offerData.id}</h1>
					{getStatusBadge(offerData.status || "open")}
				</div>
				<div className="flex flex-wrap gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => router.push(`/angebot/${offerId}/edit`)}
					>
						<Edit className="h-4 w-4 mr-2" />
						Bearbeiten
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowStatusDialog(true)}
					>
						<FileText className="h-4 w-4 mr-2" />
						Status ändern
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => handleDuplicateDocument()}
					>
						<Copy className="h-4 w-4 mr-2" />
						Duplizieren
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => router.push(`/angebot/${offerId}/convert`)}
					>
						<FileText className="h-4 w-4 mr-2" />
						In Rechnung umwandeln
					</Button>
					<PdfExportButton type="angebot" data={offerData} />
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowEmailDialog(true)}
					>
						<Mail className="h-4 w-4 mr-2" />
						Per E-Mail senden
					</Button>
					<Button
						variant="destructive"
						size="sm"
						onClick={() => setShowDeleteDialog(true)}
					>
						<Trash2 className="h-4 w-4 mr-2" />
						Löschen
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Kundeninformationen</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<h3 className="font-medium">Kunde</h3>
							<p>{offerData.customer.name}</p>
							<p>{offerData.customer.address}</p>
							<p>
								{offerData.customer.zip} {offerData.customer.city}
							</p>
							<p>{offerData.customer.country}</p>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<h3 className="font-medium">Kunden-Nr.</h3>
								<p>{offerData.customer.customerNumber}</p>
							</div>
							<div>
								<h3 className="font-medium">UID-Nr.</h3>
								<p>{offerData.customer.vatId}</p>
							</div>
							<div>
								<h3 className="font-medium">Steuer-Nr.</h3>
								<p>{offerData.customer.taxId}</p>
							</div>
							<div>
								<h3 className="font-medium">E-Mail</h3>
								<p>{offerData.customer.email}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Angebotsinformationen</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<h3 className="font-medium">Angebotsnummer</h3>
								<p>{offerData.id}</p>
							</div>
							<div>
								<h3 className="font-medium">Datum</h3>
								<p>{offerData.date}</p>
							</div>
							<div>
								<h3 className="font-medium">Status</h3>
								<p className="flex items-center">
									{getStatusBadge(offerData.status || "open")}
								</p>
							</div>
							<div>
								<h3 className="font-medium">Statusdatum</h3>
								<p>{offerData.statusDate}</p>
							</div>
						</div>
						{offerData.statusNote && (
							<div>
								<h3 className="font-medium">Statusnotiz</h3>
								<p className="italic">"{offerData.statusNote}"</p>
							</div>
						)}
						<div>
							<h3 className="font-medium">Bearbeiter</h3>
							<p>{offerData.processor}</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Artikel</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b">
									<th className="text-left py-3 px-4 font-medium">Pos.</th>
									<th className="text-left py-3 px-4 font-medium">Produkt</th>
									<th className="text-right py-3 px-4 font-medium">Menge</th>
									<th className="text-right py-3 px-4 font-medium">
										Einzelpreis
									</th>
									<th className="text-right py-3 px-4 font-medium">
										Gesamtsumme
									</th>
								</tr>
							</thead>
							<tbody>
								{offerData.items.map((item, index) => (
									<tr key={item.id} className="border-b">
										<td className="py-3 px-4">{index + 1}</td>
										<td className="py-3 px-4">
											<div>{item.product}</div>
											<div className="text-xs text-muted-foreground">
												Art.-Nr.: {item.artNr}
											</div>
										</td>
										<td className="py-3 px-4 text-right">{item.quantity}</td>
										<td className="py-3 px-4 text-right">
											{formatCurrency(item.price)}
										</td>
										<td className="py-3 px-4 text-right">
											{formatCurrency(item.total)}
										</td>
									</tr>
								))}
							</tbody>
							<tfoot>
								<tr className="border-b">
									<td colSpan={4} className="py-3 px-4 text-right font-medium">
										Zwischensumme:
									</td>
									<td className="py-3 px-4 text-right">
										{formatCurrency(offerData.subtotal)}
									</td>
								</tr>
								<tr className="border-b">
									<td colSpan={4} className="py-3 px-4 text-right font-medium">
										MwSt. ({offerData.taxRate}%):
									</td>
									<td className="py-3 px-4 text-right">
										{formatCurrency(offerData.tax)}
									</td>
								</tr>
								<tr>
									<td colSpan={4} className="py-3 px-4 text-right font-bold">
										Gesamtbetrag:
									</td>
									<td className="py-3 px-4 text-right font-bold">
										{formatCurrency(offerData.total)}
									</td>
								</tr>
							</tfoot>
						</table>
					</div>
				</CardContent>
			</Card>

			{/* Status Change Dialog */}
			<StatusChangeDialog
				open={showStatusDialog}
				onOpenChange={setShowStatusDialog}
				currentStatus={
					(offerData.status as "open" | "accepted" | "rejected") || "open"
				}
				onStatusChange={handleStatusChange}
			/>

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
							onClick={handleDeleteDocument}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Löschen
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Email Dialog */}
			<EmailDialog
				open={showEmailDialog}
				onOpenChange={setShowEmailDialog}
				type="angebot"
				data={offerData}
				defaultTo={offerData.customer.email || ""}
			/>
		</div>
	);
}
