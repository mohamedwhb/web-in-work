"use client";

import { DateRangePicker } from "@/components/date-range-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
	format,
	isWithinInterval,
	parseISO,
	subDays,
	subMonths,
	subYears,
} from "date-fns";
import { de } from "date-fns/locale";
import {
	BarChart3,
	Calendar,
	CheckCircle,
	Clock,
	PieChart,
	RefreshCw,
	TrendingDown,
	TrendingUp,
	X,
	XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart as RechartsPieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

// Initial mock data for demonstration
const initialOfferData = {
	// Summary data
	summary: {
		totalOffers: 42,
		totalValue: 24680.5,
		averageValue: 587.63,
		conversionRate: 64, // percentage
		openOffers: 15,
		acceptedOffers: 27,
		rejectedOffers: 8,
		openValue: 8750.25,
		acceptedValue: 15230.75,
		rejectedValue: 699.5,
	},

	// Status distribution for pie chart
	statusDistribution: [
		{ name: "Offen", value: 15, color: "#3b82f6" },
		{ name: "Angenommen", value: 27, color: "#22c55e" },
		{ name: "Abgelehnt", value: 8, color: "#ef4444" },
	],

	// Value by status for bar chart
	valueByStatus: [
		{ name: "Offen", value: 8750.25, color: "#3b82f6" },
		{ name: "Angenommen", value: 15230.75, color: "#22c55e" },
		{ name: "Abgelehnt", value: 699.5, color: "#ef4444" },
	],

	// Monthly trends
	monthlyTrends: [
		{
			month: "Jan",
			date: "2025-01-15",
			open: 3,
			accepted: 5,
			rejected: 1,
			total: 9,
			openValue: 1750.25,
			acceptedValue: 3230.75,
			rejectedValue: 199.5,
			totalValue: 5180.5,
		},
		{
			month: "Feb",
			date: "2025-02-15",
			open: 4,
			accepted: 6,
			rejected: 2,
			total: 12,
			openValue: 2000.0,
			acceptedValue: 3500.0,
			rejectedValue: 150.0,
			totalValue: 5650.0,
		},
		{
			month: "Mär",
			date: "2025-03-15",
			open: 2,
			accepted: 8,
			rejected: 1,
			total: 11,
			openValue: 1500.0,
			acceptedValue: 4000.0,
			rejectedValue: 100.0,
			totalValue: 5600.0,
		},
		{
			month: "Apr",
			date: "2025-04-15",
			open: 6,
			accepted: 8,
			rejected: 4,
			total: 18,
			openValue: 3500.0,
			acceptedValue: 4500.0,
			rejectedValue: 250.0,
			totalValue: 8250.0,
		},
	],

	// Top customers
	topCustomers: [
		{ name: "Max Mustermann GmbH", offers: 8, accepted: 6, value: 4850.75 },
		{ name: "Firma ABC", offers: 6, accepted: 4, value: 3250.5 },
		{ name: "XYZ GmbH", offers: 5, accepted: 3, value: 2100.25 },
	],

	// Last updated timestamp
	lastUpdated: new Date().toISOString(),
};

export default function AngeboteDashboardPage() {
	// State for data and loading
	const [offerData, setOfferData] = useState(initialOfferData);
	const [isLoading, setIsLoading] = useState(false);
	const [isAutoRefresh, setIsAutoRefresh] = useState(false);
	const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

	// State for date range filtering
	const [dateRangeType, setDateRangeType] = useState("all");
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
	const [filteredData, setFilteredData] = useState(offerData);

	// Format currency
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("de-DE", {
			style: "currency",
			currency: "EUR",
		}).format(value);
	};

	// Calculate percentage change (mock data)
	const getPercentageChange = (value: number) => {
		// For demonstration, we'll just return random values
		return Math.floor(Math.random() * 20) - 10;
	};

	// Simulate fetching updated data
	const fetchData = useCallback(async () => {
		setIsLoading(true);

		// Simulate API call delay
		await new Promise((resolve) => setTimeout(resolve, 1500));

		// Generate some random variations to the data to simulate real-time changes
		const randomChange = () => Math.random() * 0.2 + 0.9; // 0.9 to 1.1 multiplier

		const newOpenOffers = Math.max(
			1,
			Math.round(offerData.summary.openOffers * randomChange()),
		);
		const newAcceptedOffers = Math.max(
			1,
			Math.round(offerData.summary.acceptedOffers * randomChange()),
		);
		const newRejectedOffers = Math.max(
			1,
			Math.round(offerData.summary.rejectedOffers * randomChange()),
		);
		const totalOffers = newOpenOffers + newAcceptedOffers + newRejectedOffers;

		const newOpenValue =
			Math.round(offerData.summary.openValue * randomChange() * 100) / 100;
		const newAcceptedValue =
			Math.round(offerData.summary.acceptedValue * randomChange() * 100) / 100;
		const newRejectedValue =
			Math.round(offerData.summary.rejectedValue * randomChange() * 100) / 100;
		const totalValue = newOpenValue + newAcceptedValue + newRejectedValue;

		const newData = {
			...offerData,
			summary: {
				totalOffers,
				totalValue,
				averageValue: Math.round((totalValue / totalOffers) * 100) / 100,
				conversionRate: Math.round((newAcceptedOffers / totalOffers) * 100),
				openOffers: newOpenOffers,
				acceptedOffers: newAcceptedOffers,
				rejectedOffers: newRejectedOffers,
				openValue: newOpenValue,
				acceptedValue: newAcceptedValue,
				rejectedValue: newRejectedValue,
			},
			statusDistribution: [
				{ name: "Offen", value: newOpenOffers, color: "#3b82f6" },
				{ name: "Angenommen", value: newAcceptedOffers, color: "#22c55e" },
				{ name: "Abgelehnt", value: newRejectedOffers, color: "#ef4444" },
			],
			valueByStatus: [
				{ name: "Offen", value: newOpenValue, color: "#3b82f6" },
				{ name: "Angenommen", value: newAcceptedValue, color: "#22c55e" },
				{ name: "Abgelehnt", value: newRejectedValue, color: "#ef4444" },
			],
			lastUpdated: new Date().toISOString(),
		};

		setOfferData(newData);
		setIsLoading(false);
	}, [offerData]);

	// Handle auto-refresh toggle
	useEffect(() => {
		if (isAutoRefresh && !refreshInterval) {
			const interval = window.setInterval(() => {
				fetchData();
			}, 30000); // Refresh every 30 seconds
			setRefreshInterval(interval);
		} else if (!isAutoRefresh && refreshInterval) {
			clearInterval(refreshInterval);
			setRefreshInterval(null);
		}

		return () => {
			if (refreshInterval) clearInterval(refreshInterval);
		};
	}, [isAutoRefresh, refreshInterval, fetchData]);

	// Handle predefined date range selection
	useEffect(() => {
		const today = new Date();
		let from: Date | undefined;
		let to: Date | undefined = today;

		switch (dateRangeType) {
			case "week":
				from = subDays(today, 7);
				break;
			case "month":
				from = subMonths(today, 1);
				break;
			case "quarter":
				from = subMonths(today, 3);
				break;
			case "year":
				from = subYears(today, 1);
				break;
			case "custom":
				// Don't change the custom date range
				return;
			case "all":
			default:
				from = undefined;
				to = undefined;
				break;
		}

		setDateRange({ from, to });
	}, [dateRangeType]);

	// Filter data based on date range
	useEffect(() => {
		if (!dateRange || !dateRange.from) {
			setFilteredData(offerData);
			return;
		}

		// Make sure we have a to date
		const to = dateRange.to || new Date();

		// Filter monthly trends
		const filteredTrends = offerData.monthlyTrends.filter((item) => {
			const itemDate = parseISO(item.date);
			return isWithinInterval(itemDate, { start: dateRange.from!, end: to });
		});

		// If no data in range, use original data
		if (filteredTrends.length === 0) {
			setFilteredData(offerData);
			return;
		}

		// Calculate new summary based on filtered data
		const openOffers = filteredTrends.reduce((sum, item) => sum + item.open, 0);
		const acceptedOffers = filteredTrends.reduce(
			(sum, item) => sum + item.accepted,
			0,
		);
		const rejectedOffers = filteredTrends.reduce(
			(sum, item) => sum + item.rejected,
			0,
		);
		const totalOffers = openOffers + acceptedOffers + rejectedOffers;

		const openValue = filteredTrends.reduce(
			(sum, item) => sum + item.openValue,
			0,
		);
		const acceptedValue = filteredTrends.reduce(
			(sum, item) => sum + item.acceptedValue,
			0,
		);
		const rejectedValue = filteredTrends.reduce(
			(sum, item) => sum + item.rejectedValue,
			0,
		);
		const totalValue = openValue + acceptedValue + rejectedValue;

		const filtered = {
			...offerData,
			summary: {
				totalOffers,
				totalValue,
				averageValue:
					totalOffers > 0
						? Math.round((totalValue / totalOffers) * 100) / 100
						: 0,
				conversionRate:
					totalOffers > 0
						? Math.round((acceptedOffers / totalOffers) * 100)
						: 0,
				openOffers,
				acceptedOffers,
				rejectedOffers,
				openValue,
				acceptedValue,
				rejectedValue,
			},
			statusDistribution: [
				{ name: "Offen", value: openOffers, color: "#3b82f6" },
				{ name: "Angenommen", value: acceptedOffers, color: "#22c55e" },
				{ name: "Abgelehnt", value: rejectedOffers, color: "#ef4444" },
			],
			valueByStatus: [
				{ name: "Offen", value: openValue, color: "#3b82f6" },
				{ name: "Angenommen", value: acceptedValue, color: "#22c55e" },
				{ name: "Abgelehnt", value: rejectedValue, color: "#ef4444" },
			],
			monthlyTrends: filteredTrends,
		};

		setFilteredData(filtered);
	}, [dateRange, offerData]);

	// Custom tooltip for charts
	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white p-3 border rounded-md shadow-sm">
					<p className="font-medium">{label}</p>
					<p className="text-sm">{`${payload[0].name}: ${formatCurrency(payload[0].value)}`}</p>
				</div>
			);
		}
		return null;
	};

	// Format the last updated time
	const formatLastUpdated = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return format(date, "dd.MM.yyyy HH:mm:ss", { locale: de });
		} catch (error) {
			return "Unbekannt";
		}
	};

	// Clear custom date range
	const clearDateRange = () => {
		setDateRangeType("all");
		setDateRange(undefined);
	};

	return (
		<div className="p-6 space-y-6">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<h1 className="text-2xl font-bold">Angebote Dashboard</h1>

				<div className="flex flex-col md:flex-row items-start md:items-center gap-4">
					{/* Date range controls */}
					<div className="flex flex-col md:flex-row items-start md:items-center gap-2">
						<Select value={dateRangeType} onValueChange={setDateRangeType}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Zeitraum wählen" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="week">Letzte Woche</SelectItem>
								<SelectItem value="month">Letzter Monat</SelectItem>
								<SelectItem value="quarter">Letztes Quartal</SelectItem>
								<SelectItem value="year">Letztes Jahr</SelectItem>
								<SelectItem value="custom">Benutzerdefiniert</SelectItem>
								<SelectItem value="all">Alle Zeit</SelectItem>
							</SelectContent>
						</Select>

						{dateRangeType === "custom" && (
							<div className="flex items-center gap-2">
								<DateRangePicker
									dateRange={dateRange}
									onDateRangeChange={setDateRange}
								/>
								<Button
									variant="ghost"
									size="icon"
									onClick={clearDateRange}
									title="Zeitraum zurücksetzen"
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						)}
					</div>

					{/* Refresh controls */}
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => fetchData()}
							disabled={isLoading}
							className="flex items-center gap-2"
						>
							<RefreshCw
								className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
							/>
							Aktualisieren
						</Button>

						<Button
							variant={isAutoRefresh ? "default" : "outline"}
							size="sm"
							onClick={() => setIsAutoRefresh(!isAutoRefresh)}
							className="flex items-center gap-2"
						>
							<Clock className="h-4 w-4" />
							{isAutoRefresh ? "Auto-Refresh An" : "Auto-Refresh Aus"}
						</Button>
					</div>
				</div>
			</div>

			{/* Last updated indicator */}
			<div className="flex items-center justify-end">
				<Badge variant="outline" className="text-xs">
					<Clock className="h-3 w-3 mr-1" />
					Zuletzt aktualisiert: {formatLastUpdated(filteredData.lastUpdated)}
				</Badge>
			</div>

			{/* Key metrics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-6">
						{isLoading ? (
							<div className="space-y-2">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-8 w-16" />
								<Skeleton className="h-4 w-24" />
							</div>
						) : (
							<div className="flex justify-between items-start">
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										Gesamtangebote
									</p>
									<h3 className="text-2xl font-bold mt-1">
										{filteredData.summary.totalOffers}
									</h3>
									<div className="flex items-center mt-1">
										<TrendingUp className="h-4 w-4 text-green-500 mr-1" />
										<span className="text-xs text-green-500">
											+12% zum Vormonat
										</span>
									</div>
								</div>
								<div className="bg-primary/10 p-2 rounded-full">
									<BarChart3 className="h-5 w-5 text-primary" />
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						{isLoading ? (
							<div className="space-y-2">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-8 w-24" />
								<Skeleton className="h-4 w-24" />
							</div>
						) : (
							<div className="flex justify-between items-start">
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										Gesamtwert
									</p>
									<h3 className="text-2xl font-bold mt-1">
										{formatCurrency(filteredData.summary.totalValue)}
									</h3>
									<div className="flex items-center mt-1">
										<TrendingUp className="h-4 w-4 text-green-500 mr-1" />
										<span className="text-xs text-green-500">
											+8% zum Vormonat
										</span>
									</div>
								</div>
								<div className="bg-primary/10 p-2 rounded-full">
									<PieChart className="h-5 w-5 text-primary" />
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						{isLoading ? (
							<div className="space-y-2">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-8 w-24" />
								<Skeleton className="h-4 w-24" />
							</div>
						) : (
							<div className="flex justify-between items-start">
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										Durchschnittswert
									</p>
									<h3 className="text-2xl font-bold mt-1">
										{formatCurrency(filteredData.summary.averageValue)}
									</h3>
									<div className="flex items-center mt-1">
										<TrendingDown className="h-4 w-4 text-red-500 mr-1" />
										<span className="text-xs text-red-500">
											-3% zum Vormonat
										</span>
									</div>
								</div>
								<div className="bg-primary/10 p-2 rounded-full">
									<BarChart3 className="h-5 w-5 text-primary" />
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						{isLoading ? (
							<div className="space-y-2">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-8 w-16" />
								<Skeleton className="h-4 w-24" />
							</div>
						) : (
							<div className="flex justify-between items-start">
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										Erfolgsquote
									</p>
									<h3 className="text-2xl font-bold mt-1">
										{filteredData.summary.conversionRate}%
									</h3>
									<div className="flex items-center mt-1">
										<TrendingUp className="h-4 w-4 text-green-500 mr-1" />
										<span className="text-xs text-green-500">
											+5% zum Vormonat
										</span>
									</div>
								</div>
								<div className="bg-primary/10 p-2 rounded-full">
									<CheckCircle className="h-5 w-5 text-primary" />
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Status breakdown */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card className="md:col-span-1">
					<CardHeader>
						<CardTitle>Angebote nach Status</CardTitle>
						<CardDescription>
							Verteilung der Angebote nach Status
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="h-[300px] flex items-center justify-center">
								<div className="text-center">
									<RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
									<p className="text-muted-foreground">
										Daten werden geladen...
									</p>
								</div>
							</div>
						) : (
							<div className="h-[300px]">
								<ResponsiveContainer width="100%" height="100%">
									<RechartsPieChart>
										<Pie
											data={filteredData.statusDistribution}
											cx="50%"
											cy="50%"
											labelLine={false}
											outerRadius={80}
											fill="#8884d8"
											dataKey="value"
											label={({ name, percent }) =>
												`${name}: ${(percent * 100).toFixed(0)}%`
											}
										>
											{filteredData.statusDistribution.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.color} />
											))}
										</Pie>
										<Tooltip />
										<Legend />
									</RechartsPieChart>
								</ResponsiveContainer>
							</div>
						)}

						<div className="grid grid-cols-3 gap-2 mt-4">
							<div className="flex flex-col items-center p-2 bg-blue-50 rounded-md">
								<Clock className="h-5 w-5 text-blue-500 mb-1" />
								<span className="text-xs text-muted-foreground">Offen</span>
								<span className="font-bold">
									{filteredData.summary.openOffers}
								</span>
							</div>
							<div className="flex flex-col items-center p-2 bg-green-50 rounded-md">
								<CheckCircle className="h-5 w-5 text-green-500 mb-1" />
								<span className="text-xs text-muted-foreground">
									Angenommen
								</span>
								<span className="font-bold">
									{filteredData.summary.acceptedOffers}
								</span>
							</div>
							<div className="flex flex-col items-center p-2 bg-red-50 rounded-md">
								<XCircle className="h-5 w-5 text-red-500 mb-1" />
								<span className="text-xs text-muted-foreground">Abgelehnt</span>
								<span className="font-bold">
									{filteredData.summary.rejectedOffers}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle>Angebotswert nach Status</CardTitle>
						<CardDescription>
							Gesamtwert der Angebote nach Status
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="h-[300px] flex items-center justify-center">
								<div className="text-center">
									<RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
									<p className="text-muted-foreground">
										Daten werden geladen...
									</p>
								</div>
							</div>
						) : (
							<div className="h-[300px]">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={filteredData.valueByStatus}
										margin={{
											top: 20,
											right: 30,
											left: 20,
											bottom: 5,
										}}
									>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="name" />
										<YAxis tickFormatter={(value) => `€${value}`} />
										<Tooltip content={<CustomTooltip />} />
										<Legend />
										<Bar dataKey="value" name="Wert">
											{filteredData.valueByStatus.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.color} />
											))}
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Trends over time */}
			<Card>
				<CardHeader>
					<CardTitle>Angebotstrends</CardTitle>
					<CardDescription>Entwicklung der Angebote über Zeit</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="count">
						<TabsList className="mb-4">
							<TabsTrigger value="count">Anzahl</TabsTrigger>
							<TabsTrigger value="value">Wert</TabsTrigger>
						</TabsList>
						<TabsContent value="count">
							{isLoading ? (
								<div className="h-[300px] flex items-center justify-center">
									<div className="text-center">
										<RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
										<p className="text-muted-foreground">
											Daten werden geladen...
										</p>
									</div>
								</div>
							) : filteredData.monthlyTrends.length === 0 ? (
								<div className="h-[300px] flex items-center justify-center">
									<p className="text-muted-foreground">
										Keine Daten im ausgewählten Zeitraum verfügbar
									</p>
								</div>
							) : (
								<div className="h-[300px]">
									<ResponsiveContainer width="100%" height="100%">
										<LineChart
											data={filteredData.monthlyTrends}
											margin={{
												top: 5,
												right: 30,
												left: 20,
												bottom: 5,
											}}
										>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="month" />
											<YAxis />
											<Tooltip />
											<Legend />
											<Line
												type="monotone"
												dataKey="open"
												name="Offen"
												stroke="#3b82f6"
												activeDot={{ r: 8 }}
											/>
											<Line
												type="monotone"
												dataKey="accepted"
												name="Angenommen"
												stroke="#22c55e"
											/>
											<Line
												type="monotone"
												dataKey="rejected"
												name="Abgelehnt"
												stroke="#ef4444"
											/>
											<Line
												type="monotone"
												dataKey="total"
												name="Gesamt"
												stroke="#6b7280"
												strokeDasharray="5 5"
											/>
										</LineChart>
									</ResponsiveContainer>
								</div>
							)}
						</TabsContent>
						<TabsContent value="value">
							{isLoading ? (
								<div className="h-[300px] flex items-center justify-center">
									<div className="text-center">
										<RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
										<p className="text-muted-foreground">
											Daten werden geladen...
										</p>
									</div>
								</div>
							) : filteredData.monthlyTrends.length === 0 ? (
								<div className="h-[300px] flex items-center justify-center">
									<p className="text-muted-foreground">
										Keine Daten im ausgewählten Zeitraum verfügbar
									</p>
								</div>
							) : (
								<div className="h-[300px]">
									<ResponsiveContainer width="100%" height="100%">
										<LineChart
											data={filteredData.monthlyTrends}
											margin={{
												top: 5,
												right: 30,
												left: 20,
												bottom: 5,
											}}
										>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="month" />
											<YAxis tickFormatter={(value) => `€${value}`} />
											<Tooltip />
											<Legend />
											<Line
												type="monotone"
												dataKey="openValue"
												name="Offen"
												stroke="#3b82f6"
												activeDot={{ r: 8 }}
											/>
											<Line
												type="monotone"
												dataKey="acceptedValue"
												name="Angenommen"
												stroke="#22c55e"
											/>
											<Line
												type="monotone"
												dataKey="rejectedValue"
												name="Abgelehnt"
												stroke="#ef4444"
											/>
											<Line
												type="monotone"
												dataKey="totalValue"
												name="Gesamt"
												stroke="#6b7280"
												strokeDasharray="5 5"
											/>
										</LineChart>
									</ResponsiveContainer>
								</div>
							)}
						</TabsContent>
					</Tabs>
				</CardContent>
				<CardFooter className="text-xs text-muted-foreground">
					{dateRange?.from && (
						<div className="flex items-center gap-1">
							<Calendar className="h-3 w-3" />
							<span>
								Zeitraum: {format(dateRange.from, "dd.MM.yyyy", { locale: de })}
								{dateRange.to &&
									` - ${format(dateRange.to, "dd.MM.yyyy", { locale: de })}`}
							</span>
						</div>
					)}
				</CardFooter>
			</Card>

			{/* Top customers */}
			<Card>
				<CardHeader>
					<CardTitle>Top Kunden</CardTitle>
					<CardDescription>Kunden mit den meisten Angeboten</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-4">
							<Skeleton className="h-8 w-full" />
							<Skeleton className="h-8 w-full" />
							<Skeleton className="h-8 w-full" />
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b">
										<th className="text-left py-3 px-4 font-medium">Kunde</th>
										<th className="text-center py-3 px-4 font-medium">
											Angebote
										</th>
										<th className="text-center py-3 px-4 font-medium">
											Angenommen
										</th>
										<th className="text-center py-3 px-4 font-medium">
											Erfolgsquote
										</th>
										<th className="text-right py-3 px-4 font-medium">
											Gesamtwert
										</th>
									</tr>
								</thead>
								<tbody>
									{offerData.topCustomers.map((customer, index) => (
										<tr key={index} className="border-b">
											<td className="py-3 px-4">{customer.name}</td>
											<td className="py-3 px-4 text-center">
												{customer.offers}
											</td>
											<td className="py-3 px-4 text-center">
												{customer.accepted}
											</td>
											<td className="py-3 px-4 text-center">
												{Math.round(
													(customer.accepted / customer.offers) * 100,
												)}
												%
											</td>
											<td className="py-3 px-4 text-right">
												{formatCurrency(customer.value)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
