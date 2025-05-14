"use client";

import DocumentForm from "@/components/document-form";
import { useToast } from "@/hooks/use-toast";
import type { DocumentData } from "@/lib/pdf-generator";
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

export default function EditOfferPage() {
	const params = useParams();
	const router = useRouter();
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(true);
	const [offerData, setOfferData] = useState<OfferWithRelations | null>(null);
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

	const handleSave = async (data: DocumentData) => {
		try {
			const response = await fetch(`/api/offers/${params.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Failed to update offer");
			}

			toast({
				title: "Angebot aktualisiert",
				description: "Das Angebot wurde erfolgreich aktualisiert.",
			});
			router.push("/angebot");
		} catch (error) {
			console.error("Error updating offer:", error);
			toast({
				title: "Fehler",
				description: "Das Angebot konnte nicht aktualisiert werden.",
				variant: "destructive",
			});
		}
	};

	const handleCancel = () => {
		router.push("/angebot");
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

	// Transform offer data to match the form's expected format
	const formData = {
		id: offerData.id,
		betreff: `Angebot ${offerData.id}`,
		datum: new Date(offerData.date).toISOString().split("T")[0],
		leistungszeitraum: "",
		referenz: "",
		bearbeiter: offerData.processor,
		kunde: offerData.customer.id,
		customerNumber: offerData.customer.customerNumber || "",
		uid: offerData.customer.vatId || "",
		steuer: offerData.customer.taxId || "",
		street: `${offerData.customer.name}
${offerData.customer.street || ""}
${offerData.customer.zip || ""} ${offerData.customer.city || ""}
${offerData.customer.country || "Österreich"}`,
		items: offerData.items.map((item) => ({
			id: item.id,
			product: item.product,
			artNr: item.artNr,
			quantity: item.quantity,
			price: item.price,
			total: item.total,
		})),
		email: offerData.customer.email || "",
		status: offerData.status,
		statusDate: new Date(offerData.statusDate).toISOString().split("T")[0],
		statusNote: offerData.statusNote || "",
	};

	return (
		<div className="p-6 overflow-hidden">
			<h1 className="text-2xl font-bold mb-6">Angebot bearbeiten</h1>
			<DocumentForm
				type="angebot"
				initialData={formData}
				onCancel={handleCancel}
				onSave={handleSave}
			/>
		</div>
	);
}
