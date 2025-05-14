"use client";

import { InvoiceForm } from "@/components/invoice-form";
import type { InvoiceData } from "@/lib/invoice-types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Mock-Daten für die Rechnung
const mockInvoice: InvoiceData = {
	id: "RE-230501-001",
	date: new Date(2023, 4, 1),
	customer: {
		id: "1",
		name: "Musterfirma GmbH",
		address: "Musterstraße 123\n1010 Wien\nÖsterreich",
		email: "office@musterfirma.at",
		phone: "+43 1 234567",
		taxId: "ATU12345678",
	},
	items: [
		{
			id: "1",
			name: "Mango",
			description: "Frische Bio-Mangos aus kontrolliertem Anbau",
			quantity: 5,
			price: 15.9,
			unit: "Kg",
		},
		{
			id: "2",
			name: "Avocado",
			description: "Reife Hass-Avocados",
			quantity: 3,
			price: 12.5,
			unit: "Kg",
		},
		{
			id: "3",
			name: "Kartoffel",
			description: "Festkochende Kartoffeln aus regionalem Anbau",
			quantity: 10,
			price: 5.2,
			unit: "Kg",
		},
	],
	notes: "Vielen Dank für Ihren Auftrag!",
	paymentTerms: "14 Tage",
	paymentStatus: "paid",
	paymentMethod: "bank_transfer",
	paymentDueDate: new Date(2023, 4, 15),
	paymentDate: new Date(2023, 4, 10),
	paymentAmount: 599.94,
	paymentReference: "RE-230501-001",
	offerReference: "AN-230415-001",
};

export default function EditInvoicePage({
	params,
}: { params: { id: string } }) {
	const [invoice, setInvoice] = useState<InvoiceData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	// Lade Rechnungsdaten
	useEffect(() => {
		// In einer echten Anwendung würden wir hier die Daten von der API laden
		// Für dieses Beispiel verwenden wir die Mock-Daten
		setTimeout(() => {
			setInvoice(mockInvoice);
			setIsLoading(false);
		}, 500);
	}, [params.id]);

	const handleSave = async (data: InvoiceData) => {
		// In einer echten Anwendung würden wir hier die Daten an die API senden

		// Simuliere eine erfolgreiche Speicherung
		return new Promise<void>((resolve) => {
			setTimeout(() => {
				resolve();
				router.push(`/rechnungen/${params.id}`);
			}, 500);
		});
	};

	const handleCancel = () => {
		router.push(`/rechnungen/${params.id}`);
	};

	if (isLoading) {
		return (
			<div className="p-6">
				<div className="h-8 w-48 bg-muted animate-pulse rounded mb-4"></div>
				<div className="h-64 bg-muted animate-pulse rounded"></div>
			</div>
		);
	}

	if (!invoice) {
		return (
			<div className="p-6">
				<h1 className="text-2xl font-bold mb-4">Rechnung nicht gefunden</h1>
				<p>Die angeforderte Rechnung konnte nicht gefunden werden.</p>
			</div>
		);
	}

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-6">Rechnung bearbeiten</h1>
			<InvoiceForm
				initialData={invoice}
				onSave={handleSave}
				onCancel={handleCancel}
			/>
		</div>
	);
}
