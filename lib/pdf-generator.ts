import { getCompanyInfo, getCompanyLogo } from "@/lib/company-service";
import { getDisclaimerForDocument } from "@/lib/legal-service";
import type { DocumentTemplate } from "@/lib/templates";
import { jsPDF } from "jspdf";
import type { UserOptions } from "jspdf-autotable";
import autoTable from "jspdf-autotable";

// Extend the jsPDF types to include autoTable
declare module "jspdf" {
	interface jsPDF {
		autoTable: (options: UserOptions) => jsPDF;
	}
}

// Define document types
export type DocumentType = "angebot" | "rechnung" | "lieferschein";

// Define document data interface
export interface DocumentData {
	id: string;
	date: string;
	customer: {
		id: string;
		name: string;
		address: string;
		city: string;
		zip: string;
		country: string;
		customerNumber?: string;
		taxId?: string;
		vatId?: string;
		email?: string;
	};
	items: {
		id: number;
		product: string;
		artNr: string;
		quantity: number;
		price: number;
		total: number;
	}[];
	subtotal: number;
	tax: number;
	taxRate: number;
	total: number;
	reference?: string;
	period?: string;
	processor?: string;
	bankDetails?: {
		recipient: string;
		institute: string;
		iban: string;
		bic: string;
		reference: string;
	};
	signature?: string;
	template?: DocumentTemplate;
	companyLogo?: string;
	status?:
		| "OPEN"
		| "ACCEPTED"
		| "REJECTED"
		| "PREPARED"
		| "SHIPPED"
		| "DELIVERED"; // Add delivery note statuses
	statusDate?: string; // Add date when status was last changed
	statusNote?: string; // Add optional note for status changes
	paymentQrCode?: string; // QR-Code für Zahlungen

	// Delivery note specific fields
	deliveryDate?: string;
	orderNumber?: string;
	shippingMethod?: string;
	trackingNumber?: string;
	notes?: string;
}

// Replace the generatePDF function to properly initialize autoTable
export async function generatePDF(
	type: DocumentType,
	data: DocumentData,
): Promise<Uint8Array> {
	// Validiere die Eingabedaten
	if (
		!data ||
		!data.id ||
		!data.customer ||
		!data.items ||
		!Array.isArray(data.items)
	) {
		console.error("Invalid PDF data:", data);
		throw new Error("Ungültige Daten für die PDF-Generierung");
	}

	// Stellen Sie sicher, dass alle erforderlichen Felder vorhanden sind
	if (!data.customer.name || !data.customer.address) {
		console.error("Missing customer data:", data.customer);
		throw new Error("Fehlende Kundendaten für die PDF-Generierung");
	}

	// Stellen Sie sicher, dass die Artikel gültige Daten enthalten
	if (
		data.items.some(
			(item) => item.quantity === undefined || item.price === undefined,
		)
	) {
		console.error("Invalid item data:", data.items);
		throw new Error("Ungültige Artikeldaten für die PDF-Generierung");
	}

	// Create a new PDF document
	const doc = new jsPDF({
		orientation: "portrait",
		unit: "mm",
		format: "a4",
	});

	// Initialize autoTable with the document
	autoTable(doc as any);

	// Get company information
	const companyInfo = getCompanyInfo();
	const companyLogo = data.companyLogo || getCompanyLogo();

	// Set document properties
	doc.setProperties({
		title: `${getDocumentTitle(type)} ${data.id}`,
		subject: `${getDocumentTitle(type)} für ${data.customer.name}`,
		author: companyInfo.name,
		creator: "KMW Business Management System",
	});

	// Apply template if available
	const template = data.template;
	if (template) {
		applyTemplate(doc, template);
	}

	// Add company logo and information
	addCompanyHeader(doc, data, companyInfo, companyLogo);

	// Add document title and information
	addDocumentHeader(doc, type, data);

	// Add customer information
	addCustomerInfo(doc, data);

	// Add items table
	addItemsTable(doc, data);

	// Add totals
	addTotals(doc, data);

	// Add payment information for invoices
	if (type === "rechnung") {
		addPaymentInfo(doc, data, companyInfo);

		// Generiere QR-Code für Zahlungen, wenn es eine Rechnung ist
		if (data.bankDetails && type === "rechnung") {
			addPaymentQrCode(doc, data);
		}
	}

	// Add delivery note specific information
	if (type === "lieferschein") {
		addDeliveryInfo(doc, data);
	}

	// Add legal disclaimer
	addLegalDisclaimer(doc, type);

	// Add signature if available
	if (data.signature && (!template || template.showSignature)) {
		addSignature(doc, data.signature);
	}

	// Add footer with company information
	if (!template || template.showFooter) {
		addFooter(doc, companyInfo);
	}

	// Add watermark if template specifies
	if (template && template.showWatermark) {
		addWatermark(doc, type);
	}

	// Return the PDF as a Uint8Array
	return doc.output("arraybuffer");
}

// Ändere die bestehende Funktion zu einer exportierten Funktion
export function getDocumentTitle(type: DocumentType): string {
	switch (type) {
		case "angebot":
			return "Angebot";
		case "rechnung":
			return "Rechnung";
		case "lieferschein":
			return "Lieferschein";
		default:
			return "Dokument";
	}
}

function applyTemplate(doc: jsPDF, template: DocumentTemplate): void {
	// Set colors based on template
	const primaryColor = hexToRgb(template.colors.primary);
	const textColor = hexToRgb(template.colors.text);

	if (primaryColor) {
		doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
	}

	if (textColor) {
		doc.setTextColor(textColor.r, textColor.g, textColor.b);
	}

	// Set font based on template
	doc.setFont(template.fonts.body);

	// Apply layout specific styling
	switch (template.layout) {
		case "modern":
			// Modern layout has more whitespace
			doc.setLineWidth(0.5);
			break;
		case "compact":
			// Compact layout has tighter spacing
			doc.setLineWidth(0.3);
			break;
		case "elegant":
			// Elegant layout has thinner lines
			doc.setLineWidth(0.2);
			break;
		default:
			// Standard layout
			doc.setLineWidth(0.5);
	}
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: Number.parseInt(result[1], 16),
				g: Number.parseInt(result[2], 16),
				b: Number.parseInt(result[3], 16),
			}
		: null;
}

function addCompanyHeader(
	doc: jsPDF,
	data: DocumentData,
	companyInfo: any,
	companyLogo: string | null,
): void {
	const template = data.template;
	const yOffset = 15; // Starting Y position

	// Add company logo if available and template allows
	if (companyLogo && (!template || template.showLogo)) {
		try {
			// Calculate logo dimensions while maintaining aspect ratio
			const maxWidth = 40;
			const maxHeight = 20;

			// Create a temporary image to get dimensions
			const img = new Image();
			img.src = companyLogo;
			img.crossOrigin = "anonymous";

			let logoWidth = maxWidth;
			let logoHeight = (img.height / img.width) * maxWidth;

			// If height exceeds max, scale based on height
			if (logoHeight > maxHeight) {
				logoHeight = maxHeight;
				logoWidth = (img.width / img.height) * maxHeight;
			}

			doc.addImage(companyLogo, "PNG", 20, yOffset, logoWidth, logoHeight);

			// Adjust text position if logo is present
			doc.setFontSize(18);
			doc.setFont("helvetica", "bold");
			doc.text(companyInfo.name, 20, yOffset + logoHeight + 10);

			// Add company address and contact information
			doc.setFontSize(10);
			doc.setFont("helvetica", "normal");
			doc.text(
				`${companyInfo.street} ${companyInfo.number}`,
				20,
				yOffset + logoHeight + 15,
			);
			doc.text(
				`${companyInfo.zip} ${companyInfo.city}`,
				20,
				yOffset + logoHeight + 20,
			);
			doc.text(`Tel: ${companyInfo.phone}`, 20, yOffset + logoHeight + 25);
			doc.text(`Email: ${companyInfo.email}`, 20, yOffset + logoHeight + 30);

			// Add horizontal line
			doc.line(20, yOffset + logoHeight + 35, 190, yOffset + logoHeight + 35);
		} catch (error) {
			console.error("Error adding logo:", error);

			// Fallback to text-only header
			addTextOnlyHeader(doc, companyInfo);
		}
	} else {
		// No logo, just add text header
		addTextOnlyHeader(doc, companyInfo);
	}

	function addTextOnlyHeader(doc: jsPDF, companyInfo: any): void {
		// Add company name
		doc.setFontSize(18);
		doc.setFont("helvetica", "bold");
		doc.text(companyInfo.name, 20, 20);

		// Add company address and contact information
		doc.setFontSize(10);
		doc.setFont("helvetica", "normal");
		doc.text(`${companyInfo.street} ${companyInfo.number}`, 20, 25);
		doc.text(`${companyInfo.zip} ${companyInfo.city}`, 20, 30);
		doc.text(`Tel: ${companyInfo.phone}`, 20, 35);
		doc.text(`Email: ${companyInfo.email}`, 20, 40);

		// Add horizontal line with template color if available
		if (template) {
			const primaryColor = hexToRgb(template.colors.primary);
			if (primaryColor) {
				doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
			}
		} else {
			doc.setDrawColor(200, 200, 200);
		}

		doc.line(20, 45, 190, 45);
	}
}

// Add new function to add legal disclaimer
function addLegalDisclaimer(doc: jsPDF, type: DocumentType): void {
	// Get the appropriate disclaimer based on document type
	let disclaimerType: "invoice" | "offer" | "deliveryNote";

	switch (type) {
		case "rechnung":
			disclaimerType = "invoice";
			break;
		case "angebot":
			disclaimerType = "offer";
			break;
		case "lieferschein":
			disclaimerType = "deliveryNote";
			break;
		default:
			return;
	}

	const disclaimer = getDisclaimerForDocument(disclaimerType);

	if (!disclaimer) {
		return;
	}

	// Get the final Y position after the previous content
	const finalY = (doc as any).lastAutoTable.finalY + 35;

	// Add disclaimer text
	doc.setFontSize(9);
	doc.setFont("helvetica", "italic");

	// Split disclaimer into multiple lines if needed
	const maxWidth = 170;
	const lines = doc.splitTextToSize(disclaimer, maxWidth);

	doc.text(lines, 20, finalY);
}

// Neue Funktion zum Hinzufügen des Zahlungs-QR-Codes
function addPaymentQrCode(doc: jsPDF, data: DocumentData): void {
	// Nur hinzufügen, wenn Bankdaten vorhanden sind
	if (!data.bankDetails) return;

	// QR-Code-Position bestimmen (nach den Zahlungsinformationen)
	const finalY = (doc as any).lastAutoTable.finalY + 45;

	// QR-Code-Daten generieren
	try {
		// Wenn ein vorgenerierter QR-Code vorhanden ist, diesen verwenden
		if (data.paymentQrCode) {
			// QR-Code-Titel hinzufügen
			doc.setFontSize(10);
			doc.setFont("helvetica", "bold");
			doc.text("Zahlung per QR-Code", 140, finalY);

			// QR-Code-Beschreibung hinzufügen
			doc.setFontSize(8);
			doc.setFont("helvetica", "normal");
			doc.text("Scannen Sie den Code mit Ihrer Banking-App", 140, finalY + 5);

			// QR-Code hinzufügen
			doc.addImage(data.paymentQrCode, "PNG", 140, finalY + 10, 40, 40);
		} else {
			// Hinweis hinzufügen, dass QR-Code in der Vorschau verfügbar ist
			doc.setFontSize(8);
			doc.setFont("helvetica", "italic");
			doc.text(
				"Hinweis: In der digitalen Version dieser Rechnung ist ein QR-Code für die schnelle Zahlung verfügbar.",
				140,
				finalY,
			);
		}
	} catch (error) {
		console.error("Fehler beim Hinzufügen des QR-Codes:", error);
		// Bei Fehler keinen QR-Code hinzufügen
	}
}

// The rest of the functions remain the same
function addDocumentHeader(
	doc: jsPDF,
	type: DocumentType,
	data: DocumentData,
): void {
	const title = getDocumentTitle(type);
	const template = data.template;

	// Set header font based on template
	if (template) {
		doc.setFont(template.fonts.header, "bold");
		const primaryColor = hexToRgb(template.colors.primary);
		if (primaryColor) {
			doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
		}
	} else {
		doc.setFont("helvetica", "bold");
	}

	// Add document title
	doc.setFontSize(16);
	doc.text(`${title} ${data.id}`, 20, 55);

	// Reset text color if template was applied
	if (template) {
		const textColor = hexToRgb(template.colors.text);
		if (textColor) {
			doc.setTextColor(textColor.r, textColor.g, textColor.b);
		}
	}

	// Add document date
	doc.setFontSize(10);
	doc.setFont("helvetica", "normal");
	doc.text(`Datum: ${data.date}`, 20, 62);

	// Add reference if available
	let yOffset = 67;
	if (data.reference) {
		doc.text(`Referenz: ${data.reference}`, 20, yOffset);
		yOffset += 5;
	}

	// Add period if available
	if (data.period) {
		doc.text(`Leistungszeitraum: ${data.period}`, 20, yOffset);
		yOffset += 5;
	}

	// Add delivery date for delivery notes
	if (type === "lieferschein" && data.deliveryDate) {
		doc.text(`Lieferdatum: ${data.deliveryDate}`, 20, yOffset);
		yOffset += 5;
	}

	// Add order number for delivery notes
	if (type === "lieferschein" && data.orderNumber) {
		doc.text(`Bestellnummer: ${data.orderNumber}`, 20, yOffset);
		yOffset += 5;
	}

	// Add processor if available
	if (data.processor) {
		doc.text(`Bearbeiter: ${data.processor}`, 20, yOffset);
	}
}

function addCustomerInfo(doc: jsPDF, data: DocumentData): void {
	const addressType =
		data.type === "lieferschein" ? "Lieferadresse" : "Rechnungsadresse";

	// Add customer address block
	doc.setFontSize(11);
	doc.setFont("helvetica", "bold");
	doc.text(addressType + ":", 120, 55);

	doc.setFontSize(10);
	doc.setFont("helvetica", "normal");
	doc.text(data.customer.name, 120, 62);
	doc.text(data.customer.address, 120, 67);
	doc.text(`${data.customer.zip} ${data.customer.city}`, 120, 72);
	doc.text(data.customer.country, 120, 77);

	// Add customer information block
	doc.setFontSize(10);
	doc.setFont("helvetica", "bold");
	doc.text("Kundeninfo", 120, 87);

	doc.setFont("helvetica", "normal");
	if (data.customer.customerNumber) {
		doc.text(`Kunden-Nr.: ${data.customer.customerNumber}`, 120, 92);
	}
	if (data.customer.vatId) {
		doc.text(`UID-Nr.: ${data.customer.vatId}`, 120, 97);
	}
	if (data.customer.taxId) {
		doc.text(`Steuer-Nr.: ${data.customer.taxId}`, 120, 102);
	}
}

function addItemsTable(doc: jsPDF, data: DocumentData): void {
	const template = data.template;

	// Define table headers
	const headers = [["Pos.", "Produkt", "Menge", "Einzelpreis", "Gesamtsumme"]];

	// Prepare table data
	const tableData = data.items.map((item, index) => [
		(index + 1).toString(),
		`${item.product || "Produkt"}\nArt.-Nr.: ${item.artNr || "N/A"}`,
		item.quantity.toString(),
		`€ ${item.price.toFixed(2)}`,
		`€ ${item.total.toFixed(2)}`,
	]);

	// Set table styles based on template
	let headStyles = { fillColor: [41, 128, 185], textColor: 255 };

	if (template) {
		const primaryColor = hexToRgb(template.colors.primary);
		if (primaryColor) {
			headStyles = {
				fillColor: [primaryColor.r, primaryColor.g, primaryColor.b],
				textColor: 255,
			};
		}
	}

	// Add table to document
	doc.autoTable({
		head: headers,
		body: tableData,
		startY: 110,
		margin: { left: 20, right: 20 },
		styles: { fontSize: 9, cellPadding: 3 },
		headStyles,
		columnStyles: {
			0: { cellWidth: 15 },
			1: { cellWidth: "auto" },
			2: { cellWidth: 20, halign: "right" },
			3: { cellWidth: 30, halign: "right" },
			4: { cellWidth: 30, halign: "right" },
		},
	});
}

function addTotals(doc: jsPDF, data: DocumentData): void {
	// Get the final Y position after the table
	const finalY = (doc as any).lastAutoTable.finalY + 10;

	// Add subtotal
	doc.setFontSize(10);
	doc.setFont("helvetica", "normal");
	doc.text("Zwischensumme:", 140, finalY);
	doc.text(`€ ${data.subtotal.toFixed(2)}`, 190, finalY, { align: "right" });

	// Add tax
	doc.text(`MwSt. (${data.taxRate}%):`, 140, finalY + 5);
	doc.text(`€ ${data.tax.toFixed(2)}`, 190, finalY + 5, { align: "right" });

	// Add total
	doc.setFont("helvetica", "bold");
	doc.text("Gesamtbetrag:", 140, finalY + 10);
	doc.text(`€ ${data.total.toFixed(2)}`, 190, finalY + 10, { align: "right" });
}

function addPaymentInfo(
	doc: jsPDF,
	data: DocumentData,
	companyInfo: any,
): void {
	// Get the final Y position after the totals
	const finalY = (doc as any).lastAutoTable.finalY + 25;

	// Add payment information for invoices
	doc.setFontSize(10);
	doc.setFont("helvetica", "normal");
	doc.text(
		"Bitte überweisen Sie den Rechnungsbetrag innerhalb von 14 Tagen ohne Abzug auf das unten angegebene Konto.",
		20,
		finalY,
	);

	// Add bank details if available
	if (companyInfo.bankName && companyInfo.iban) {
		doc.setFontSize(10);
		doc.setFont("helvetica", "bold");
		doc.text("Bankverbindung", 20, finalY + 10);

		doc.setFont("helvetica", "normal");
		doc.text(
			`Empfänger: ${companyInfo.bankAccountHolder || companyInfo.name} - Institut: ${companyInfo.bankName}`,
			20,
			finalY + 15,
		);
		doc.text(
			`IBAN: ${companyInfo.iban} - BIC: ${companyInfo.bic || ""}`,
			20,
			finalY + 20,
		);
	} else if (data.bankDetails) {
		// Fallback to document-specific bank details if company info doesn't have them
		doc.setFontSize(10);
		doc.setFont("helvetica", "bold");
		doc.text("Bankverbindung", 20, finalY + 10);

		doc.setFont("helvetica", "normal");
		doc.text(
			`Empfänger: ${data.bankDetails.recipient} - Institut: ${data.bankDetails.institute} - Referenz: ${data.bankDetails.reference}`,
			20,
			finalY + 15,
		);
		doc.text(
			`IBAN: ${data.bankDetails.iban} - BIC: ${data.bankDetails.bic}`,
			20,
			finalY + 20,
		);
	}

	// Add thank you note
	doc.text("Vielen Dank!", 20, finalY + 30);
}

function addDeliveryInfo(doc: jsPDF, data: DocumentData): void {
	// Get the final Y position after the totals
	const finalY = (doc as any).lastAutoTable.finalY + 25;

	// Add shipping method if available
	if (data.shippingMethod) {
		doc.setFontSize(10);
		doc.setFont("helvetica", "bold");
		doc.text("Versanddetails", 20, finalY);

		doc.setFont("helvetica", "normal");
		const shippingMethodText =
			data.shippingMethod === "standard"
				? "Standard"
				: data.shippingMethod === "express"
					? "Express"
					: "Selbstabholung";

		doc.text(`Versandart: ${shippingMethodText}`, 20, finalY + 5);

		// Add tracking number if available
		if (data.trackingNumber) {
			doc.text(`Sendungsnummer: ${data.trackingNumber}`, 20, finalY + 10);
		}
	}

	// Add notes if available
	if (data.notes) {
		doc.setFontSize(10);
		doc.setFont("helvetica", "bold");
		doc.text("Anmerkungen", 20, finalY + (data.shippingMethod ? 15 : 0));

		doc.setFont("helvetica", "normal");

		// Split notes into multiple lines if needed
		const maxWidth = 170;
		const lines = doc.splitTextToSize(data.notes, maxWidth);

		doc.text(lines, 20, finalY + (data.shippingMethod ? 20 : 5));
	}
}

function addSignature(doc: jsPDF, signatureData: string): void {
	try {
		// Get the final Y position
		const finalY = (doc as any).lastAutoTable.finalY + 40;

		// Add signature label
		doc.setFontSize(10);
		doc.setFont("helvetica", "bold");
		doc.text("Unterschrift:", 20, finalY);

		// Add signature image
		doc.addImage(signatureData, "PNG", 20, finalY + 5, 50, 20);

		// Add date line
		doc.setLineWidth(0.5);
		doc.line(120, finalY + 20, 180, finalY + 20);

		// Add date label
		doc.setFontSize(8);
		doc.setFont("helvetica", "normal");
		doc.text("Datum, Unterschrift", 120, finalY + 25);
	} catch (error) {
		console.error("Error adding signature:", error);
	}
}

function addFooter(doc: jsPDF, companyInfo: any): void {
	const pageCount = doc.getNumberOfPages();

	for (let i = 1; i <= pageCount; i++) {
		doc.setPage(i);
		doc.setFontSize(8);
		doc.setFont("helvetica", "normal");
		doc.text(
			`${companyInfo.name} - ${companyInfo.street} ${companyInfo.number}, ${companyInfo.zip} ${companyInfo.city}`,
			105,
			285,
			{
				align: "center",
			},
		);
		doc.text(`Seite ${i} von ${pageCount}`, 190, 285, { align: "right" });
	}
}

function addWatermark(doc: jsPDF, type: DocumentType): void {
	// Save current state
	const currentFontSize = doc.getFontSize();
	const currentTextColor = doc.getTextColor();

	// Set watermark properties
	doc.setFontSize(60);
	doc.setTextColor(230, 230, 230); // Light gray
	doc.setFont("helvetica", "bold");

	// Get watermark text based on document type
	let watermarkText = "";
	switch (type) {
		case "angebot":
			watermarkText = "ANGEBOT";
			break;
		case "rechnung":
			watermarkText = "RECHNUNG";
			break;
		case "lieferschein":
			watermarkText = "LIEFERSCHEIN";
			break;
	}

	// Add watermark to each page
	const pageCount = doc.getNumberOfPages();
	for (let i = 1; i <= pageCount; i++) {
		doc.setPage(i);

		// Calculate center position
		const pageWidth = doc.internal.pageSize.width;
		const pageHeight = doc.internal.pageSize.height;

		// Rotate and add text
		doc.saveGraphicsState();
		doc.translate(pageWidth / 2, pageHeight / 2);
		doc.rotate(-45);
		doc.text(watermarkText, 0, 0, { align: "center" });
		doc.restoreGraphicsState();
	}

	// Restore original state
	doc.setFontSize(currentFontSize);
	doc.setTextColor(currentTextColor);
}
