"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	formatDateForDisplay,
	formatMonthForDisplay,
	formatWeekForDisplay,
	predictCashFlow,
} from "@/lib/cash-flow-utils";
import type { InvoiceData, PaymentStatus } from "@/lib/invoice-types";
import { addDays, subDays } from "date-fns";
import {
	AlertTriangle,
	ArrowDownRight,
	ArrowUpRight,
	Calendar,
	CheckCircle2,
	HelpCircle,
	Info,
	TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

// Mock data for invoices
const mockInvoices: InvoiceData[] = [
	{
		id: "RE-2025-001",
		date: new Date(2025, 0, 5),
		customer: {
			id: "C001",
			name: "Max Mustermann GmbH",
			address: "Musterstraße 1, 12345 Berlin",
			email: "info@mustermann.de",
			phone: "+49 123 456789",
			taxId: "DE123456789",
		},
		items: [],
		notes: "",
		paymentTerms: "14 Tage",
		paymentStatus: "paid" as PaymentStatus,
		paymentMethod: "bank_transfer",
		paymentDueDate: new Date(2025, 0, 19),
		paymentDate: new Date(2025, 0, 15),
		paymentAmount: 1250.5,
		paymentReference: "RE-2025-001",
		offerReference: "AN-2024-001",
		total: 1250.5,
	},
	{
		id: "RE-2025-002",
		date: new Date(2025, 0, 8),
		customer: {
			id: "C002",
			name: "Firma ABC",
			address: "Hauptstraße 10, 10115 Berlin",
			email: "kontakt@firmaabc.de",
			phone: "+49 30 123456",
			taxId: "DE987654321",
		},
		items: [],
		notes: "",
		paymentTerms: "14 Tage",
		paymentStatus: "unpaid" as PaymentStatus,
		paymentMethod: "bank_transfer",
		paymentDueDate: new Date(2025, 0, 22),
		paymentDate: null,
		paymentAmount: 0,
		paymentReference: "RE-2025-002",
		offerReference: "AN-2024-002",
		total: 780.25,
	},
	{
		id: "RE-2025-003",
		date: new Date(2025, 0, 12),
		customer: {
			id: "C003",
			name: "XYZ GmbH",
			address: "Industrieweg 5, 70565 Stuttgart",
			email: "info@xyzgmbh.de",
			phone: "+49 711 987654",
			taxId: "DE135792468",
		},
		items: [],
		notes: "",
		paymentTerms: "14 Tage",
		paymentStatus: "partial" as PaymentStatus,
		paymentMethod: "credit_card",
		paymentDueDate: new Date(2025, 0, 26),
		paymentDate: new Date(2025, 0, 20),
		paymentAmount: 1000.0,
		paymentReference: "RE-2025-003",
		offerReference: "AN-2024-003",
		total: 2340.0,
	},
	{
		id: "RE-2025-004",
		date: new Date(2025, 0, 15),
		customer: {
			id: "C004",
			name: "Muster & Co KG",
			address: "Marktplatz 3, 80331 München",
			email: "kontakt@musterco.de",
			phone: "+49 89 123456",
			taxId: "DE246813579",
		},
		items: [],
		notes: "",
		paymentTerms: "14 Tage",
		paymentStatus: "overdue" as PaymentStatus,
		paymentMethod: "bank_transfer",
		paymentDueDate: new Date(2025, 0, 29),
		paymentDate: null,
		paymentAmount: 0,
		paymentReference: "RE-2025-004",
		offerReference: "AN-2024-004",
		total: 450.75,
	},
	// Future invoices with upcoming due dates
	{
		id: "RE-2025-005",
		date: new Date(),
		customer: {
			id: "C005",
			name: "Beispiel AG",
			address: "Beispielstraße 7, 60313 Frankfurt",
			email: "info@beispiel-ag.de",
			phone: "+49 69 987654",
			taxId: "DE369258147",
		},
		items: [],
		notes: "",
		paymentTerms: "14 Tage",
		paymentStatus: "unpaid" as PaymentStatus,
		paymentMethod: "bank_transfer",
		paymentDueDate: addDays(new Date(), 14),
		paymentDate: null,
		paymentAmount: 0,
		paymentReference: "RE-2025-005",
		offerReference: "AN-2024-005",
		total: 1875.3,
	},
	{
		id: "RE-2025-006",
		date: subDays(new Date(), 5),
		customer: {
			id: "C006",
			name: "Tech Solutions GmbH",
			address: "Technikstraße 12, 01069 Dresden",
			email: "info@techsolutions.de",
			phone: "+49 351 123456",
			taxId: "DE159753468",
		},
		items: [],
		notes: "",
		paymentTerms: "30 Tage",
		paymentStatus: "unpaid" as PaymentStatus,
		paymentMethod: "bank_transfer",
		paymentDueDate: addDays(new Date(), 25),
		paymentDate: null,
		paymentAmount: 0,
		paymentReference: "RE-2025-006",
		offerReference: "AN-2024-006",
		total: 3200.0,
	},
	{
		id: "RE-2025-007",
		date: subDays(new Date(), 10),
		customer: {
			id: "C007",
			name: "Digital Services KG",
			address: "Digitalweg 8, 20095 Hamburg",
			email: "kontakt@digitalservices.de",
			phone: "+49 40 987654",
			taxId: "DE753159852",
		},
		items: [],
		notes: "",
		paymentTerms: "14 Tage",
		paymentStatus: "unpaid" as PaymentStatus,
		paymentMethod: "paypal",
		paymentDueDate: addDays(new Date(), 4),
		paymentDate: null,
		paymentAmount: 0,
		paymentReference: "RE-2025-007",
		offerReference: "AN-2024-007",
		total: 950.45,
	},
	{
		id: "RE-2025-008",
		date: subDays(new Date(), 15),
		customer: {
			id: "C008",
			name: "Consulting Plus",
			address: "Beratergasse 15, 50667 Köln",
			email: "info@consultingplus.de",
			phone: "+49 221 123456",
			taxId: "DE951753684",
		},
		items: [],
		notes: "",
		paymentTerms: "14 Tage",
		paymentStatus: "unpaid" as PaymentStatus,
		paymentMethod: "bank_transfer",
		paymentDueDate: subDays(new Date(), 1),
		paymentDate: null,
		paymentAmount: 0,
		paymentReference: "RE-2025-008",
		offerReference: "AN-2024-008",
		total: 4500.0,
	},
	// Large future invoice
	{
		id: "RE-2025-009",
		date: new Date(),
		customer: {
			id: "C001",
			name: "Max Mustermann GmbH",
			address: "Musterstraße 1, 12345 Berlin",
			email: "info@mustermann.de",
			phone: "+49 123 456789",
			taxId: "DE123456789",
		},
		items: [],
		notes: "",
		paymentTerms: "30 Tage",
		paymentStatus: "unpaid" as PaymentStatus,
		paymentMethod: "bank_transfer",
		paymentDueDate: addDays(new Date(), 30),
		paymentDate: null,
		paymentAmount: 0,
		paymentReference: "RE-2025-009",
		offerReference: "AN-2024-009",
		total: 8500.0,
	},
	// More future invoices
	{
		id: "RE-2025-010",
		date: addDays(new Date(), 5),
		customer: {
			id: "C003",
			name: "XYZ GmbH",
			address: "Industrieweg 5, 70565 Stuttgart",
			email: "info@xyzgmbh.de",
			phone: "+49 711 987654",
			taxId: "DE135792468",
		},
		items: [],
		notes: "",
		paymentTerms: "14 Tage",
		paymentStatus: "unpaid" as PaymentStatus,
		paymentMethod: "credit_card",
		paymentDueDate: addDays(new Date(), 19),
		paymentDate: null,
		paymentAmount: 0,
		paymentReference: "RE-2025-010",
		offerReference: "AN-2024-010",
		total: 2100.0,
	},
	{
		id: "RE-2025-011",
		date: addDays(new Date(), 10),
		customer: {
			id: "C002",
			name: "Firma ABC",
			address: "Hauptstraße 10, 10115 Berlin",
			email: "kontakt@firmaabc.de",
			phone: "+49 30 123456",
			taxId: "DE987654321",
		},
		items: [],
		notes: "",
		paymentTerms: "14 Tage",
		paymentStatus: "unpaid" as PaymentStatus,
		paymentMethod: "bank_transfer",
		paymentDueDate: addDays(new Date(), 24),
		paymentDate: null,
		paymentAmount: 0,
		paymentReference: "RE-2025-011",
		offerReference: "AN-2024-011",
		total: 890.5,
	},
	{
		id: "RE-2025-012",
		date: addDays(new Date(), 15),
		customer: {
			id: "C006",
			name: "Tech Solutions GmbH",
			address: "Technikstraße 12, 01069 Dresden",
			email: "info@techsolutions.de",
			phone: "+49 351 123456",
			taxId: "DE159753468",
		},
		items: [],
		notes: "",
		paymentTerms: "14 Tage",
		paymentStatus: "unpaid" as PaymentStatus,
		paymentMethod: "bank_transfer",
		paymentDueDate: addDays(new Date(), 29),
		paymentDate: null,
		paymentAmount: 0,
		paymentReference: "RE-2025-012",
		offerReference: "AN-2024-012",
		total: 3450.25,
	},
	// Far future invoice
	{
		id: "RE-2025-013",
		date: addDays(new Date(), 45),
		customer: {
			id: "C005",
			name: "Beispiel AG",
			address: "Beispielstraße 7, 60313 Frankfurt",
			email: "info@beispiel-ag.de",
			phone: "+49 69 987654",
			taxId: "DE369258147",
		},
		items: [],
		notes: "",
		paymentTerms: "14 Tage",
		paymentStatus: "unpaid" as PaymentStatus,
		paymentMethod: "bank_transfer",
		paymentDueDate: addDays(new Date(), 59),
		paymentDate: null,
		paymentAmount: 0,
		paymentReference: "RE-2025-013",
		offerReference: "AN-2024-013",
		total: 1950.0,
	},
	{
		id: "RE-2025-014",
		date: addDays(new Date(), 60),
		customer: {
			id: "C007",
			name: "Digital Services KG",
			address: "Digitalweg 8, 20095 Hamburg",
			email: "kontakt@digitalservices.de",
			phone: "+49 40 987654",
			taxId: "DE753159852",
		},
		items: [],
		notes: "",
		paymentTerms: "14 Tage",
		paymentStatus: "unpaid" as PaymentStatus,
		paymentMethod: "bank_transfer",
		paymentDueDate: addDays(new Date(), 74),
		paymentDate: null,
		paymentAmount: 0,
		paymentReference: "RE-2025-014",
		offerReference: "AN-2024-014",
		total: 1050.75,
	},
	{
		id: "RE-2025-015",
		date: addDays(new Date(), 75),
		customer: {
			id: "C008",
			name: "Consulting Plus",
			address: "Beratergasse 15, 50667 Köln",
			email: "info@consultingplus.de",
			phone: "+49 221 123456",
			taxId: "DE951753684",
		},
		items: [],
		notes: "",
		paymentTerms: "14 Tage",
		paymentStatus: "unpaid" as PaymentStatus,
		paymentMethod: "bank_transfer",
		paymentDueDate: addDays(new Date(), 89),
		paymentDate: null,
		paymentAmount: 0,
		paymentReference: "RE-2025-015",
		offerReference: "AN-2024-015",
		total: 4800.0,
	},
];

export default function CashFlowPage() {
	const [isLoading, setIsLoading] = useState(true);
	const [forecastDays, setForecastDays] = useState("90");
	const [viewMode, setViewMode] = useState("cumulative");
	const [cashFlowData, setCashFlowData] = useState<any>(null);

	// Format currency
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("de-DE", {
			style: "currency",
			currency: "EUR",
		}).format(value);
	};

	// Simulate loading and calculate cash flow prediction
	useEffect(() => {
		const timer = setTimeout(() => {
			const days = Number.parseInt(forecastDays);
			const prediction = predictCashFlow(mockInvoices, days);
			setCashFlowData(prediction);
			setIsLoading(false);
		}, 1500);

		return () => clearTimeout(timer);
	}, [forecastDays]);

	// Custom tooltip for charts
	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white p-3 border rounded shadow-sm">
					<p className="font-medium mb-1">{label}</p>
					{payload.map((entry: any, index: number) => (
						<p key={index} style={{ color: entry.color }} className="text-sm">
							{entry.name}: {formatCurrency(entry.value)}
						</p>
					))}
				</div>
			);
		}
		return null;
	};

	// Prepare chart data based on view mode
	const prepareChartData = (data: any[], mode: string) => {
		if (!data) return [];

		return data.map((item) => {
			if (mode === "cumulative") {
				return {
					date: item.date,
					name: formatDateForDisplay(item.date),
					"Erwarteter Zahlungseingang (kumulativ)": item.cumulative,
					"Optimistisch (kumulativ)": item.cumulativeOptimistic,
					"Pessimistisch (kumulativ)": item.cumulativePessimistic,
				};
			} else {
				return {
					date: item.date,
					name: formatDateForDisplay(item.date),
					"Erwarteter Zahlungseingang": item.expected,
					Optimistisch: item.optimistic,
					Pessimistisch: item.pessimistic,
				};
			}
		});
	};

	return (
		<div className="p-6 space-y-6">
			<header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h1 className="text-2xl font-bold">Cash Flow Prognose</h1>
					<p className="text-muted-foreground">
						Vorhersage zukünftiger Zahlungseingänge basierend auf Rechnungsdaten
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-2">
					<Select value={forecastDays} onValueChange={setForecastDays}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Prognosezeitraum" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="30">30 Tage</SelectItem>
							<SelectItem value="60">60 Tage</SelectItem>
							<SelectItem value="90">90 Tage</SelectItem>
							<SelectItem value="180">180 Tage</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</header>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Expected Total */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">
							Erwartete Zahlungseingänge
							<Popover>
								<PopoverTrigger asChild>
									<Button variant="ghost" className="h-4 w-4 p-0 ml-1">
										<HelpCircle className="h-3 w-3" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-80">
									<p className="text-sm">
										Gesamtbetrag der erwarteten Zahlungseingänge im gewählten
										Prognosezeitraum, basierend auf Fälligkeitsdaten und
										Zahlungswahrscheinlichkeiten.
									</p>
								</PopoverContent>
							</Popover>
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-8 w-[120px]" />
						) : (
							<>
								<div className="text-2xl font-bold">
									{formatCurrency(cashFlowData?.summary.totalExpected || 0)}
								</div>
								<p className="text-xs text-muted-foreground">
									Für die nächsten {forecastDays} Tage
								</p>
							</>
						)}
					</CardContent>
				</Card>

				{/* Next 30 Days */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">
							Nächste 30 Tage
						</CardTitle>
						<Calendar className="h-4 w-4 text-blue-500" />
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-8 w-[120px]" />
						) : (
							<>
								<div className="text-2xl font-bold">
									{formatCurrency(cashFlowData?.summary.next30Days || 0)}
								</div>
								<div className="flex items-center text-xs text-blue-500">
									<ArrowUpRight className="h-3 w-3 mr-1" />
									{cashFlowData?.summary.next30Days > 0 &&
									cashFlowData?.summary.totalExpected > 0
										? `${Math.round((cashFlowData.summary.next30Days / cashFlowData.summary.totalExpected) * 100)}% der Gesamtsumme`
										: "0% der Gesamtsumme"}
								</div>
							</>
						)}
					</CardContent>
				</Card>

				{/* High Probability */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">
							Hohe Wahrscheinlichkeit
							<Popover>
								<PopoverTrigger asChild>
									<Button variant="ghost" className="h-4 w-4 p-0 ml-1">
										<HelpCircle className="h-3 w-3" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-80">
									<p className="text-sm">
										Betrag, der mit hoher Wahrscheinlichkeit eingehen wird
										(pessimistisches Szenario). Diese Summe kann für
										konservative Finanzplanung verwendet werden.
									</p>
								</PopoverContent>
							</Popover>
						</CardTitle>
						<CheckCircle2 className="h-4 w-4 text-green-500" />
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-8 w-[120px]" />
						) : (
							<>
								<div className="text-2xl font-bold">
									{formatCurrency(
										cashFlowData?.summary.highProbabilityAmount || 0,
									)}
								</div>
								<div className="flex items-center text-xs text-green-500">
									<ArrowUpRight className="h-3 w-3 mr-1" />
									{cashFlowData?.summary.highProbabilityAmount > 0 &&
									cashFlowData?.summary.totalExpected > 0
										? `${Math.round((cashFlowData.summary.highProbabilityAmount / cashFlowData.summary.totalExpected) * 100)}% der Prognose`
										: "0% der Prognose"}
								</div>
							</>
						)}
					</CardContent>
				</Card>

				{/* Risk Amount */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">
							Risikobetrag
							<Popover>
								<PopoverTrigger asChild>
									<Button variant="ghost" className="h-4 w-4 p-0 ml-1">
										<HelpCircle className="h-3 w-3" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-80">
									<p className="text-sm">
										Differenz zwischen optimistischem und pessimistischem
										Szenario. Dieser Betrag stellt das finanzielle Risiko dar,
										das von der Zahlungsmoral der Kunden abhängt.
									</p>
								</PopoverContent>
							</Popover>
						</CardTitle>
						<AlertTriangle className="h-4 w-4 text-amber-500" />
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-8 w-[120px]" />
						) : (
							<>
								<div className="text-2xl font-bold">
									{formatCurrency(cashFlowData?.summary.riskAmount || 0)}
								</div>
								<div className="flex items-center text-xs text-amber-500">
									<ArrowDownRight className="h-3 w-3 mr-1" />
									{cashFlowData?.summary.riskAmount > 0 &&
									cashFlowData?.summary.totalExpected > 0
										? `${Math.round((cashFlowData.summary.riskAmount / cashFlowData.summary.totalExpected) * 100)}% der Prognose`
										: "0% der Prognose"}
								</div>
							</>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Cash Flow Chart */}
			<Card>
				<CardHeader>
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center">
						<div>
							<CardTitle>Cash Flow Prognose</CardTitle>
							<CardDescription>
								Erwartete Zahlungseingänge über Zeit
							</CardDescription>
						</div>
						<div className="flex mt-2 md:mt-0">
							<Tabs defaultValue="daily" className="w-full">
								<TabsList>
									<TabsTrigger value="daily">Täglich</TabsTrigger>
									<TabsTrigger value="weekly">Wöchentlich</TabsTrigger>
									<TabsTrigger value="monthly">Monatlich</TabsTrigger>
								</TabsList>
							</Tabs>
							<Select
								value={viewMode}
								onValueChange={setViewMode}
								className="ml-2"
							>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Ansicht" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="cumulative">Kumulativ</SelectItem>
									<SelectItem value="individual">Einzelbeträge</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardHeader>
				<CardContent className="h-96">
					{isLoading ? (
						<Skeleton className="h-full w-full" />
					) : (
						<Tabs defaultValue="daily">
							<TabsContent value="daily" className="h-full">
								<ResponsiveContainer width="100%" height="100%">
									{viewMode === "cumulative" ? (
										<LineChart
											data={prepareChartData(cashFlowData?.dailyData, viewMode)}
										>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis
												dataKey="name"
												tick={{ fontSize: 12 }}
												interval={Math.floor(
													cashFlowData?.dailyData.length / 10,
												)}
											/>
											<YAxis tickFormatter={(value) => `${value / 1000}k €`} />
											<Tooltip content={<CustomTooltip />} />
											<Legend />
											<ReferenceLine y={0} stroke="#000" />
											<Line
												type="monotone"
												dataKey="Erwarteter Zahlungseingang (kumulativ)"
												stroke="#3b82f6"
												strokeWidth={2}
												dot={false}
											/>
											<Line
												type="monotone"
												dataKey="Optimistisch (kumulativ)"
												stroke="#10b981"
												strokeWidth={1}
												strokeDasharray="5 5"
												dot={false}
											/>
											<Line
												type="monotone"
												dataKey="Pessimistisch (kumulativ)"
												stroke="#f59e0b"
												strokeWidth={1}
												strokeDasharray="5 5"
												dot={false}
											/>
										</LineChart>
									) : (
										<BarChart
											data={prepareChartData(cashFlowData?.dailyData, viewMode)}
										>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis
												dataKey="name"
												tick={{ fontSize: 12 }}
												interval={Math.floor(
													cashFlowData?.dailyData.length / 10,
												)}
											/>
											<YAxis tickFormatter={(value) => `${value / 1000}k €`} />
											<Tooltip content={<CustomTooltip />} />
											<Legend />
											<Bar
												dataKey="Erwarteter Zahlungseingang"
												fill="#3b82f6"
											/>
											<Bar dataKey="Optimistisch" fill="#10b981" />
											<Bar dataKey="Pessimistisch" fill="#f59e0b" />
										</BarChart>
									)}
								</ResponsiveContainer>
							</TabsContent>
							<TabsContent value="weekly" className="h-full">
								<ResponsiveContainer width="100%" height="100%">
									{viewMode === "cumulative" ? (
										<LineChart
											data={prepareChartData(
												cashFlowData?.weeklyData,
												viewMode,
											).map((item) => ({
												...item,
												name: formatWeekForDisplay(item.date),
											}))}
										>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="name" tick={{ fontSize: 12 }} />
											<YAxis tickFormatter={(value) => `${value / 1000}k €`} />
											<Tooltip content={<CustomTooltip />} />
											<Legend />
											<ReferenceLine y={0} stroke="#000" />
											<Line
												type="monotone"
												dataKey="Erwarteter Zahlungseingang (kumulativ)"
												stroke="#3b82f6"
												strokeWidth={2}
												dot={false}
											/>
											<Line
												type="monotone"
												dataKey="Optimistisch (kumulativ)"
												stroke="#10b981"
												strokeWidth={1}
												strokeDasharray="5 5"
												dot={false}
											/>
											<Line
												type="monotone"
												dataKey="Pessimistisch (kumulativ)"
												stroke="#f59e0b"
												strokeWidth={1}
												strokeDasharray="5 5"
												dot={false}
											/>
										</LineChart>
									) : (
										<BarChart
											data={prepareChartData(
												cashFlowData?.weeklyData,
												viewMode,
											).map((item) => ({
												...item,
												name: formatWeekForDisplay(item.date),
											}))}
										>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="name" tick={{ fontSize: 12 }} />
											<YAxis tickFormatter={(value) => `${value / 1000}k €`} />
											<Tooltip content={<CustomTooltip />} />
											<Legend />
											<Bar
												dataKey="Erwarteter Zahlungseingang"
												fill="#3b82f6"
											/>
											<Bar dataKey="Optimistisch" fill="#10b981" />
											<Bar dataKey="Pessimistisch" fill="#f59e0b" />
										</BarChart>
									)}
								</ResponsiveContainer>
							</TabsContent>
							<TabsContent value="monthly" className="h-full">
								<ResponsiveContainer width="100%" height="100%">
									{viewMode === "cumulative" ? (
										<LineChart
											data={prepareChartData(
												cashFlowData?.monthlyData,
												viewMode,
											).map((item) => ({
												...item,
												name: formatMonthForDisplay(item.date),
											}))}
										>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="name" tick={{ fontSize: 12 }} />
											<YAxis tickFormatter={(value) => `${value / 1000}k €`} />
											<Tooltip content={<CustomTooltip />} />
											<Legend />
											<ReferenceLine y={0} stroke="#000" />
											<Line
												type="monotone"
												dataKey="Erwarteter Zahlungseingang (kumulativ)"
												stroke="#3b82f6"
												strokeWidth={2}
												dot={false}
											/>
											<Line
												type="monotone"
												dataKey="Optimistisch (kumulativ)"
												stroke="#10b981"
												strokeWidth={1}
												strokeDasharray="5 5"
												dot={false}
											/>
											<Line
												type="monotone"
												dataKey="Pessimistisch (kumulativ)"
												stroke="#f59e0b"
												strokeWidth={1}
												strokeDasharray="5 5"
												dot={false}
											/>
										</LineChart>
									) : (
										<BarChart
											data={prepareChartData(
												cashFlowData?.monthlyData,
												viewMode,
											).map((item) => ({
												...item,
												name: formatMonthForDisplay(item.date),
											}))}
										>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="name" tick={{ fontSize: 12 }} />
											<YAxis tickFormatter={(value) => `${value / 1000}k €`} />
											<Tooltip content={<CustomTooltip />} />
											<Legend />
											<Bar
												dataKey="Erwarteter Zahlungseingang"
												fill="#3b82f6"
											/>
											<Bar dataKey="Optimistisch" fill="#10b981" />
											<Bar dataKey="Pessimistisch" fill="#f59e0b" />
										</BarChart>
									)}
								</ResponsiveContainer>
							</TabsContent>
						</Tabs>
					)}
				</CardContent>
			</Card>

			{/* Upcoming Payments */}
			<Card>
				<CardHeader>
					<CardTitle>Bevorstehende Zahlungseingänge</CardTitle>
					<CardDescription>
						Erwartete Zahlungen in den nächsten 30 Tagen
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-2">
							{Array.from({ length: 5 }).map((_, i) => (
								<Skeleton key={i} className="h-12 w-full" />
							))}
						</div>
					) : (
						<div className="space-y-4">
							{cashFlowData?.dailyData
								.slice(0, 30)
								.filter((day: any) => day.expected > 0)
								.sort((a: any, b: any) => a.date.getTime() - b.date.getTime())
								.map((day: any, index: number) => (
									<div
										key={index}
										className="flex items-center justify-between"
									>
										<div className="flex items-center gap-2">
											<div className="bg-blue-100 p-2 rounded-full">
												<Calendar className="h-4 w-4 text-blue-500" />
											</div>
											<div>
												<p className="font-medium">
													{formatDateForDisplay(day.date)}
												</p>
												<p className="text-xs text-muted-foreground">
													{day.expected > 0 &&
													cashFlowData?.summary.next30Days > 0
														? `${Math.round((day.expected / cashFlowData.summary.next30Days) * 100)}% der 30-Tage-Prognose`
														: "0% der 30-Tage-Prognose"}
												</p>
											</div>
										</div>
										<div className="text-right">
											<p className="font-medium">
												{formatCurrency(day.expected)}
											</p>
											<div className="flex items-center justify-end gap-1">
												<Badge
													variant="outline"
													className="bg-green-50 text-green-700 text-xs"
												>
													{formatCurrency(day.optimistic)}
												</Badge>
												<span className="text-xs text-muted-foreground">-</span>
												<Badge
													variant="outline"
													className="bg-amber-50 text-amber-700 text-xs"
												>
													{formatCurrency(day.pessimistic)}
												</Badge>
											</div>
										</div>
									</div>
								))}
							{cashFlowData?.dailyData
								.slice(0, 30)
								.filter((day: any) => day.expected > 0).length === 0 && (
								<div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
									<Info className="h-10 w-10 mb-2" />
									<p>
										Keine erwarteten Zahlungseingänge in den nächsten 30 Tagen
									</p>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Explanation Card */}
			<Card>
				<CardHeader>
					<CardTitle>Über die Cash Flow Prognose</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4 text-sm">
						<p>
							Die Cash Flow Prognose basiert auf offenen Rechnungen und deren
							Fälligkeitsdaten. Für jede Rechnung wird eine
							Zahlungswahrscheinlichkeit berechnet, die von verschiedenen
							Faktoren abhängt:
						</p>
						<ul className="list-disc pl-5 space-y-2">
							<li>
								<span className="font-medium">Zahlungsstatus:</span> Bezahlte
								Rechnungen werden nicht berücksichtigt, teilweise bezahlte
								Rechnungen haben eine höhere Wahrscheinlichkeit für die
								Restzahlung.
							</li>
							<li>
								<span className="font-medium">Fälligkeitsdatum:</span>{" "}
								Rechnungen, die noch nicht fällig sind, haben eine höhere
								Zahlungswahrscheinlichkeit als überfällige.
							</li>
							<li>
								<span className="font-medium">Überfälligkeitsdauer:</span> Je
								länger eine Rechnung überfällig ist, desto geringer ist die
								Wahrscheinlichkeit einer Zahlung.
							</li>
						</ul>
						<p>Die Prognose zeigt drei Szenarien:</p>
						<ul className="list-disc pl-5 space-y-2">
							<li>
								<span className="font-medium">Erwarteter Zahlungseingang:</span>{" "}
								Die wahrscheinlichste Prognose basierend auf durchschnittlichen
								Zahlungswahrscheinlichkeiten.
							</li>
							<li>
								<span className="font-medium">Optimistisches Szenario:</span>{" "}
								Annahme einer besseren Zahlungsmoral als durchschnittlich.
							</li>
							<li>
								<span className="font-medium">Pessimistisches Szenario:</span>{" "}
								Konservative Schätzung, die für die sichere Finanzplanung
								verwendet werden kann.
							</li>
						</ul>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
