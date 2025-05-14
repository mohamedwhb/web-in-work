"use client";

import { InvoiceForm } from "@/components/invoice-form";
import { useToast } from "@/hooks/use-toast";
import type { InvoiceData } from "@/lib/invoice-types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewInvoicePage() {
	const [isSaving, setIsSaving] = useState(false);
	const router = useRouter();
	const { toast } = useToast();

	const handleSaveInvoice = async (data: InvoiceData) => {
		try {
			setIsSaving(true);

			// In a real application, you would save the invoice to your database here
			console.log("Saving invoice:", data);

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 500));

			toast({
				title: "Rechnung erstellt",
				description: `Rechnung ${data.id} wurde erfolgreich erstellt.`,
			});

			// Navigate back to invoices list
			router.push("/rechnungen");
		} catch (error) {
			console.error("Error saving invoice:", error);
			toast({
				title: "Fehler beim Speichern",
				description: "Die Rechnung konnte nicht gespeichert werden.",
				variant: "destructive",
			});
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="container mx-auto py-6">
			<InvoiceForm onSave={handleSaveInvoice} />
		</div>
	);
}
