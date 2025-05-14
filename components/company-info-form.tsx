"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getCompanyInfo, saveCompanyInfo } from "@/lib/company-service";
import {
	type CompanyInfoSchemaType,
	companyInfoSchema,
} from "@/schemas/company-schema";

interface CompanyInfoFormProps {
	onSave?: (data: CompanyInfoSchemaType) => void;
	initialData?: Partial<CompanyInfoSchemaType>;
}

const defaultValues: CompanyInfoSchemaType = {
	name: "",
	email: "",
	phone: "",
	street: "",
	zip: "",
	city: "",
	bankDetails: {
		institute: "",
		recipient: "",
		iban: "",
		bic: "",
	},
	registrationNumber: "",
	vatId: "",
	taxId: "",
};

export function CompanyInfoForm({ onSave, initialData }: CompanyInfoFormProps) {
	const isEdit = !!initialData;
	const { toast } = useToast();
	const [isSaving, startTransition] = useTransition();
	const [companyId, setCompanyId] = useState<string | null>(null);
	// Initialize form with default values or provided initial data
	const form = useForm<CompanyInfoSchemaType>({
		resolver: zodResolver(companyInfoSchema),
		defaultValues: {
			...defaultValues,
		},
	});

	useEffect(() => {
		const fetchCompanyInfo = async () => {
			const companyInfo = await getCompanyInfo();
			setCompanyId(companyInfo?.id ?? null);
			form.reset(JSON.parse(JSON.stringify(companyInfo ?? defaultValues)));
		};
		fetchCompanyInfo();
	}, [form]);

	// Handle form submission
	// FIXME: Reset Stop Submit
	const onSubmit = async (data: CompanyInfoSchemaType) => {
		startTransition(async () => {
			try {
				// Save to localStorage
				console.log(isEdit ? `PATCH, ${data.id}` : "POST");
				await saveCompanyInfo(data, isEdit ? data.id : undefined);

				// Call the onSave callback if provided
				if (onSave) {
					onSave(data);
				}

				toast({
					title: "Firmendaten gespeichert",
					description: "Ihre Firmendaten wurden erfolgreich gespeichert.",
				});
			} catch (error) {
				console.error("Error saving company info:", error);
				toast({
					title: "Fehler beim Speichern",
					description: "Ihre Firmendaten konnten nicht gespeichert werden.",
					variant: "destructive",
				});
			}
		});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<Tabs defaultValue="basic" className="w-full">
					<TabsList className="mb-4 flex flex-wrap h-auto justify-center md:justify-start w-fit">
						<TabsTrigger value="basic">Grunddaten</TabsTrigger>
						<TabsTrigger value="contact">Kontakt</TabsTrigger>
						<TabsTrigger value="bank">Bankverbindung</TabsTrigger>
						<TabsTrigger value="additional">Zusatzinformationen</TabsTrigger>
					</TabsList>

					{/* Basic Information Tab */}
					<TabsContent value="basic">
						<Card>
							<CardHeader>
								<CardTitle>Grunddaten</CardTitle>
								<CardDescription>
									Geben Sie die grundlegenden Informationen zu Ihrem Unternehmen
									ein.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Firmenname *</FormLabel>
												<FormControl>
													<Input placeholder="KMW GmbH" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="legalForm"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Rechtsform</FormLabel>
												<FormControl>
													<Input placeholder="GmbH" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="vatId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>UID-Nummer</FormLabel>
												<FormControl>
													<Input placeholder="ATU12345678" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="taxId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Steuernummer</FormLabel>
												<FormControl>
													<Input placeholder="123/4567" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="registrationNumber"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Firmenbuchnummer</FormLabel>
											<FormControl>
												<Input placeholder="FN 123456a" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<FormField
										control={form.control}
										name="street"
										render={({ field }) => (
											<FormItem className="md:col-span-2">
												<FormLabel>Straße *</FormLabel>
												<FormControl>
													<Input placeholder="Puchsbaumgasse" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="number"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Hausnummer</FormLabel>
												<FormControl>
													<Input placeholder="1" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<FormField
										control={form.control}
										name="zip"
										render={({ field }) => (
											<FormItem>
												<FormLabel>PLZ *</FormLabel>
												<FormControl>
													<Input placeholder="1100" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="city"
										render={({ field }) => (
											<FormItem className="md:col-span-2">
												<FormLabel>Ort *</FormLabel>
												<FormControl>
													<Input placeholder="Wien" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="country"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Land *</FormLabel>
											<FormControl>
												<Input placeholder="Österreich" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Contact Information Tab */}
					<TabsContent value="contact">
						<Card>
							<CardHeader>
								<CardTitle>Kontaktinformationen</CardTitle>
								<CardDescription>
									Geben Sie die Kontaktdaten Ihres Unternehmens ein.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>E-Mail *</FormLabel>
												<FormControl>
													<Input placeholder="office@kmw.at" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="phone"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Telefon *</FormLabel>
												<FormControl>
													<Input placeholder="0676123456789" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="website"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Website</FormLabel>
												<FormControl>
													<Input placeholder="https://www.kmw.at" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="fax"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Fax</FormLabel>
												<FormControl>
													<Input placeholder="01234567890" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Bank Information Tab */}
					<TabsContent value="bank">
						<Card>
							<CardHeader>
								<CardTitle>Bankverbindung</CardTitle>
								<CardDescription>
									Geben Sie die Bankverbindung Ihres Unternehmens ein.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="bankDetails.institute"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Bank</FormLabel>
												<FormControl>
													<Input placeholder="Erste Bank" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="bankDetails.recipient"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Kontoinhaber</FormLabel>
												<FormControl>
													<Input placeholder="KMW GmbH" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="bankDetails.iban"
										render={({ field }) => (
											<FormItem>
												<FormLabel>IBAN</FormLabel>
												<FormControl>
													<Input placeholder="AT12 3456 7890 3456" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="bankDetails.bic"
										render={({ field }) => (
											<FormItem>
												<FormLabel>BIC</FormLabel>
												<FormControl>
													<Input placeholder="GIBAATWWXXX" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Additional Information Tab */}
					<TabsContent value="additional">
						<Card>
							<CardHeader>
								<CardTitle>Zusatzinformationen</CardTitle>
								<CardDescription>
									Geben Sie weitere Informationen zu Ihrem Unternehmen ein.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<FormField
										control={form.control}
										name="foundingYear"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Gründungsjahr</FormLabel>
												<FormControl>
													<Input placeholder="2020" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="employees"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Mitarbeiteranzahl</FormLabel>
												<FormControl>
													<Input placeholder="10-49" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="industry"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Branche</FormLabel>
												<FormControl>
													<Input placeholder="Handel" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="notes"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Notizen</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Interne Notizen zu Ihrem Unternehmen"
													className="min-h-[100px]"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				<div className="mt-6 flex justify-end">
					<Button type="submit" disabled={isSaving}>
						{isSaving ? (
							<>Speichern...</>
						) : (
							<>
								<Save className="mr-2 h-4 w-4" />
								Firmendaten speichern
							</>
						)}
					</Button>
				</div>
			</form>
		</Form>
	);
}
