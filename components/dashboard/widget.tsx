"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import { useTouchSwipe } from "@/hooks/use-touch-swipe";
import { cn } from "@/lib/utils";
import { getWidgetData } from "@/lib/widget-service";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Download,
  Euro,
  GripVertical,
  LineChart,
  List,
  Maximize2,
  MoreHorizontal,
  Package,
  PieChart,
  Printer,
  Receipt,
  RefreshCw,
  TrendingUp,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import type { WidgetConfig, WidgetData } from "./widget-types";

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
};

// Format percentage
const formatPercentage = (value: number) => {
  return `${value}%`;
};

// Format date
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Format relative time
const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) {
    return `Vor ${diffDay} ${diffDay === 1 ? "Tag" : "Tagen"}`;
  } else if (diffHour > 0) {
    return `Vor ${diffHour} ${diffHour === 1 ? "Stunde" : "Stunden"}`;
  } else if (diffMin > 0) {
    return `Vor ${diffMin} ${diffMin === 1 ? "Minute" : "Minuten"}`;
  } else {
    return "Gerade eben";
  }
};

interface WidgetProps {
  config: WidgetConfig;
  onEdit: (widget: WidgetConfig) => void;
  onDelete: (widgetId: string) => void;
  onRefresh: (widgetId: string) => void;
  className?: string;
  compactView?: boolean;
}

// Responsive Widget Container
function ResponsiveWidgetContainer({
  children,
  compactView,
  config,
  isMobile,
}: {
  children: React.ReactNode;
  compactView: boolean;
  config: WidgetConfig;
  isMobile: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const swipeHandlers = useTouchSwipe({
    onSwipeUp: () => setExpanded(true),
    onSwipeDown: () => setExpanded(false),
  });

  // Auf mobilen Geräten können wir eine kompaktere Ansicht mit Expand-Option anbieten
  if (isMobile && config.type !== "number" && !compactView) {
    return (
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            {config.type === "chart-bar" ||
            config.type === "chart-line" ||
            config.type === "chart-pie"
              ? "Diagramm"
              : config.type === "list" || config.type === "table"
              ? "Daten"
              : "Details"}
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-1 h-7">
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent {...swipeHandlers}>
          <div className="pt-2">{children}</div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return <div {...swipeHandlers}>{children}</div>;
}

// Zoom Controls für Diagramme
function ZoomControls({
  onZoomIn,
  onZoomOut,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  return (
    <div className="absolute top-0 right-0 flex gap-1 p-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={onZoomIn}
      >
        <ZoomIn className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={onZoomOut}
      >
        <ZoomOut className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function Widget({
  config,
  onEdit,
  onDelete,
  onRefresh,
  className,
  compactView = false,
}: WidgetProps) {
  const [widgetData, setWidgetData] = useState<WidgetData>({
    loading: true,
    data: null,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const { theme } = useTheme();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const { width: containerWidth } = useResizeObserver(containerRef);

  const widgetRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver({
    elementRef: widgetRef,
    threshold: 0.1,
  });
  const { width } = useResizeObserver(widgetRef);

  const isNarrow = width > 0 && width < 300;
  const isMedium = width >= 300 && width < 500;

  // Lazy loading der Daten, wenn das Widget sichtbar wird
  useEffect(() => {
    if (inView && widgetData.loading) {
      loadData();
    }
  }, [inView]);

  useEffect(() => {
    // Set up refresh interval if specified
    if (config.refreshInterval) {
      const interval = setInterval(() => {
        if (inView) {
          loadData();
        }
      }, config.refreshInterval * 60 * 1000); // Convert minutes to milliseconds

      return () => clearInterval(interval);
    }
  }, [
    config.id,
    config.refreshInterval,
    config.dateRange,
    config.customDateRange,
    inView,
  ]);

  const loadData = async () => {
    setWidgetData((prev) => ({ ...prev, loading: true }));
    setIsRefreshing(true);
    try {
      const data = await getWidgetData(
        config.dataSource,
        config.dateRange,
        config.customDateRange
      );
      setWidgetData(data);
    } catch (error) {
      setWidgetData({
        loading: false,
        error: "Fehler beim Laden der Daten",
        data: null,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadData();
    onRefresh(config.id);
  };

  const handlePrint = () => {
    // Create a printable version of the widget
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${config.title} - Ausdruck</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                padding: 20px; 
                max-width: 800px;
                margin: 0 auto;
              }
              h1 { font-size: 18px; margin-bottom: 10px; }
              .date { font-size: 12px; color: #666; margin-bottom: 20px; }
              .content { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
              table { width: 100%; border-collapse: collapse; }
              table, th, td { border: 1px solid #ddd; }
              th, td { padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              @media print {
                @page { margin: 0.5cm; }
                body { font-size: 12pt; }
                .content { border: none; }
              }
            </style>
          </head>
          <body>
            <h1>${config.title}</h1>
            <div class="date">Ausgedruckt am: ${new Date().toLocaleString(
              "de-DE"
            )}</div>
            <div class="content">
              ${formatWidgetDataForPrint(widgetData.data, config.type)}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Formatiert die Widget-Daten für den Druck
  const formatWidgetDataForPrint = (data: any, type: string) => {
    if (!data) return "<p>Keine Daten verfügbar</p>";

    switch (type) {
      case "number":
        return `
          <div>
            <h2>${data.value}${
          data.format === "currency"
            ? " €"
            : data.format === "percentage"
            ? "%"
            : ""
        }</h2>
            ${
              data.secondaryValue
                ? `<p>${data.secondaryValue} ${data.secondaryLabel || ""}</p>`
                : ""
            }
            ${
              data.change
                ? `<p>${data.changeType === "increase" ? "+" : "-"}${
                    data.change
                  }% zum Vormonat</p>`
                : ""
            }
          </div>
        `;
      case "list":
        if (!data.items || !data.items.length)
          return "<p>Keine Elemente verfügbar</p>";
        return `
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Wert</th>
                <th>Änderung</th>
              </tr>
            </thead>
            <tbody>
              ${data.items
                .map(
                  (item: any) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.value.toLocaleString("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  })}</td>
                  <td>${item.change >= 0 ? "+" : ""}${item.change}%</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        `;
      case "table":
        if (!data.rows || !data.columns)
          return "<p>Keine Tabellendaten verfügbar</p>";
        return `
          <table>
            <thead>
              <tr>
                ${data.columns
                  .map((col: any) => `<th>${col.label}</th>`)
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${data.rows
                .map(
                  (row: any) => `
                <tr>
                  ${data.columns
                    .map((col: any) => `<td>${row[col.key]}</td>`)
                    .join("")}
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        `;
      case "status":
        if (!data.statuses) return "<p>Keine Statusdaten verfügbar</p>";
        return `
          <div>
            <p>Gesamt: ${data.total}</p>
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Wert</th>
                </tr>
              </thead>
              <tbody>
                ${data.statuses
                  .map(
                    (status: any) => `
                  <tr>
                    <td>${status.label}</td>
                    <td>${status.value}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `;
      default:
        return `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    }
  };

  const handleExport = () => {
    // Export widget data as JSON
    const dataStr = JSON.stringify(widgetData.data, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `${config.title
      .replace(/\s+/g, "-")
      .toLowerCase()}-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Get the appropriate icon component
  const getIcon = () => {
    switch (config.icon) {
      case "euro":
        return <Euro className="h-4 w-4 text-muted-foreground" />;
      case "receipt":
        return <Receipt className="h-4 w-4 text-muted-foreground" />;
      case "alert-triangle":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "trending-up":
        return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
      case "package":
        return <Package className="h-4 w-4 text-muted-foreground" />;
      case "users":
        return <Users className="h-4 w-4 text-muted-foreground" />;
      case "bar-chart":
        return <BarChart3 className="h-4 w-4 text-muted-foreground" />;
      case "line-chart":
        return <LineChart className="h-4 w-4 text-muted-foreground" />;
      case "pie-chart":
        return <PieChart className="h-4 w-4 text-muted-foreground" />;
      case "list":
        return <List className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  // Get color scheme based on widget configuration
  const getColorScheme = useMemo(() => {
    const baseColors = {
      default: {
        primary: "#3b82f6",
        secondary: "#22c55e",
        accent: "#f59e0b",
        error: "#ef4444",
      },
      blue: {
        primary: "#2563eb",
        secondary: "#3b82f6",
        accent: "#60a5fa",
        error: "#ef4444",
      },
      green: {
        primary: "#16a34a",
        secondary: "#22c55e",
        accent: "#4ade80",
        error: "#ef4444",
      },
      purple: {
        primary: "#7c3aed",
        secondary: "#8b5cf6",
        accent: "#a78bfa",
        error: "#ef4444",
      },
      amber: {
        primary: "#d97706",
        secondary: "#f59e0b",
        accent: "#fbbf24",
        error: "#ef4444",
      },
      red: {
        primary: "#dc2626",
        secondary: "#ef4444",
        accent: "#f87171",
        error: "#ef4444",
      },
      gray: {
        primary: "#4b5563",
        secondary: "#6b7280",
        accent: "#9ca3af",
        error: "#ef4444",
      },
    };

    // Apply dark mode adjustments if needed
    if (theme === "dark") {
      Object.keys(baseColors).forEach((scheme) => {
        const colorScheme = baseColors[scheme as keyof typeof baseColors];
        // Lighten colors for dark mode
        // This is a simple adjustment, in a real app you might want more sophisticated color handling
      });
    }

    return (
      baseColors[config.colorScheme as keyof typeof baseColors] ||
      baseColors.default
    );
  }, [config.colorScheme, theme]);

  // Render widget content based on type
  const renderContent = () => {
    if (widgetData.loading) {
      return <WidgetSkeleton type={config.type} />;
    }

    if (widgetData.error) {
      return (
        <div className="p-4 text-center text-red-500">{widgetData.error}</div>
      );
    }

    const data = widgetData.data;

    // Bestimmen Sie, ob die kompakte Ansicht basierend auf dem Gerätetyp verwendet werden soll
    const useCompactView = compactView || isMobile;

    switch (config.type) {
      case "number":
        return (
          <NumberWidget
            data={data}
            colorScheme={getColorScheme}
            compactView={useCompactView}
          />
        );
      case "chart-bar":
        return (
          <BarChartWidget
            data={data}
            colorScheme={getColorScheme}
            compactView={useCompactView}
            zoomLevel={zoomLevel}
            containerWidth={containerWidth}
          />
        );
      case "chart-line":
        return (
          <LineChartWidget
            data={data}
            colorScheme={getColorScheme}
            compactView={useCompactView}
            zoomLevel={zoomLevel}
            containerWidth={containerWidth}
          />
        );
      case "chart-pie":
        return (
          <PieChartWidget
            data={data}
            colorScheme={getColorScheme}
            compactView={useCompactView}
            zoomLevel={zoomLevel}
            containerWidth={containerWidth}
          />
        );
      case "list":
        return (
          <ListWidget
            data={data}
            colorScheme={getColorScheme}
            compactView={useCompactView}
          />
        );
      case "table":
        return (
          <TableWidget
            data={data}
            colorScheme={getColorScheme}
            compactView={useCompactView}
          />
        );
      case "status":
        return (
          <StatusWidget
            data={data}
            colorScheme={getColorScheme}
            compactView={useCompactView}
          />
        );
      case "comparison":
        return (
          <ComparisonWidget
            data={data}
            colorScheme={getColorScheme}
            compactView={useCompactView}
          />
        );
      default:
        return <div className="p-4 text-center">Unbekannter Widget-Typ</div>;
    }
  };

  // Determine the grid span based on widget size and device
  const getGridSpan = () => {
    // Auf mobilen Geräten immer volle Breite
    if (isMobile) {
      return "col-span-1";
    }

    // Auf Tablets kleinere Widgets
    if (isTablet) {
      switch (config.size) {
        case "small":
          return "col-span-1";
        case "medium":
        case "large":
          return "col-span-1 md:col-span-2";
        case "full":
          return "col-span-1 md:col-span-2 lg:col-span-3";
        default:
          return "col-span-1";
      }
    }

    // Desktop-Ansicht
    switch (config.size) {
      case "small":
        return "col-span-1";
      case "medium":
        return "col-span-1 md:col-span-2";
      case "large":
        return "col-span-1 md:col-span-3";
      case "full":
        return "col-span-1 md:col-span-4";
      default:
        return "col-span-1";
    }
  };

  // Bestimmen Sie, ob die kompakte Ansicht basierend auf dem Gerätetyp verwendet werden soll
  const useCompactView = compactView || isMobile;

  // Zoom-Funktionen für Diagramme
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  return (
    <div
      ref={widgetRef}
      className={cn(
        "relative rounded-lg border bg-card text-card-foreground shadow transition-all",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
      data-widget-id={config.id}
      data-widget-type={config.type}
      data-widget-title={config.title}
      data-widget-data={JSON.stringify(widgetData.data || {})}
    >
      <CardHeader
        className={cn(
          "flex flex-row items-center justify-between overflow-hidden flex-wrap",
          useCompactView ? "p-2" : "pb-2"
        )}
      >
        <div className="flex items-center gap-1">
          <div className="hidden sm:flex">
            <GripVertical className="h-4 w-4 text-muted-foreground/30 mr-2 cursor-grab" />
          </div>
          <div className="flex  items-center justify-between md:space-x-4">
            <h3
              className={cn(
                "font-semibold leading-none tracking-tight",
                isNarrow ? "text-xs" : isMedium ? "text-base" : "text-lg"
              )}
            >
              {config.title}
            </h3>
            {/* Rest des Codes bleibt gleich */}
          </div>
          {widgetData.data?.dateRangeApplied && !isMobile && (
            <span className="text-xs text-muted-foreground ml-1 hidden sm:inline">
              ({widgetData.data.dateRangeApplied})
            </span>
          )}
        </div>
        <div className="flex items-center sm:gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8", useCompactView ? "h-6 w-6" : "")}
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw
                    className={cn(
                      "h-4 w-4",
                      useCompactView ? "h-3 w-3" : "",
                      isRefreshing ? "animate-spin" : ""
                    )}
                  />
                  <span className="sr-only">Aktualisieren</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Daten aktualisieren</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", useCompactView ? "h-6 w-6" : "")}
              >
                <MoreHorizontal
                  className={cn("h-4 w-4", useCompactView ? "h-3 w-3" : "")}
                />
                <span className="sr-only">Menü öffnen</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Aktualisieren
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(config)}>
                <Maximize2 className="mr-2 h-4 w-4" />
                Bearbeiten
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Drucken
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Exportieren
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(config.id)}
                className="text-red-600"
              >
                <X className="mr-2 h-4 w-4" />
                Entfernen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent
        className={cn("space-y-2", isNarrow ? "p-2" : isMedium ? "p-3" : "p-4")}
      >
        <ResponsiveWidgetContainer
          compactView={useCompactView}
          config={config}
          isMobile={isMobile}
        >
          {renderContent()}
        </ResponsiveWidgetContainer>
        {(config.type === "chart-bar" ||
          config.type === "chart-line" ||
          config.type === "chart-pie") &&
          !isMobile && (
            <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
          )}
      </CardContent>
      {widgetData.lastUpdated && (
        <CardFooter
          className={cn(
            "pt-0 text-xs text-muted-foreground flex justify-between items-center",
            useCompactView ? "p-2" : ""
          )}
        >
          <div className="flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            {isMobile ? (
              <span title={formatDate(widgetData.lastUpdated)}>
                {formatRelativeTime(widgetData.lastUpdated)}
              </span>
            ) : (
              formatDate(widgetData.lastUpdated)
            )}
          </div>
          {config.showActions && !isMobile && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 px-2 text-xs",
                useCompactView ? "h-5 px-1 text-[10px]" : ""
              )}
            >
              Details <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          )}
        </CardFooter>
      )}
    </div>
  );
}

// Skeleton loaders for different widget types
function WidgetSkeleton({ type }: { type: string }) {
  switch (type) {
    case "number":
      return (
        <div className="space-y-2">
          <Skeleton className="h-8 max-w-[120px]" />
          <Skeleton className="h-4 max-w-[80px]" />
        </div>
      );
    case "chart-bar":
    case "chart-line":
    case "chart-pie":
      return <Skeleton className="h-[120px] sm:h-[150px] w-full" />;
    case "list":
    case "table":
      return (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      );
    case "status":
      return (
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      );
    case "comparison":
      return (
        <div className="space-y-2">
          <Skeleton className="h-8 w-[120px]" />
          <Skeleton className="h-8 w-[120px]" />
          <Skeleton className="h-4 w-[80px]" />
        </div>
      );
    default:
      return <Skeleton className="h-[100px] w-full" />;
  }
}

// Number widget
function NumberWidget({
  data,
  colorScheme,
  compactView,
}: {
  data: any;
  colorScheme: any;
  compactView: boolean;
}) {
  if (!data) return null;

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case "currency":
        return formatCurrency(value);
      case "percentage":
        return formatPercentage(value);
      case "count":
        return value.toString();
      default:
        return value.toString();
    }
  };

  // Mini sparkline chart for trend data
  const renderSparkline = () => {
    if (!data.trend || !Array.isArray(data.trend) || data.trend.length < 2)
      return null;

    const values = data.trend;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const width = compactView ? 40 : 60;
    const height = compactView ? 15 : 20;
    const padding = 2;

    // Calculate points for the sparkline
    const points = values
      .map((value: number, index: number) => {
        const x =
          padding + (index * (width - 2 * padding)) / (values.length - 1);
        const normalizedValue = range === 0 ? 0.5 : (value - min) / range;
        const y = height - padding - normalizedValue * (height - 2 * padding);
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div className="ml-2">
        <svg width={width} height={height} className="overflow-visible">
          <polyline
            points={points}
            fill="none"
            stroke={
              data.changeType === "increase"
                ? colorScheme.secondary
                : colorScheme.error
            }
            strokeWidth="1.5"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="flex items-center">
      <div className={compactView ? "space-y-1" : ""}>
        <div className={cn("font-bold", compactView ? "text-lg" : "text-2xl")}>
          {formatValue(data.value, data.format || "count")}
        </div>
        {data.secondaryValue && (
          <div
            className={cn(
              "text-muted-foreground",
              compactView ? "text-xs mt-0" : "text-sm mt-1"
            )}
          >
            {formatValue(data.secondaryValue, data.secondaryFormat || "count")}{" "}
            {data.secondaryLabel}
          </div>
        )}
        {data.change && (
          <div
            className={cn(
              "flex items-center",
              compactView ? "text-[10px] mt-0" : "text-xs mt-1",
              data.changeType === "increase" ? "text-green-500" : "text-red-500"
            )}
          >
            {data.changeType === "increase" ? (
              <ArrowUpRight
                className={cn("mr-1", compactView ? "h-2 w-2" : "h-3 w-3")}
              />
            ) : (
              <ArrowDownRight
                className={cn("mr-1", compactView ? "h-2 w-2" : "h-3 w-3")}
              />
            )}
            <span>{data.change}% zum Vormonat</span>
          </div>
        )}
      </div>
      {!compactView && renderSparkline()}
    </div>
  );
}

// Bar chart widget
function BarChartWidget({
  data,
  colorScheme,
  compactView,
  zoomLevel = 1,
  containerWidth = 300,
}: {
  data: any;
  colorScheme: any;
  compactView: boolean;
  zoomLevel?: number;
  containerWidth?: number;
}) {
  if (!data || !data.labels || !data.values) return null;

  // Berechne die optimale Anzahl der anzuzeigenden Balken basierend auf der Containerbreite
  const maxBars = Math.max(
    3,
    Math.floor(containerWidth / (compactView ? 40 : 60))
  );
  const displayValues =
    data.values.length > maxBars && compactView
      ? data.values.slice(0, maxBars)
      : data.values;
  const displayLabels =
    data.labels.length > maxBars && compactView
      ? data.labels.slice(0, maxBars)
      : data.labels;

  // Simple bar chart representation
  return (
    <div
      className={cn(
        "flex items-end gap-2",
        compactView ? "h-[80px] sm:h-[100px]" : "h-[150px]"
      )}
      style={{
        transform: `scale(${zoomLevel})`,
        transformOrigin: "bottom left",
      }}
    >
      {displayValues.map((value: number, index: number) => {
        const maxValue = Math.max(...displayValues);
        const height = (value / maxValue) * 100;

        return (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="w-full rounded-t"
              style={{
                height: `${height}%`,
                backgroundColor: data.colors?.[index] || colorScheme.primary,
                minHeight: "4px",
              }}
            />
            <div
              className={cn(
                "mt-1 text-center truncate w-full",
                compactView ? "text-[10px]" : "text-xs"
              )}
            >
              {compactView && displayLabels[index].length > 3
                ? displayLabels[index].substring(0, 3) + "."
                : displayLabels[index]}
            </div>
          </div>
        );
      })}
      {data.values.length > maxBars && compactView && (
        <div className="flex flex-col items-center justify-end flex-1">
          <div className="text-[10px] text-muted-foreground">
            +{data.values.length - maxBars}
          </div>
        </div>
      )}
    </div>
  );
}

// Line chart widget
function LineChartWidget({
  data,
  colorScheme,
  compactView,
  zoomLevel = 1,
  containerWidth = 300,
}: {
  data: any;
  colorScheme: any;
  compactView: boolean;
  zoomLevel?: number;
  containerWidth?: number;
}) {
  if (!data || !data.labels || !data.datasets) return null;

  // Berechne die optimale Anzahl der anzuzeigenden Datenpunkte basierend auf der Containerbreite
  const maxPoints = Math.max(
    3,
    Math.floor(containerWidth / (compactView ? 40 : 60))
  );
  const displayLabels =
    data.labels.length > maxPoints && compactView
      ? data.labels.slice(0, maxPoints)
      : data.labels;

  // Simple line chart representation
  return (
    <div
      className={cn(
        "relative",
        compactView ? "h-[80px] sm:h-[100px]" : "h-[150px]"
      )}
      style={{
        transform: `scale(${zoomLevel})`,
        transformOrigin: "bottom left",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            "text-muted-foreground",
            compactView ? "text-xs" : "text-sm"
          )}
        >
          Liniendiagramm (Echte Implementierung würde Chart.js verwenden)
        </div>
      </div>
      <div className="absolute bottom-0 w-full flex justify-between px-2">
        {displayLabels.map((label: string, index: number) => (
          <div
            key={index}
            className={cn(
              "text-muted-foreground",
              compactView ? "text-[10px]" : "text-xs"
            )}
          >
            {compactView && label.length > 3
              ? label.substring(0, 3) + "."
              : label}
          </div>
        ))}
        {data.labels.length > maxPoints && compactView && (
          <div className="text-[10px] text-muted-foreground">...</div>
        )}
      </div>
    </div>
  );
}

// Pie chart widget
function PieChartWidget({
  data,
  colorScheme,
  compactView,
  zoomLevel = 1,
  containerWidth = 300,
}: {
  data: any;
  colorScheme: any;
  compactView: boolean;
  zoomLevel?: number;
  containerWidth?: number;
}) {
  if (!data || !data.labels || !data.values) return null;

  // Berechne die optimale Anzahl der anzuzeigenden Segmente basierend auf der Containerbreite
  const maxSegments = Math.max(
    3,
    Math.floor(containerWidth / (compactView ? 80 : 120))
  );
  const displayLabels =
    data.labels.length > maxSegments && compactView
      ? data.labels.slice(0, maxSegments)
      : data.labels;
  const displayValues =
    data.values.length > maxSegments && compactView
      ? data.values.slice(0, maxSegments)
      : data.values;

  // Simple pie chart representation
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        compactView ? "h-[80px] sm:h-[100px]" : "h-[150px]"
      )}
      style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center" }}
    >
      <div className="space-y-2">
        {displayLabels.map((label: string, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: data.colors?.[index] || colorScheme.primary,
              }}
            />
            <span className={compactView ? "text-xs" : "text-sm"}>
              {compactView && label.length > 10
                ? label.substring(0, 10) + "..."
                : label}
              :
            </span>
            <span
              className={cn("font-medium", compactView ? "text-xs" : "text-sm")}
            >
              {displayValues[index]}
            </span>
          </div>
        ))}
        {data.labels.length > maxSegments && compactView && (
          <div className="text-xs text-muted-foreground">
            +{data.labels.length - maxSegments} weitere
          </div>
        )}
      </div>
    </div>
  );
}

// List widget
function ListWidget({
  data,
  colorScheme,
  compactView,
}: {
  data: any;
  colorScheme: any;
  compactView: boolean;
}) {
  if (!data || !data.items) return null;

  return (
    <div className="space-y-2">
      {data.items.slice(0, compactView ? 3 : 5).map((item: any) => (
        <div key={item.id} className="flex justify-between items-center">
          <span
            className={cn(
              "truncate max-w-[120px] sm:max-w-[180px]",
              compactView ? "text-xs" : "text-sm"
            )}
          >
            {item.name}
          </span>
          <div className="flex items-center gap-2">
            <span
              className={cn("font-medium", compactView ? "text-xs" : "text-sm")}
            >
              {item.value.toLocaleString("de-DE", {
                style: "currency",
                currency: "EUR",
              })}
            </span>
            <span
              className={cn(
                item.change >= 0 ? "text-green-500" : "text-red-500",
                compactView ? "text-[10px]" : "text-xs"
              )}
            >
              {item.change >= 0 ? "+" : ""}
              {item.change}%
            </span>
          </div>
        </div>
      ))}
      {compactView && data.items.length > 3 && (
        <div className="text-xs text-muted-foreground text-center">
          +{data.items.length - 3} weitere
        </div>
      )}
    </div>
  );
}

// Table widget
function TableWidget({
  data,
  colorScheme,
  compactView,
}: {
  data: any;
  colorScheme: any;
  compactView: boolean;
}) {
  if (!data || !data.rows || !data.columns) return null;

  return (
    <div className={compactView ? "text-[10px]" : "text-xs"}>
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${data.columns.length}, 1fr)` }}
      >
        {data.columns.map((column: any, index: number) => (
          <div key={index} className="font-medium p-1 border-b">
            {compactView && column.label.length > 6
              ? column.label.substring(0, 6) + "..."
              : column.label}
          </div>
        ))}

        {data.rows
          .slice(0, compactView ? 3 : 5)
          .map((row: any, rowIndex: number) => (
            <React.Fragment key={rowIndex}>
              {data.columns.map((column: any, colIndex: number) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="p-1 border-b truncate"
                >
                  {typeof row[column.key] === "string" &&
                  compactView &&
                  row[column.key].length > 8
                    ? row[column.key].substring(0, 8) + "..."
                    : row[column.key]}
                </div>
              ))}
            </React.Fragment>
          ))}
      </div>
      {compactView && data.rows.length > 3 && (
        <div className="text-[10px] text-muted-foreground text-center mt-1">
          +{data.rows.length - 3} weitere
        </div>
      )}
    </div>
  );
}

// Status widget
function StatusWidget({
  data,
  colorScheme,
  compactView,
}: {
  data: any;
  colorScheme: any;
  compactView: boolean;
}) {
  if (!data || !data.statuses) return null;

  return (
    <div className="space-y-2">
      <div className={compactView ? "text-xs" : "text-sm"}>
        Gesamt: <span className="font-medium">{data.total}</span>
      </div>
      {data.statuses
        .slice(0, compactView ? 3 : undefined)
        .map((status: any, index: number) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "rounded-full",
                  compactView ? "w-1.5 h-1.5" : "w-2 h-2",
                  status.color === "green" && "bg-green-500",
                  status.color === "amber" && "bg-amber-500",
                  status.color === "red" && "bg-red-500",
                  !status.color && "bg-blue-500"
                )}
              />
              <span
                className={cn(
                  "truncate max-w-[120px] sm:max-w-[180px]",
                  compactView ? "text-xs" : "text-sm"
                )}
              >
                {status.label}
              </span>
            </div>
            <span
              className={cn("font-medium", compactView ? "text-xs" : "text-sm")}
            >
              {status.value}
            </span>
          </div>
        ))}
      {compactView && data.statuses.length > 3 && (
        <div className="text-xs text-muted-foreground text-center">
          +{data.statuses.length - 3} weitere
        </div>
      )}
    </div>
  );
}

// Comparison widget
function ComparisonWidget({
  data,
  colorScheme,
  compactView,
}: {
  data: any;
  colorScheme: any;
  compactView: boolean;
}) {
  if (!data || !data.current || !data.previous) return null;

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case "currency":
        return formatCurrency(value);
      case "percentage":
        return formatPercentage(value);
      default:
        return value.toString();
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <div
          className={cn(
            "text-muted-foreground",
            compactView ? "text-xs" : "text-sm"
          )}
        >
          {compactView && data.current.label.length > 15
            ? data.current.label.substring(0, 15) + "..."
            : data.current.label}
        </div>
        <div className={cn("font-bold", compactView ? "text-lg" : "text-xl")}>
          {formatValue(data.current.value, data.format || "count")}
        </div>
      </div>
      <div>
        <div
          className={cn(
            "text-muted-foreground",
            compactView ? "text-xs" : "text-sm"
          )}
        >
          {compactView && data.previous.label.length > 15
            ? data.previous.label.substring(0, 15) + "..."
            : data.previous.label}
        </div>
        <div className={cn(compactView ? "text-base" : "text-lg")}>
          {formatValue(data.previous.value, data.format || "count")}
        </div>
      </div>
      <div
        className={cn(
          "flex items-center",
          compactView ? "text-[10px]" : "text-xs",
          data.changeType === "increase" ? "text-green-500" : "text-red-500"
        )}
      >
        {data.changeType === "increase" ? (
          <ArrowUpRight
            className={cn("mr-1", compactView ? "h-2 w-2" : "h-3 w-3")}
          />
        ) : (
          <ArrowDownRight
            className={cn("mr-1", compactView ? "h-2 w-2" : "h-3 w-3")}
          />
        )}
        <span>{data.change}% Veränderung</span>
      </div>
    </div>
  );
}
