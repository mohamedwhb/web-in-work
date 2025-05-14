import { CompanyInfoSchemaType } from "@/schemas/company-schema";
import type { Prisma } from "@prisma/client";
import { secureFetch } from "./secure-fetch";

export type CompanyInfo = Prisma.CompanyGetPayload<{
	include: {
		bankDetails: true;
	};
}>;
// Default company information
export const defaultCompanyInfo: CompanyInfo = {
	name: "",
	legalForm: "",
	registrationNumber: "",
	vatId: "",
	taxId: "",

	email: "",
	phone: "",
	website: "",
	fax: "",

	street: "",
	number: "",
	zip: "",
	city: "",
	country: "",

	bankDetails: {
		institute: "",
		recipient: "",
		iban: "",
		bic: "",
		id: "",
		createdAt: new Date(),
		updatedAt: new Date(),
		reference: "",
	},

	foundingYear: "",
	employees: "",
	industry: "",
	notes: "",
	logo: "",
};

// Get company information
export async function getCompanyInfo(): Promise<CompanyInfo> {
	try {
		const res = await fetch("/api/company");
		const data = await res.json();
		return data.company;
	} catch (error) {
		console.error("Error parsing saved company info:", error);
		return defaultCompanyInfo;
	}
}

// Save company information
export async function saveCompanyInfo(
	companyInfo: CompanyInfoSchemaType,
	companyId?: string,
): Promise<void> {
	try {
		const res = await secureFetch("/api/company", {
			method: "POST",
			body: JSON.stringify({
				company: companyInfo,
				companyId,
			}),
		});
		if (!res.ok) {
			throw new Error("Failed to save company info");
		}
		const data = await res.json();
		localStorage.setItem("companyInfo", JSON.stringify(data.company));
		return data.company;
	} catch (error) {
		console.error("Error saving company info:", error);
	}
}

// Get formatted company address
export function getFormattedAddress(companyInfo: CompanyInfo): string {
	const { street, number, zip, city, country } = companyInfo;
	let address = "";

	if (street) {
		address += street;
		if (number) {
			address += ` ${number}`;
		}
		address += ", ";
	}

	if (zip || city) {
		if (zip) {
			address += zip;
			if (city) {
				address += " ";
			}
		}
		if (city) {
			address += city;
		}
		if (country && country !== "Österreich") {
			address += `, ${country}`;
		}
	}

	return address;
}

// Get company information for documents
export async function getCompanyInfoForDocuments(): Promise<{
	name: string;
	address: string;
	contact: string;
	vatId?: string;
	bankDetails?: {
		name: string;
		holder: string;
		iban: string;
		bic: string;
	};
}> {
	const companyInfo = await getCompanyInfo();

	return {
		name: `${companyInfo.name}${companyInfo.legalForm ? ` ${companyInfo.legalForm}` : ""}`,
		address: getFormattedAddress(companyInfo),
		contact: `Tel: ${companyInfo.phone}${companyInfo.email ? ` | E-Mail: ${companyInfo.email}` : ""}`,
		vatId: companyInfo.vatId || "",
		bankDetails:
			companyInfo.bankDetails?.institute && companyInfo.bankDetails?.iban
				? {
						name: companyInfo.bankDetails.institute,
						holder: companyInfo.bankDetails.recipient || companyInfo.name,
						iban: companyInfo.bankDetails.iban,
						bic: companyInfo.bankDetails.bic || "",
					}
				: undefined,
	};
}
