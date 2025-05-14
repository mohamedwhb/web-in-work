import {
	DEFAULT_WIDGETS,
	type WidgetConfig,
	type WidgetData,
} from "@/components/dashboard/widget-types";

// Mock data for demonstration
const mockData: Record<string, any> = {
	"monthly-revenue": {
		value: 12450.75,
		change: 8.5,
		changeType: "increase",
		format: "currency",
		previousValue: 11475.35,
		trend: [10200, 10800, 11200, 11475, 12450],
	},
	"open-invoices": {
		value: 8750.25,
		count: 12,
		format: "currency",
		secondaryValue: 12,
		secondaryFormat: "count",
		secondaryLabel: "offene Rechnungen",
	},
	"overdue-invoices": {
		value: 2250.5,
		count: 4,
		format: "currency",
		secondaryValue: 4,
		secondaryFormat: "count",
		secondaryLabel: "überfällige Rechnungen",
		severity: "high",
	},
	"conversion-rate": {
		value: 64,
		change: 12.5,
		changeType: "increase",
		format: "percentage",
		previousValue: 56.9,
	},
	"offers-by-status": {
		labels: ["Offen", "Angenommen", "Abgelehnt"],
		values: [15, 27, 8],
		colors: ["#3b82f6", "#22c55e", "#ef4444"],
	},
	"sales-trend": {
		labels: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun"],
		datasets: [
			{
				label: "2023",
				data: [8200, 7800, 9500, 8700, 9100, 9800],
				borderColor: "#3b82f6",
			},
			{
				label: "2022",
				data: [7500, 7200, 8300, 7900, 8200, 8600],
				borderColor: "#94a3b8",
			},
		],
	},
	"top-customers": {
		items: [
			{ id: 1, name: "XYZ GmbH", value: 4250.5, change: 15 },
			{ id: 2, name: "ABC AG", value: 3120.75, change: 8 },
			{ id: 3, name: "Musterfirma", value: 2840.25, change: -5 },
			{ id: 4, name: "Beispiel KG", value: 1950.5, change: 12 },
			{ id: 5, name: "Test GmbH & Co. KG", value: 1580.75, change: 3 },
		],
	},
	"inventory-status": {
		total: 120,
		statuses: [
			{ label: "Auf Lager", value: 109, color: "green" },
			{ label: "Niedriger Bestand", value: 8, color: "amber" },
			{ label: "Nicht auf Lager", value: 3, color: "red" },
		],
	},
	"cashflow-forecast": {
		labels: ["30 Tage", "60 Tage", "90 Tage"],
		values: [15250.5, 28750.75, 42500.25],
		colors: ["#3b82f6", "#8b5cf6", "#a855f7"],
	},
	"monthly-comparison": {
		current: {
			label: "Aktueller Monat",
			value: 12450.75,
		},
		previous: {
			label: "Vormonat",
			value: 11475.35,
		},
		change: 8.5,
		changeType: "increase",
		format: "currency",
	},
	"product-performance": {
		items: [
			{ id: 1, name: "Produkt A", value: 2450.5, change: 12, quantity: 48 },
			{ id: 2, name: "Produkt B", value: 1980.25, change: 8, quantity: 35 },
			{ id: 3, name: "Produkt C", value: 1540.75, change: -3, quantity: 27 },
			{ id: 4, name: "Produkt D", value: 1250.5, change: 5, quantity: 22 },
			{ id: 5, name: "Produkt E", value: 980.25, change: 2, quantity: 18 },
		],
	},
	"employee-performance": {
		items: [
			{ id: 1, name: "Max Mustermann", value: 3250.5, deals: 12 },
			{ id: 2, name: "Anna Schmidt", value: 2980.25, deals: 10 },
			{ id: 3, name: "Thomas Müller", value: 2540.75, deals: 8 },
			{ id: 4, name: "Lisa Weber", value: 2250.5, deals: 7 },
			{ id: 5, name: "Michael Becker", value: 1980.25, deals: 6 },
		],
	},
	"regional-sales": {
		labels: ["Nord", "Süd", "Ost", "West", "Zentral"],
		values: [4250.5, 3980.25, 3540.75, 3250.5, 2980.25],
		colors: ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"],
	},
	"payment-methods": {
		labels: ["Überweisung", "Kreditkarte", "PayPal", "Lastschrift", "Bar"],
		values: [45, 25, 15, 10, 5],
		colors: ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"],
	},
	"customer-acquisition": {
		labels: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun"],
		datasets: [
			{
				label: "Neue Kunden",
				data: [5, 7, 4, 9, 6, 8],
				borderColor: "#3b82f6",
			},
			{
				label: "Wiederkehrende Kunden",
				data: [12, 15, 14, 18, 16, 20],
				borderColor: "#22c55e",
			},
		],
	},
};

// Get all widget configurations
export async function getWidgetConfigurations(): Promise<WidgetConfig[]> {
	// In a real application, this would fetch from an API or database
	return new Promise((resolve) => {
		setTimeout(() => {
			// Get from localStorage if available, otherwise use defaults
			const savedWidgets = localStorage.getItem("dashboard-widgets");
			if (savedWidgets) {
				resolve(JSON.parse(savedWidgets));
			} else {
				resolve(DEFAULT_WIDGETS);
			}
		}, 300);
	});
}

// Save widget configurations
export async function saveWidgetConfigurations(
	widgets: WidgetConfig[],
): Promise<boolean> {
	return new Promise((resolve) => {
		setTimeout(() => {
			// In a real application, this would save to an API or database
			localStorage.setItem("dashboard-widgets", JSON.stringify(widgets));
			resolve(true);
		}, 300);
	});
}

// Get data for a specific widget
export async function getWidgetData(
	widgetId: string,
	dateRange?: string,
	customDateRange?: { start: string; end: string },
): Promise<WidgetData> {
	return new Promise((resolve) => {
		setTimeout(() => {
			// In a real application, this would fetch from an API based on the widget configuration
			// and apply date range filters

			// For now, we'll just return the mock data
			const data = mockData[widgetId] || { error: "No data available" };

			// Apply simple date range filtering for demonstration
			if (dateRange && data) {
				// In a real application, we would filter the data based on the date range
				// For now, we'll just add a note to the data
				data.dateRangeApplied = dateRange;
				if (customDateRange) {
					data.customDateRange = customDateRange;
				}
			}

			resolve({
				loading: false,
				lastUpdated: new Date(),
				data: data,
			});
		}, 500);
	});
}

// Reset widget configurations to defaults
export async function resetWidgetConfigurations(): Promise<boolean> {
	return new Promise((resolve) => {
		setTimeout(() => {
			localStorage.removeItem("dashboard-widgets");
			resolve(true);
		}, 300);
	});
}

// Add a new widget
export async function addWidget(
	widget: Omit<WidgetConfig, "id">,
): Promise<WidgetConfig> {
	const widgets = await getWidgetConfigurations();
	const newWidget = {
		...widget,
		id: `widget-${Date.now()}`,
		position: widgets.length,
	};

	await saveWidgetConfigurations([...widgets, newWidget as WidgetConfig]);
	return newWidget as WidgetConfig;
}

// Delete a widget
export async function deleteWidget(widgetId: string): Promise<boolean> {
	const widgets = await getWidgetConfigurations();
	const updatedWidgets = widgets.filter((w) => w.id !== widgetId);
	return saveWidgetConfigurations(updatedWidgets);
}

// Update a widget
export async function updateWidget(widget: WidgetConfig): Promise<boolean> {
	const widgets = await getWidgetConfigurations();
	const updatedWidgets = widgets.map((w) => (w.id === widget.id ? widget : w));
	return saveWidgetConfigurations(updatedWidgets);
}

// Get dashboard settings
export async function getDashboardSettings(): Promise<any> {
	return new Promise((resolve) => {
		setTimeout(() => {
			const savedSettings = localStorage.getItem("dashboard-settings");
			if (savedSettings) {
				resolve(JSON.parse(savedSettings));
			} else {
				resolve({
					refreshInterval: 5, // minutes
					theme: "light",
					layout: "grid",
					compactView: false,
					autoRefresh: true,
				});
			}
		}, 300);
	});
}

// Save dashboard settings
export async function saveDashboardSettings(settings: any): Promise<boolean> {
	return new Promise((resolve) => {
		setTimeout(() => {
			localStorage.setItem("dashboard-settings", JSON.stringify(settings));
			resolve(true);
		}, 300);
	});
}

// Export dashboard configuration
export function exportDashboardConfig(): string {
	const widgets = localStorage.getItem("dashboard-widgets") || "[]";
	const settings = localStorage.getItem("dashboard-settings") || "{}";

	const config = {
		widgets: JSON.parse(widgets),
		settings: JSON.parse(settings),
		exportDate: new Date().toISOString(),
	};

	return JSON.stringify(config);
}

// Import dashboard configuration
export async function importDashboardConfig(
	configString: string,
): Promise<boolean> {
	try {
		const config = JSON.parse(configString);

		if (config.widgets) {
			await saveWidgetConfigurations(config.widgets);
		}

		if (config.settings) {
			await saveDashboardSettings(config.settings);
		}

		return true;
	} catch (error) {
		console.error("Error importing dashboard configuration:", error);
		return false;
	}
}
