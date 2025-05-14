"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useUploadThing } from "@/lib/uploadthing";
import { Check, ImageIcon, Trash2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface LogoUploadProps {
	onSave: (logoData: string) => void;
	onCancel: () => void;
	initialLogo?: string;
	companyId: string;
}

export default function LogoUpload({
	onSave,
	onCancel,
	initialLogo,
	companyId,
}: LogoUploadProps) {
	const [logoPreview, setLogoPreview] = useState<string | null>(
		initialLogo || null,
	);
	const [isLoading, setIsLoading] = useState(false);
	const [logoFile, setLogoFile] = useState<File | null>(null);

	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Check file type
		if (!file.type.startsWith("image/")) {
			alert("Bitte wählen Sie eine Bilddatei aus.");
			return;
		}

		// Check file size (max 2MB)
		if (file.size > 2 * 1024 * 1024) {
			alert("Die Datei ist zu groß. Maximale Größe: 2MB.");
			return;
		}

		setLogoFile(file);
		setIsLoading(true);
		const reader = new FileReader();
		reader.onload = (event) => {
			setLogoPreview(event.target?.result as string);
			setIsLoading(false);
		};
		reader.onerror = () => {
			alert("Fehler beim Lesen der Datei.");
			setIsLoading(false);
		};
		reader.readAsDataURL(file);
	};

	const handleClearLogo = () => {
		setLogoPreview(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};
	const [isPending, startTransition] = useTransition();
	const { startUpload, isUploading } = useUploadThing("companyImageUploader");

	const handleSaveLogo = () => {
		if (logoPreview && logoFile) {
			startTransition(() => {
				startUpload([logoFile], {
					companyId,
					configId: "",
				});
			});
			onSave(logoPreview);
		} else {
			onCancel();
		}
	};

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Firmenlogo</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="border rounded-md p-4 bg-white flex items-center justify-center min-h-40">
					{logoPreview ? (
						<img
							src={logoPreview || "/placeholder.svg"}
							alt="Firmenlogo"
							className="max-h-40 max-w-full object-contain"
						/>
					) : (
						<div className="flex flex-col items-center justify-center text-muted-foreground">
							<ImageIcon className="h-12 w-12 mb-2" />
							<p>Kein Logo ausgewählt</p>
						</div>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="logo-upload">Logo hochladen</Label>
					<Input
						id="logo-upload"
						type="file"
						accept="image/*"
						onChange={handleFileChange}
						ref={fileInputRef}
						disabled={isLoading}
					/>
					<p className="text-xs text-muted-foreground">
						Unterstützte Formate: JPG, PNG, SVG. Maximale Größe: 2MB.
					</p>
				</div>
			</CardContent>
			<CardFooter className="flex justify-between">
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleClearLogo}
						disabled={!logoPreview || isLoading}
					>
						<Trash2 className="h-4 w-4 mr-2" />
						Löschen
					</Button>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={onCancel}
						disabled={isLoading}
					>
						Abbrechen
					</Button>
					<Button size="sm" onClick={handleSaveLogo} disabled={isLoading}>
						<Check className="h-4 w-4 mr-2" />
						Übernehmen
					</Button>
				</div>
			</CardFooter>
		</Card>
	);
}
