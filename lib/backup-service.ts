import { secureFetch } from "@/lib/secure-fetch";

// Typen für Backup-Funktionalität
export interface Backup {
	id: string;
	name: string;
	createdAt: Date;
	size: string;
	type: "manual" | "automatic";
	status: "completed" | "in_progress" | "failed";
	location: "local" | "cloud";
}

export interface BackupSettings {
	automaticBackups: boolean;
	frequency: "daily" | "weekly" | "monthly";
	retention: number;
	includedData: {
		customers: boolean;
		products: boolean;
		invoices: boolean;
		offers: boolean;
		deliveryNotes: boolean;
		inventory: boolean;
		settings: boolean;
	};
	storageLocation: "local" | "cloud";
	cloudProvider?: "google_drive" | "dropbox" | "onedrive";
	lastBackup?: Date;
	nextBackup?: Date;
}

// Service-Funktionen
export const BackupService = {
	getBackups: async (): Promise<Backup[]> => {
		try {
			const res = await fetch("/api/backups");
			if (!res.ok) throw new Error("Failed to fetch backups");
			return await res.json();
		} catch (error) {
			console.error(error);
			return [];
		}
	},

	getBackupSettings: async (): Promise<BackupSettings> => {
		try {
			const res = await fetch("/api/backup-settings");
			if (!res.ok) throw new Error("Failed to fetch backup settings");
			return await res.json();
		} catch (error) {
			console.error(error);
			throw error;
		}
	},

	createBackup: async (name: string): Promise<Backup> => {
		try {
			const res = await secureFetch("/api/backups", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name }),
			});
			if (!res.ok) throw new Error("Failed to create backup");
			return await res.json();
		} catch (error) {
			console.error(error);
			throw error;
		}
	},

	restoreBackup: async (backupId: string): Promise<boolean> => {
		try {
			const res = await secureFetch(`/api/backups/${backupId}/restore`, {
				method: "POST",
			});
			return res.ok;
		} catch (error) {
			console.error(error);
			return false;
		}
	},

	updateBackupSettings: async (
		settings: Partial<BackupSettings>,
	): Promise<BackupSettings> => {
		try {
			const res = await secureFetch("/api/backup-settings", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(settings),
			});
			if (!res.ok) throw new Error("Failed to update backup settings");
			return await res.json();
		} catch (error) {
			console.error(error);
			throw error;
		}
	},

	downloadBackup: async (backupId: string): Promise<boolean> => {
		try {
			const res = await fetch(`/api/backups/${backupId}/download`);
			return res.ok;
		} catch (error) {
			console.error(error);
			return false;
		}
	},

	deleteBackup: async (backupId: string): Promise<boolean> => {
		try {
			const res = await secureFetch(`/api/backups/${backupId}`, {
				method: "DELETE",
			});
			return res.ok;
		} catch (error) {
			console.error(error);
			return false;
		}
	},
};
