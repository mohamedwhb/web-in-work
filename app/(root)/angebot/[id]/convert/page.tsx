"use client";

import { InvoiceForm } from "@/components/invoice-form";
import { useToast } from "@/hooks/use-toast";
import type { InvoiceData } from "@/lib/invoice-types";
import type { Offer } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type OfferWithRelations = Offer & {
	customer: {
		id: string;
		name: string;
		street: string | null;
		zip: string | null;
		city: string | null;
		country: string | null;
		customerNumber: string | null;
		vatId: string | null;
		taxId: string | null;
		email: string | null;
	};
	items: {
		id: number;
		product: string;
		artNr: string;
		quantity: number;
		price: number;
		total: number;
	}[];
	bankDetails: {
		id: string;
		recipient: string;
		institute: string;
		iban: string;
		bic: string;
		reference: string;
	};
};

export default function ConvertOfferToInvoicePage() {
	const [isLoading, setIsLoading] = useState(true);
	const [offerData, setOfferData] = useState<OfferWithRelations | null>(null);
	const params = useParams();
	const router = useRouter();
	const { toast } = useToast();
	const offerId = params.id as string;

	useEffect(() => {
		const fetchOfferData = async () => {
			try {
				setIsLoading(true);
				const response = await fetch(`/api/offers/${offerId}`);

				if (!response.ok) {
					throw new Error("Failed to fetch offer");
				}

				const data = await response.json();
				setOfferData(data.offer);
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

	const handleSaveInvoice = async (data: InvoiceData) => {
		try {
			const response = await fetch("/api/invoices", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...data,
					offerId: offerId,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to create invoice");
			}

			const result = await response.json();

			toast({
				title: "Rechnung erstellt",
				description: `Rechnung ${result.invoice.id} wurde aus Angebot ${offerId} erstellt.`,
			});

			router.push("/rechnungen");
		} catch (error) {
			console.error("Error saving invoice:", error);
			toast({
				title: "Fehler beim Speichern",
				description: "Die Rechnung konnte nicht gespeichert werden.",
				variant: "destructive",
			});
		}
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

	// Convert offer data to invoice data
	const initialInvoiceData: Partial<InvoiceData> = {
		customer: {
			id: offerData.customer.id,
			name: offerData.customer.name,
			address: offerData.customer.street || "",
			city: offerData.customer.city || "",
			zip: offerData.customer.zip || "",
			country: offerData.customer.country || "Österreich",
			customerNumber: offerData.customer.customerNumber || "",
			vatId: offerData.customer.vatId || "",
			taxId: offerData.customer.taxId || "",
			email: offerData.customer.email || "",
		},
		items: offerData.items.map((item) => ({
			id: item.id.toString(),
			name: item.product,
			description: "",
			quantity: item.quantity,
			price: item.price,
			unit: "Stück",
		})),
		notes: `Erstellt aus Angebot ${offerId}.\n\n${offerData.statusNote || ""}`,
		offerReference: offerId,
		paymentStatus: "unpaid",
		paymentMethod: "bank_transfer",
		paymentTerms: "14 Tage",
		bankDetails: {
			recipient: offerData.bankDetails.recipient,
			institute: offerData.bankDetails.institute,
			iban: offerData.bankDetails.iban,
			bic: offerData.bankDetails.bic,
			reference: offerData.bankDetails.reference,
		},
	};

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-6">Angebot in Rechnung umwandeln</h1>
			<InvoiceForm
				initialData={initialInvoiceData}
				onSave={handleSaveInvoice}
			/>
		</div>
	);
}
