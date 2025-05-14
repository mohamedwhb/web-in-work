"use client";

import LogoUpload from "@/components/logo-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { secureFetch } from "@/lib/secure-fetch";
import { Download, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";

export default function FirmenlogoPage() {
	const { toast } = useToast();
	const [companyLogo, setCompanyLogo] = useState<string | null>(null);
	const [showLogoUpload, setShowLogoUpload] = useState(false);
	const [companyId, setCompanyId] = useState<string | null>(null);

	const handleSaveLogo = (logoData: string) => {
		setCompanyLogo(logoData);

		setShowLogoUpload(false);
	};

	const handleDeleteLogo = async () => {
		try {
			await secureFetch("/api/company?logo=true", {
				method: "DELETE",
				body: JSON.stringify({ companyId }),
			});
			setCompanyLogo(null);
			toast({
				title: "Logo erfolgreich gelöscht",
				description: "Das Logo wurde erfolgreich gelöscht",
			});
		} catch (error) {
			console.error(error);
			toast({
				title: "Fehler beim Löschen des Logos",
				description: "Bitte versuchen Sie es erneut",
			});
		}
	};

	const handleDownloadLogo = () => {
		if (!companyLogo) return;

		const link = document.createElement("a");
		link.download = "company-logo.png";
		link.href = companyLogo;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	useEffect(() => {
		const fetchLogo = async () => {
			const res = await fetch("/api/company?logo=true");
			const data = await res.json();
			console.log(data);
			setCompanyId(data.company.id);
			if (data.company.logo) {
				setCompanyLogo(data.company.logo);
			}
		};
		fetchLogo();
	}, []);

	return (
		<div className="p-6 space-y-6">
			<header className="flex flex-wrap max-sm:gap-2 justify-between items-center">
				<h1 className="text-2xl font-bold">Firmenlogo</h1>
				<Button onClick={() => setShowLogoUpload(true)}>
					<Upload className="h-4 w-4 mr-2" />
					Logo hochladen
				</Button>
			</header>

			<Card>
				<CardHeader>
					<CardTitle>Aktuelles Logo</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="border rounded-md p-6 bg-white flex items-center justify-center min-h-[200px]">
						{companyLogo ? (
							<img
								src={companyLogo || "/placeholder.svg"}
								alt="Firmenlogo"
								className="max-h-40 max-w-full object-contain"
							/>
						) : (
							<div className="text-center text-muted-foreground">
								<p>Kein Logo vorhanden</p>
								<p className="text-sm mt-2">
									Laden Sie ein Logo hoch, um es in Ihren Dokumenten zu
									verwenden.
								</p>
							</div>
						)}
					</div>

					{companyLogo && (
						<div className="flex justify-end gap-2">
							<Button variant="outline" size="sm" onClick={handleDownloadLogo}>
								<Download className="h-4 w-4 mr-2" />
								Herunterladen
							</Button>
							<Button variant="outline" size="sm" onClick={handleDeleteLogo}>
								<Trash2 className="h-4 w-4 mr-2" />
								Löschen
							</Button>
						</div>
					)}

					<div className="bg-muted p-4 rounded-md mt-6">
						<h3 className="font-medium mb-2">Hinweise</h3>
						<ul className="text-sm space-y-1 list-disc pl-4">
							<li>
								Das Logo wird in Angeboten, Rechnungen und Lieferscheinen
								angezeigt.
							</li>
							<li>
								Für beste Ergebnisse verwenden Sie ein Logo mit transparentem
								Hintergrund (PNG oder SVG).
							</li>
							<li>Empfohlene Größe: 300 x 150 Pixel.</li>
							<li>Maximale Dateigröße: 2MB.</li>
						</ul>
					</div>
				</CardContent>
			</Card>

			<Dialog open={showLogoUpload} onOpenChange={setShowLogoUpload}>
				<DialogContent>
					<LogoUpload
						onSave={handleSaveLogo}
						onCancel={() => setShowLogoUpload(false)}
						initialLogo={companyLogo || undefined}
						companyId={companyId || ""}
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
}
