"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Clock, Loader2, XCircle } from "lucide-react";
import { useState } from "react";

interface StatusChangeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentStatus: "OPEN" | "ACCEPTED" | "REJECTED";
	onStatusChange: (
		status: "OPEN" | "ACCEPTED" | "REJECTED",
		note: string,
	) => void;
}

export default function StatusChangeDialog({
	open,
	onOpenChange,
	currentStatus,
	onStatusChange,
}: StatusChangeDialogProps) {
	const [status, setStatus] = useState<"OPEN" | "ACCEPTED" | "REJECTED">(
		currentStatus,
	);
	const [note, setNote] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = () => {
		setIsSubmitting(true);

		// Simulate API call delay
		setTimeout(() => {
			onStatusChange(status, note);
			setIsSubmitting(false);
		}, 500);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(newOpen) => {
				if (!isSubmitting) {
					onOpenChange(newOpen);
				}
			}}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Angebotsstatus ändern</DialogTitle>
					<DialogDescription>
						Wählen Sie den neuen Status für dieses Angebot und fügen Sie
						optional eine Notiz hinzu.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<RadioGroup
						value={status}
						onValueChange={(value) => setStatus(value as any)}
						className="space-y-3"
					>
						<div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted">
							<RadioGroupItem value="open" id="status-open" />
							<Label
								htmlFor="status-open"
								className="flex items-center cursor-pointer"
							>
								<Clock className="h-4 w-4 mr-2 text-blue-600" />
								<span>Offen</span>
							</Label>
						</div>

						<div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted">
							<RadioGroupItem value="accepted" id="status-accepted" />
							<Label
								htmlFor="status-accepted"
								className="flex items-center cursor-pointer"
							>
								<CheckCircle className="h-4 w-4 mr-2 text-green-600" />
								<span>Angenommen</span>
							</Label>
						</div>

						<div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted">
							<RadioGroupItem value="rejected" id="status-rejected" />
							<Label
								htmlFor="status-rejected"
								className="flex items-center cursor-pointer"
							>
								<XCircle className="h-4 w-4 mr-2 text-red-600" />
								<span>Abgelehnt</span>
							</Label>
						</div>
					</RadioGroup>

					<div className="space-y-2">
						<Label htmlFor="status-note">Notiz (optional)</Label>
						<Textarea
							id="status-note"
							placeholder="Geben Sie eine Notiz zum Statuswechsel ein..."
							value={note}
							onChange={(e) => setNote(e.target.value)}
							rows={3}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isSubmitting}
					>
						Abbrechen
					</Button>
					<Button onClick={handleSubmit} disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Wird gespeichert...
							</>
						) : (
							"Status ändern"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
