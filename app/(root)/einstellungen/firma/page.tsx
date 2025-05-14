"use client";

import { CompanyInfoForm } from "@/components/company-info-form";
import { CompanyInfoPreview } from "@/components/company-info-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CompanySettingsPage() {
	return (
		<div className="p-6 space-y-6">
			<header>
				<h1 className="text-2xl font-bold">Firmendaten</h1>
				<p className="text-muted-foreground">
					Verwalten Sie die Informationen Ihres Unternehmens, die in Dokumenten
					und auf der Website angezeigt werden.
				</p>
			</header>

			<Tabs defaultValue="edit" className="w-full">
				<TabsList className="mb-4 ">
					<TabsTrigger value="edit">Bearbeiten</TabsTrigger>
					<TabsTrigger value="preview">Vorschau</TabsTrigger>
				</TabsList>

				<TabsContent value="edit">
					<CompanyInfoForm />
				</TabsContent>

				<TabsContent value="preview">
					<CompanyInfoPreview />
				</TabsContent>
			</Tabs>
		</div>
	);
}
