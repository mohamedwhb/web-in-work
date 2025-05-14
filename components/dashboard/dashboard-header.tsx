"use client";

import { DateRangePicker } from "@/components/date-range-picker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import {
  exportDashboardConfig,
  importDashboardConfig,
  resetWidgetConfigurations,
} from "@/lib/widget-service";
import {
  BarChart,
  Download,
  Eye,
  EyeOff,
  LayoutGrid,
  LineChart,
  List,
  Monitor,
  Moon,
  PieChart,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Settings,
  Sliders,
  Sun,
  Table,
  Upload,
} from "lucide-react";
import { useState } from "react";

interface DashboardHeaderProps {
  onAddWidget: () => void;
  onRefreshAll: () => void;
  onToggleCompactView: () => void;
  compactView: boolean;
  onDateRangeChange: (range: { from: Date; to: Date } | undefined) => void;
  dateRange: { from: Date; to: Date } | undefined;
  onAutoRefreshChange: (enabled: boolean) => void;
  autoRefresh: boolean;
  onOpenSettings: () => void;
  onThemeChange?: (theme: "light" | "dark" | "system") => void;
  onLayoutChange?: (layout: "grid" | "list") => void;
  onRefreshIntervalChange?: (minutes: number) => void;
  onDefaultChartTypeChange?: (type: "bar" | "line" | "pie" | "table") => void;
  theme?: "light" | "dark" | "system";
  layout?: "grid" | "list";
  refreshInterval?: number;
  defaultChartType?: "bar" | "line" | "pie" | "table";
}

export function DashboardHeader({
  onAddWidget,
  onRefreshAll,
  onToggleCompactView,
  compactView,
  onDateRangeChange,
  dateRange,
  onAutoRefreshChange,
  autoRefresh,
  onOpenSettings,
  onThemeChange,
  onLayoutChange,
  onRefreshIntervalChange,
  onDefaultChartTypeChange,
  theme = "system",
  layout = "grid",
  refreshInterval = 5,
  defaultChartType = "bar",
}: DashboardHeaderProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importConfig, setImportConfig] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleResetWidgets = async () => {
    setIsResetting(true);
    try {
      await resetWidgetConfigurations();
      toast({
        title: "Dashboard zurückgesetzt",
        description:
          "Alle Widgets wurden auf die Standardeinstellungen zurückgesetzt.",
      });
      window.location.reload();
    } catch (error) {
      toast({
        title: "Fehler",
        description:
          "Beim Zurücksetzen des Dashboards ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
      setShowResetConfirm(false);
    }
  };

  const handleExportDashboard = () => {
    try {
      const configString = exportDashboardConfig();

      // Create a download link
      const dataStr =
        "data:text/json;charset=utf-8," + encodeURIComponent(configString);
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute(
        "download",
        `dashboard-config-${new Date().toISOString().split("T")[0]}.json`
      );
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

      toast({
        title: "Export erfolgreich",
        description: "Die Dashboard-Konfiguration wurde exportiert.",
      });
    } catch (error) {
      toast({
        title: "Export fehlgeschlagen",
        description:
          "Die Dashboard-Konfiguration konnte nicht exportiert werden.",
        variant: "destructive",
      });
    }
  };

  const handleImportDashboard = async () => {
    if (!importConfig.trim()) {
      toast({
        title: "Keine Konfiguration",
        description: "Bitte fügen Sie eine gültige Konfiguration ein.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const success = await importDashboardConfig(importConfig);
      if (success) {
        toast({
          title: "Import erfolgreich",
          description:
            "Die Dashboard-Konfiguration wurde importiert. Die Seite wird neu geladen.",
        });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error("Import fehlgeschlagen");
      }
    } catch (error) {
      toast({
        title: "Import fehlgeschlagen",
        description:
          "Die Konfiguration konnte nicht importiert werden. Bitte überprüfen Sie das Format.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setShowImportDialog(false);
    }
  };

  const handlePrintDashboard = () => {
    window.print();
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Übersicht über wichtige Kennzahlen und Berichte
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full">
          <DateRangePicker
            dateRange={dateRange || undefined}
            onDateRangeChange={(range) =>
              onDateRangeChange(
                range && range.from && range.to
                  ? { from: range.from, to: range.to }
                  : undefined
              )
            }
          />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  onClick={onOpenSettings}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Sliders className="h-4 w-4" />
                  <span className="hidden md:inline">
                    Dashboard-Einstellungen
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Dashboard-Einstellungen anpassen</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden md:inline">Schnelleinstellungen</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="max-w-96 mx-auto px-2">
              <Tabs defaultValue="display">
                <TabsList className="flex flex-wrap h-auto justify-center md:justify-start w-fit">
                  <TabsTrigger value="display">Anzeige</TabsTrigger>
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                  <TabsTrigger value="refresh">Aktualisierung</TabsTrigger>
                  <TabsTrigger value="charts">Diagramme</TabsTrigger>
                </TabsList>

                <TabsContent value="display" className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">
                      Anzeigeoptionen
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Passen Sie die visuelle Darstellung des Dashboards an.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="compact-view">Kompakte Ansicht</Label>
                      <Switch
                        id="compact-view"
                        checked={compactView}
                        onCheckedChange={onToggleCompactView}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Farbschema</Label>
                      <RadioGroup
                        defaultValue={theme}
                        onValueChange={(value) =>
                          onThemeChange?.(value as "light" | "dark" | "system")
                        }
                        className="flex space-x-2"
                      >
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="light" id="theme-light" />
                          <Label
                            htmlFor="theme-light"
                            className="flex items-center"
                          >
                            <Sun className="h-4 w-4 mr-1" /> Hell
                          </Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="dark" id="theme-dark" />
                          <Label
                            htmlFor="theme-dark"
                            className="flex items-center"
                          >
                            <Moon className="h-4 w-4 mr-1" /> Dunkel
                          </Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="system" id="theme-system" />
                          <Label
                            htmlFor="theme-system"
                            className="flex items-center"
                          >
                            <Monitor className="h-4 w-4 mr-1" /> System
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="layout" className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">
                      Layout-Optionen
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Wählen Sie, wie Widgets angeordnet werden sollen.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Layout-Typ</Label>
                      <RadioGroup
                        defaultValue={layout}
                        onValueChange={(value) =>
                          onLayoutChange?.(value as "grid" | "list")
                        }
                        className="flex space-x-2"
                      >
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="grid" id="layout-grid" />
                          <Label
                            htmlFor="layout-grid"
                            className="flex items-center"
                          >
                            <LayoutGrid className="h-4 w-4 mr-1" /> Raster
                          </Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="list" id="layout-list" />
                          <Label
                            htmlFor="layout-list"
                            className="flex items-center"
                          >
                            <List className="h-4 w-4 mr-1" /> Liste
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="widget-spacing">Widget-Abstand</Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          id="widget-spacing"
                          defaultValue={[10]}
                          max={20}
                          step={1}
                          className="flex-1"
                        />
                        <span className="w-12 text-center">10px</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="refresh" className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">
                      Aktualisierungsoptionen
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Steuern Sie, wie und wann Daten aktualisiert werden.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-refresh">
                        Automatische Aktualisierung
                      </Label>
                      <Switch
                        id="auto-refresh"
                        checked={autoRefresh}
                        onCheckedChange={onAutoRefreshChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="refresh-interval">
                        Aktualisierungsintervall
                      </Label>
                      <Select
                        defaultValue={refreshInterval.toString()}
                        onValueChange={(value) =>
                          onRefreshIntervalChange?.(Number.parseInt(value))
                        }
                        disabled={!autoRefresh}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Intervall wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Minute</SelectItem>
                          <SelectItem value="5">5 Minuten</SelectItem>
                          <SelectItem value="10">10 Minuten</SelectItem>
                          <SelectItem value="15">15 Minuten</SelectItem>
                          <SelectItem value="30">30 Minuten</SelectItem>
                          <SelectItem value="60">1 Stunde</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="refresh-notification">
                        Benachrichtigung bei Aktualisierung
                      </Label>
                      <Switch id="refresh-notification" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="charts" className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">
                      Diagramm-Einstellungen
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Legen Sie fest, wie Diagramme standardmäßig dargestellt
                      werden.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Standard-Diagrammtyp</Label>
                      <RadioGroup
                        defaultValue={defaultChartType}
                        onValueChange={(value) =>
                          onDefaultChartTypeChange?.(
                            value as "bar" | "line" | "pie" | "table"
                          )
                        }
                        className="grid grid-cols-2 gap-2"
                      >
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="bar" id="chart-bar" />
                          <Label
                            htmlFor="chart-bar"
                            className="flex items-center"
                          >
                            <BarChart className="h-4 w-4 mr-1" /> Balkendiagramm
                          </Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="line" id="chart-line" />
                          <Label
                            htmlFor="chart-line"
                            className="flex items-center"
                          >
                            <LineChart className="h-4 w-4 mr-1" />{" "}
                            Liniendiagramm
                          </Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="pie" id="chart-pie" />
                          <Label
                            htmlFor="chart-pie"
                            className="flex items-center"
                          >
                            <PieChart className="h-4 w-4 mr-1" /> Kreisdiagramm
                          </Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="table" id="chart-table" />
                          <Label
                            htmlFor="chart-table"
                            className="flex items-center"
                          >
                            <Table className="h-4 w-4 mr-1" /> Tabelle
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="chart-animations">
                        Diagramm-Animationen
                      </Label>
                      <Switch id="chart-animations" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="chart-legends">Legenden anzeigen</Label>
                      <Switch id="chart-legends" defaultChecked />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex max-md:flex-wrap max-md:gap-2 justify-between mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefreshAll}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Aktualisieren
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={onOpenSettings}
                  className="flex items-center gap-2"
                >
                  <Sliders className="h-4 w-4" />
                  Alle Einstellungen
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefreshAll}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden md:inline">Aktualisieren</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={onAddWidget}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">Widget hinzufügen</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Weitere Optionen</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onAddWidget}>
                <Plus className="mr-2 h-4 w-4" />
                Widget hinzufügen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRefreshAll}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Alle aktualisieren
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleCompactView}>
                {compactView ? (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Normale Ansicht
                  </>
                ) : (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Kompakte Ansicht
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportDashboard}>
                <Download className="mr-2 h-4 w-4" />
                Konfiguration exportieren
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowImportDialog(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Konfiguration importieren
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrintDashboard}>
                <Printer className="mr-2 h-4 w-4" />
                Drucken
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowResetConfirm(true)}
                className="text-red-600"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Auf Standard zurücksetzen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dashboard zurücksetzen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion setzt alle Widgets auf die Standardeinstellungen
              zurück. Alle benutzerdefinierten Widgets und Anpassungen gehen
              verloren. Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetWidgets}
              disabled={isResetting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isResetting ? "Wird zurückgesetzt..." : "Zurücksetzen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Dashboard-Konfiguration importieren
            </AlertDialogTitle>
            <AlertDialogDescription>
              Fügen Sie die exportierte Dashboard-Konfiguration ein. Alle
              aktuellen Einstellungen werden überschrieben.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Tabs defaultValue="paste">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="paste">Einfügen</TabsTrigger>
                <TabsTrigger value="upload">Datei hochladen</TabsTrigger>
              </TabsList>
              <TabsContent value="paste" className="mt-4">
                <textarea
                  className="w-full h-40 p-2 border rounded-md"
                  placeholder="JSON-Konfiguration hier einfügen..."
                  value={importConfig}
                  onChange={(e) => setImportConfig(e.target.value)}
                />
              </TabsContent>
              <TabsContent value="upload" className="mt-4">
                <Input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const content = e.target?.result as string;
                        setImportConfig(content);
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleImportDashboard}
              disabled={isImporting || !importConfig.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isImporting ? "Wird importiert..." : "Importieren"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
