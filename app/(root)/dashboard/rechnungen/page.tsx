"use client";

import { DateRangePicker } from "@/components/date-range-picker";
import {
	Card,
	CardContent,
	CardDescription,
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
import type { PaymentStatus } from "@/lib/invoice-types";
import { format, isWithinInterval, subDays, subMonths } from "date-fns";
import { de } from "date-fns/locale";
import {
	AlertTriangle,
	ArrowDownRight,
	ArrowUpRight,
	Ban,
	Calendar,
	CheckCircle,
	Clock,
	CreditCard,
	DollarSign,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
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
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

// Mock data for invoices
const mockInvoices = [
	{
		id: "RE-2025-001",
		date: new Date(2025, 0, 5),
		dueDate: new Date(2025, 0, 19),
		customer: { name: "Max Mustermann GmbH", id: "C001" },
		total: 1250.5,
		paymentStatus: "paid" as PaymentStatus,
		paymentDate: new Date(2025, 0, 15),
		paymentMethod: "bank_transfer",
	},
	{
		id: "RE-2025-002",
		date: new Date(2025, 0, 8),
		dueDate: new Date(2025, 0, 22),
		customer: { name: "Firma ABC", id: "C002" },
		total: 780.25,
		paymentStatus: "unpaid" as PaymentStatus,
	},
	{
		id: "RE-2025-003",
		date: new Date(2025, 0, 12),
		dueDate: new Date(2025, 0, 26),
		customer: { name: "XYZ GmbH", id: "C003" },
		total: 2340.0,
		paymentStatus: "partial" as PaymentStatus,
		paymentDate: new Date(2025, 0, 20),
		paidAmount: 1000.0,
		paymentMethod: "credit_card",
	},
	{
		id: "RE-2025-004",
		date: new Date(2025, 0, 15),
		dueDate: new Date(2025, 0, 29),
		customer: { name: "Muster & Co KG", id: "C004" },
		total: 450.75,
		paymentStatus: "overdue" as PaymentStatus,
	},
	{
		id: "RE-2025-005",
		date: new Date(2025, 0, 18),
		dueDate: new Date(2025, 1, 1),
		customer: { name: "Beispiel AG", id: "C005" },
		total: 1875.3,
		paymentStatus: "paid" as PaymentStatus,
		paymentDate: new Date(2025, 0, 25),
		paymentMethod: "bank_transfer",
	},
	{
		id: "RE-2025-006",
		date: new Date(2025, 0, 22),
		dueDate: new Date(2025, 1, 5),
		customer: { name: "Tech Solutions GmbH", id: "C006" },
		total: 3200.0,
		paymentStatus: "unpaid" as PaymentStatus,
	},
	{
		id: "RE-2025-007",
		date: new Date(2025, 0, 25),
		dueDate: new Date(2025, 1, 8),
		customer: { name: "Digital Services KG", id: "C007" },
		total: 950.45,
		paymentStatus: "paid" as PaymentStatus,
		paymentDate: new Date(2025, 1, 2),
		paymentMethod: "paypal",
	},
	{
		id: "RE-2025-008",
		date: new Date(2025, 0, 28),
		dueDate: new Date(2025, 1, 11),
		customer: { name: "Consulting Plus", id: "C008" },
		total: 4500.0,
		paymentStatus: "partial" as PaymentStatus,
		paymentDate: new Date(2025, 1, 5),
		paidAmount: 2000.0,
		paymentMethod: "bank_transfer",
	},
	{
		id: "RE-2025-009",
		date: new Date(2025, 1, 2),
		dueDate: new Date(2025, 1, 16),
		customer: { name: "Max Mustermann GmbH", id: "C001" },
		total: 1350.75,
		paymentStatus: "unpaid" as PaymentStatus,
	},
	{
		id: "RE-2025-010",
		date: new Date(2025, 1, 5),
		dueDate: new Date(2025, 1, 19),
		customer: { name: "XYZ GmbH", id: "C003" },
		total: 2100.0,
		paymentStatus: "paid" as PaymentStatus,
		paymentDate: new Date(2025, 1, 15),
		paymentMethod: "credit_card",
	},
	{
		id: "RE-2025-011",
		date: new Date(2025, 1, 8),
		dueDate: new Date(2025, 1, 22),
		customer: { name: "Firma ABC", id: "C002" },
		total: 890.5,
		paymentStatus: "overdue" as PaymentStatus,
	},
	{
		id: "RE-2025-012",
		date: new Date(2025, 1, 12),
		dueDate: new Date(2025, 1, 26),
		customer: { name: "Tech Solutions GmbH", id: "C006" },
		total: 3450.25,
		paymentStatus: "unpaid" as PaymentStatus,
	},
	{
		id: "RE-2025-013",
		date: new Date(2025, 1, 15),
		dueDate: new Date(2025, 1, 29),
		customer: { name: "Beispiel AG", id: "C005" },
		total: 1950.0,
		paymentStatus: "cancelled" as PaymentStatus,
	},
	{
		id: "RE-2025-014",
		date: new Date(2025, 1, 18),
		dueDate: new Date(2025, 2, 4),
		customer: { name: "Digital Services KG", id: "C007" },
		total: 1050.75,
		paymentStatus: "paid" as PaymentStatus,
		paymentDate: new Date(2025, 1, 25),
		paymentMethod: "bank_transfer",
	},
	{
		id: "RE-2025-015",
		date: new Date(2025, 1, 22),
		dueDate: new Date(2025, 2, 8),
		customer: { name: "Consulting Plus", id: "C008" },
		total: 4800.0,
		paymentStatus: "partial" as PaymentStatus,
		paymentDate: new Date(2025, 2, 1),
		paidAmount: 2400.0,
		paymentMethod: "bank_transfer",
	},
];

// Generate monthly data for the past 6 months
const generateMonthlyData = () => {
	const data = [];
	const today = new Date();

	for (let i = 5; i >= 0; i--) {
		const month = subMonths(today, i);
		const monthName = format(month, "MMM", { locale: de });

		data.push({
			name: monthName,
			total: Math.floor(Math.random() * 15000) + 5000,
			paid: Math.floor(Math.random() * 10000) + 3000,
		});
	}

	return data;
};

const monthlyData = generateMonthlyData();

// Status colors
const statusColors = {
	paid: "#10b981",
	unpaid: "#3b82f6",
	partial: "#f59e0b",
	overdue: "#ef4444",
	cancelled: "#6b7280",
};

export default function InvoiceDashboardPage() {
	const [isLoading, setIsLoading] = useState(true);
	const [dateRange, setDateRange] = useState<DateRange | undefined>({
		from: subDays(new Date(), 30),
		to: new Date(),
	});
	const [timeFrame, setTimeFrame] = useState("30days");
	const [filteredInvoices, setFilteredInvoices] = useState(mockInvoices);

	// Simulate loading
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 1500);

		return () => clearTimeout(timer);
	}, []);

	// Filter invoices based on date range
	useEffect(() => {
		if (dateRange?.from && dateRange?.to) {
			const filtered = mockInvoices.filter((invoice) =>
				isWithinInterval(invoice.date, {
					start: dateRange.from!,
					end: dateRange.to!,
				}),
			);
			setFilteredInvoices(filtered);
		} else {
			setFilteredInvoices(mockInvoices);
		}
	}, [dateRange]);

	// Handle time frame selection
	const handleTimeFrameChange = (value: string) => {
		setTimeFrame(value);
		const today = new Date();

		switch (value) {
			case "7days":
				setDateRange({
					from: subDays(today, 7),
					to: today,
				});
				break;
			case "30days":
				setDateRange({
					from: subDays(today, 30),
					to: today,
				});
				break;
			case "90days":
				setDateRange({
					from: subDays(today, 90),
					to: today,
				});
				break;
			case "thisYear":
				setDateRange({
					from: new Date(today.getFullYear(), 0, 1),
					to: today,
				});
				break;
			case "custom":
				// Keep current custom range
				break;
		}
	};

	// Calculate summary metrics
	const totalInvoiced = filteredInvoices.reduce(
		(sum, invoice) => sum + invoice.total,
		0,
	);
	const totalPaid =
		filteredInvoices
			.filter((invoice) => invoice.paymentStatus === "paid")
			.reduce((sum, invoice) => sum + invoice.total, 0) +
		filteredInvoices
			.filter((invoice) => invoice.paymentStatus === "partial")
			.reduce((sum, invoice) => sum + (invoice.paidAmount || 0), 0);
	const totalOutstanding = totalInvoiced - totalPaid;
	const totalOverdue = filteredInvoices
		.filter((invoice) => invoice.paymentStatus === "overdue")
		.reduce((sum, invoice) => sum + invoice.total, 0);

	// Calculate status distribution for pie chart
	const statusDistribution = [
		{
			name: "Bezahlt",
			value: filteredInvoices.filter((i) => i.paymentStatus === "paid").length,
			color: statusColors.paid,
		},
		{
			name: "Offen",
			value: filteredInvoices.filter((i) => i.paymentStatus === "unpaid")
				.length,
			color: statusColors.unpaid,
		},
		{
			name: "Teilweise",
			value: filteredInvoices.filter((i) => i.paymentStatus === "partial")
				.length,
			color: statusColors.partial,
		},
		{
			name: "Überfällig",
			value: filteredInvoices.filter((i) => i.paymentStatus === "overdue")
				.length,
			color: statusColors.overdue,
		},
		{
			name: "Storniert",
			value: filteredInvoices.filter((i) => i.paymentStatus === "cancelled")
				.length,
			color: statusColors.cancelled,
		},
	].filter((item) => item.value > 0);

	// Calculate amount distribution for pie chart
	const amountDistribution = [
		{ name: "Bezahlt", value: totalPaid, color: statusColors.paid },
		{
			name: "Ausstehend",
			value: totalOutstanding - totalOverdue,
			color: statusColors.unpaid,
		},
		{ name: "Überfällig", value: totalOverdue, color: statusColors.overdue },
	].filter((item) => item.value > 0);

	// Calculate top customers
	const customerTotals = filteredInvoices.reduce(
		(acc, invoice) => {
			const customerId = invoice.customer.id;
			if (!acc[customerId]) {
				acc[customerId] = {
					name: invoice.customer.name,
					total: 0,
					count: 0,
				};
			}
			acc[customerId].total += invoice.total;
			acc[customerId].count += 1;
			return acc;
		},
		{} as Record<string, { name: string; total: number; count: number }>,
	);

	const topCustomers = Object.values(customerTotals)
		.sort((a, b) => b.total - a.total)
		.slice(0, 5);

	// Format currency
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("de-DE", {
			style: "currency",
			currency: "EUR",
		}).format(value);
	};

	// Custom tooltip for charts
	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white p-2 border rounded shadow-sm">
					<p className="font-medium">{label}</p>
					{payload.map((entry: any, index: number) => (
						<p key={index} style={{ color: entry.color }}>
							{entry.name}: {formatCurrency(entry.value)}
						</p>
					))}
				</div>
			);
		}
		return null;
	};

	return (
		<div className="p-6 space-y-6">
			<header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h1 className="text-2xl font-bold">Rechnungen Dashboard</h1>
					<p className="text-muted-foreground">
						Übersicht und Analyse Ihrer Rechnungen
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-2">
					<Select value={timeFrame} onValueChange={handleTimeFrameChange}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Zeitraum" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="7days">Letzte 7 Tage</SelectItem>
							<SelectItem value="30days">Letzte 30 Tage</SelectItem>
							<SelectItem value="90days">Letzte 90 Tage</SelectItem>
							<SelectItem value="thisYear">Dieses Jahr</SelectItem>
							<SelectItem value="custom">Benutzerdefiniert</SelectItem>
						</SelectContent>
					</Select>

					{timeFrame === "custom" && (
						<DateRangePicker
							dateRange={dateRange}
							onDateRangeChange={setDateRange}
						/>
					)}
				</div>
			</header>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Total Invoiced */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">
							Gesamt fakturiert
						</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-8 w-[120px]" />
						) : (
							<>
								<div className="text-2xl font-bold">
									{formatCurrency(totalInvoiced)}
								</div>
								<p className="text-xs text-muted-foreground">
									{filteredInvoices.length} Rechnungen im Zeitraum
								</p>
							</>
						)}
					</CardContent>
				</Card>

				{/* Total Paid */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Bezahlt</CardTitle>
						<CheckCircle className="h-4 w-4 text-green-500" />
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-8 w-[120px]" />
						) : (
							<>
								<div className="text-2xl font-bold">
									{formatCurrency(totalPaid)}
								</div>
								<div className="flex items-center text-xs text-green-500">
									<ArrowUpRight className="h-3 w-3 mr-1" />
									{totalPaid > 0 && totalInvoiced > 0
										? `${Math.round((totalPaid / totalInvoiced) * 100)}% der Gesamtsumme`
										: "0% der Gesamtsumme"}
								</div>
							</>
						)}
					</CardContent>
				</Card>

				{/* Outstanding */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Ausstehend</CardTitle>
						<Clock className="h-4 w-4 text-blue-500" />
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-8 w-[120px]" />
						) : (
							<>
								<div className="text-2xl font-bold">
									{formatCurrency(totalOutstanding)}
								</div>
								<div className="flex items-center text-xs text-blue-500">
									<ArrowDownRight className="h-3 w-3 mr-1" />
									{totalOutstanding > 0 && totalInvoiced > 0
										? `${Math.round((totalOutstanding / totalInvoiced) * 100)}% der Gesamtsumme`
										: "0% der Gesamtsumme"}
								</div>
							</>
						)}
					</CardContent>
				</Card>

				{/* Overdue */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Überfällig</CardTitle>
						<AlertTriangle className="h-4 w-4 text-red-500" />
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-8 w-[120px]" />
						) : (
							<>
								<div className="text-2xl font-bold">
									{formatCurrency(totalOverdue)}
								</div>
								<div className="flex items-center text-xs text-red-500">
									<ArrowDownRight className="h-3 w-3 mr-1" />
									{totalOverdue > 0 && totalInvoiced > 0
										? `${Math.round((totalOverdue / totalInvoiced) * 100)}% der Gesamtsumme`
										: "0% der Gesamtsumme"}
								</div>
							</>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Status Distribution */}
				<Card className="col-span-1">
					<CardHeader>
						<CardTitle>Rechnungsstatus</CardTitle>
						<CardDescription>
							Verteilung nach Anzahl der Rechnungen
						</CardDescription>
					</CardHeader>
					<CardContent className="h-80">
						{isLoading ? (
							<div className="flex items-center justify-center h-full">
								<Skeleton className="h-64 w-64 rounded-full" />
							</div>
						) : statusDistribution.length === 0 ? (
							<div className="flex flex-col items-center justify-center h-full text-muted-foreground">
								<p>Keine Daten für den ausgewählten Zeitraum</p>
							</div>
						) : (
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={statusDistribution}
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
										{statusDistribution.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.color} />
										))}
									</Pie>
									<Tooltip content={<CustomTooltip />} />
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>

				{/* Amount Distribution */}
				<Card className="col-span-1">
					<CardHeader>
						<CardTitle>Zahlungsstatus</CardTitle>
						<CardDescription>Verteilung nach Rechnungsbeträgen</CardDescription>
					</CardHeader>
					<CardContent className="h-80">
						{isLoading ? (
							<div className="flex items-center justify-center h-full">
								<Skeleton className="h-64 w-64 rounded-full" />
							</div>
						) : amountDistribution.length === 0 ? (
							<div className="flex flex-col items-center justify-center h-full text-muted-foreground">
								<p>Keine Daten für den ausgewählten Zeitraum</p>
							</div>
						) : (
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={amountDistribution}
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
										{amountDistribution.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.color} />
										))}
									</Pie>
									<Tooltip content={<CustomTooltip />} />
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Monthly Trend */}
			<Card>
				<CardHeader>
					<CardTitle>Monatliche Entwicklung</CardTitle>
					<CardDescription>
						Fakturierte und bezahlte Beträge der letzten 6 Monate
					</CardDescription>
				</CardHeader>
				<CardContent className="h-80">
					{isLoading ? (
						<Skeleton className="h-full w-full" />
					) : (
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={monthlyData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" />
								<YAxis tickFormatter={(value) => `${value / 1000}k €`} />
								<Tooltip formatter={(value) => formatCurrency(Number(value))} />
								<Legend />
								<Bar dataKey="total" name="Fakturiert" fill="#3b82f6" />
								<Bar dataKey="paid" name="Bezahlt" fill="#10b981" />
							</BarChart>
						</ResponsiveContainer>
					)}
				</CardContent>
			</Card>

			{/* Top Customers and Payment Methods */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Top Customers */}
				<Card>
					<CardHeader>
						<CardTitle>Top Kunden</CardTitle>
						<CardDescription>
							Nach Rechnungssumme im ausgewählten Zeitraum
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="space-y-2">
								{Array.from({ length: 5 }).map((_, i) => (
									<Skeleton key={i} className="h-12 w-full" />
								))}
							</div>
						) : topCustomers.length === 0 ? (
							<div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
								<Users className="h-10 w-10 mb-2" />
								<p>Keine Kundendaten für den ausgewählten Zeitraum</p>
							</div>
						) : (
							<div className="space-y-4">
								{topCustomers.map((customer, index) => (
									<div
										key={index}
										className="flex items-center justify-between"
									>
										<div className="flex items-center gap-2">
											<div className="bg-primary/10 p-2 rounded-full">
												<Users className="h-4 w-4 text-primary" />
											</div>
											<div>
												<p className="font-medium">{customer.name}</p>
												<p className="text-xs text-muted-foreground">
													{customer.count} Rechnungen
												</p>
											</div>
										</div>
										<div className="text-right">
											<p className="font-medium">
												{formatCurrency(customer.total)}
											</p>
											<p className="text-xs text-muted-foreground">
												{Math.round((customer.total / totalInvoiced) * 100)}%
												vom Gesamtumsatz
											</p>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Recent Activity */}
				<Card>
					<CardHeader>
						<CardTitle>Letzte Aktivitäten</CardTitle>
						<CardDescription>
							Kürzlich erstellte und bezahlte Rechnungen
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="space-y-2">
								{Array.from({ length: 5 }).map((_, i) => (
									<Skeleton key={i} className="h-12 w-full" />
								))}
							</div>
						) : filteredInvoices.length === 0 ? (
							<div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
								<Calendar className="h-10 w-10 mb-2" />
								<p>Keine Aktivitäten im ausgewählten Zeitraum</p>
							</div>
						) : (
							<div className="space-y-4">
								{filteredInvoices
									.sort((a, b) => b.date.getTime() - a.date.getTime())
									.slice(0, 5)
									.map((invoice, index) => (
										<div
											key={index}
											className="flex items-center justify-between"
										>
											<div className="flex items-center gap-2">
												{invoice.paymentStatus === "paid" ? (
													<div className="bg-green-100 p-2 rounded-full">
														<CheckCircle className="h-4 w-4 text-green-500" />
													</div>
												) : invoice.paymentStatus === "partial" ? (
													<div className="bg-yellow-100 p-2 rounded-full">
														<CreditCard className="h-4 w-4 text-yellow-500" />
													</div>
												) : invoice.paymentStatus === "overdue" ? (
													<div className="bg-red-100 p-2 rounded-full">
														<AlertTriangle className="h-4 w-4 text-red-500" />
													</div>
												) : invoice.paymentStatus === "cancelled" ? (
													<div className="bg-gray-100 p-2 rounded-full">
														<Ban className="h-4 w-4 text-gray-500" />
													</div>
												) : (
													<div className="bg-blue-100 p-2 rounded-full">
														<Clock className="h-4 w-4 text-blue-500" />
													</div>
												)}
												<div>
													<p className="font-medium">{invoice.id}</p>
													<p className="text-xs text-muted-foreground">
														{invoice.customer.name}
													</p>
												</div>
											</div>
											<div className="text-right">
												<p className="font-medium">
													{formatCurrency(invoice.total)}
												</p>
												<p className="text-xs text-muted-foreground">
													{format(invoice.date, "dd.MM.yyyy", { locale: de })}
												</p>
											</div>
										</div>
									))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Payment Aging */}
			<Card>
				<CardHeader>
					<CardTitle>Zahlungsverzug</CardTitle>
					<CardDescription>
						Überfällige Rechnungen nach Altersgruppen
					</CardDescription>
				</CardHeader>
				<CardContent className="h-80">
					{isLoading ? (
						<Skeleton className="h-full w-full" />
					) : (
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={[
									{ name: "1-15 Tage", value: 2500 },
									{ name: "16-30 Tage", value: 1800 },
									{ name: "31-60 Tage", value: 1200 },
									{ name: "61-90 Tage", value: 800 },
									{ name: ">90 Tage", value: 500 },
								]}
								margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
							>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" />
								<YAxis tickFormatter={(value) => `${value / 1000}k €`} />
								<Tooltip formatter={(value) => formatCurrency(Number(value))} />
								<Bar dataKey="value" name="Überfällig" fill="#ef4444" />
							</BarChart>
						</ResponsiveContainer>
					)}
				</CardContent>
			</Card>

			{/* Payment Efficiency */}
			<Card>
				<CardHeader>
					<CardTitle>Zahlungseffizienz</CardTitle>
					<CardDescription>
						Durchschnittliche Zahlungsdauer in Tagen
					</CardDescription>
				</CardHeader>
				<CardContent className="h-80">
					{isLoading ? (
						<Skeleton className="h-full w-full" />
					) : (
						<ResponsiveContainer width="100%" height="100%">
							<LineChart
								data={monthlyData.map((month, index) => ({
									name: month.name,
									days:
										15 +
										Math.floor(Math.random() * 10) * (index % 2 === 0 ? 1 : -1),
								}))}
								margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
							>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip formatter={(value) => `${value} Tage`} />
								<Line
									type="monotone"
									dataKey="days"
									name="Zahlungsdauer"
									stroke="#3b82f6"
									activeDot={{ r: 8 }}
								/>
							</LineChart>
						</ResponsiveContainer>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
