export type WidgetType =
  | "number"
  | "chart-bar"
  | "chart-line"
  | "chart-pie"
  | "list"
  | "table"
  | "status"
  | "comparison"

export type WidgetSize = "small" | "medium" | "large" | "full"

export type WidgetIcon =
  | "euro"
  | "receipt"
  | "alert-triangle"
  | "trending-up"
  | "package"
  | "users"
  | "bar-chart"
  | "line-chart"
  | "pie-chart"
  | "list"

export interface WidgetConfig {
  id: string
  title: string
  type: WidgetType
  size: WidgetSize
  dataSource: string
  icon?: WidgetIcon
  refreshInterval?: number // in minutes, 0 means no auto refresh
  position?: number
  showActions?: boolean
  isVisible?: boolean
  colorScheme?: string
  dateRange?: "today" | "week" | "month" | "quarter" | "year" | "custom"
  customDateRange?: {
    start: string
    end: string
  }
}

export interface WidgetData {
  loading: boolean
  error?: string
  lastUpdated?: Date
  data: any
}

export const DATA_SOURCES = [
  { id: "monthly-revenue", label: "Monatlicher Umsatz" },
  { id: "open-invoices", label: "Offene Rechnungen" },
  { id: "overdue-invoices", label: "Überfällige Rechnungen" },
  { id: "conversion-rate", label: "Erfolgsquote" },
  { id: "offers-by-status", label: "Angebote nach Status" },
  { id: "sales-trend", label: "Umsatzentwicklung" },
  { id: "top-customers", label: "Top Kunden" },
  { id: "inventory-status", label: "Lagerbestand" },
  { id: "cashflow-forecast", label: "Cashflow Prognose" },
  { id: "monthly-comparison", label: "Monatsvergleich" },
  { id: "product-performance", label: "Produktleistung" },
  { id: "employee-performance", label: "Mitarbeiterleistung" },
  { id: "regional-sales", label: "Regionale Verkäufe" },
  { id: "payment-methods", label: "Zahlungsmethoden" },
  { id: "customer-acquisition", label: "Kundengewinnung" },
]

export const COLOR_SCHEMES = [
  { id: "default", label: "Standard" },
  { id: "blue", label: "Blau" },
  { id: "green", label: "Grün" },
  { id: "purple", label: "Lila" },
  { id: "amber", label: "Bernstein" },
  { id: "red", label: "Rot" },
  { id: "gray", label: "Grau" },
]

export const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: "widget-1",
    title: "Monatlicher Umsatz",
    type: "number",
    size: "small",
    dataSource: "monthly-revenue",
    icon: "euro",
    refreshInterval: 60,
    position: 0,
    showActions: true,
    isVisible: true,
  },
  {
    id: "widget-2",
    title: "Offene Rechnungen",
    type: "number",
    size: "small",
    dataSource: "open-invoices",
    icon: "receipt",
    refreshInterval: 60,
    position: 1,
    showActions: true,
    isVisible: true,
  },
  {
    id: "widget-3",
    title: "Überfällige Rechnungen",
    type: "number",
    size: "small",
    dataSource: "overdue-invoices",
    icon: "alert-triangle",
    refreshInterval: 60,
    position: 2,
    showActions: true,
    isVisible: true,
  },
  {
    id: "widget-4",
    title: "Erfolgsquote",
    type: "number",
    size: "small",
    dataSource: "conversion-rate",
    icon: "trending-up",
    refreshInterval: 60,
    position: 3,
    showActions: true,
    isVisible: true,
  },
  {
    id: "widget-5",
    title: "Angebote nach Status",
    type: "chart-pie",
    size: "medium",
    dataSource: "offers-by-status",
    icon: "pie-chart",
    refreshInterval: 60,
    position: 4,
    showActions: true,
    isVisible: true,
  },
  {
    id: "widget-6",
    title: "Umsatzentwicklung",
    type: "chart-line",
    size: "medium",
    dataSource: "sales-trend",
    icon: "line-chart",
    refreshInterval: 60,
    position: 5,
    showActions: true,
    isVisible: true,
  },
  {
    id: "widget-7",
    title: "Top Kunden",
    type: "list",
    size: "small",
    dataSource: "top-customers",
    icon: "users",
    refreshInterval: 60,
    position: 6,
    showActions: true,
    isVisible: true,
  },
  {
    id: "widget-8",
    title: "Lagerbestand",
    type: "status",
    size: "small",
    dataSource: "inventory-status",
    icon: "package",
    refreshInterval: 60,
    position: 7,
    showActions: true,
    isVisible: true,
  },
]
