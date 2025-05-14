"use client";

import type React from "react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  AlertCircle,
  CalendarIcon,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Mail,
  PieChart,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useMemo, useState, useTransition } from "react";

// Typdefinitionen für bessere Typsicherheit
type ReportFormat = "pdf" | "excel" | "csv";
type ReportCategory = "finance" | "inventory" | "customers" | "employees";
type ScheduleFrequency =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  formats: ReportFormat[];
  isDefault: boolean;
  lastGenerated: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Schedule {
  id: string;
  name: string;
  reportId: string;
  frequency: ScheduleFrequency;
  day: number;
  time: string;
  format: ReportFormat;
  recipients: string[];
  active: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

// Beispieldaten für Berichtsvorlagen
const reportTemplates: ReportTemplate[] = [
  {
    id: "sales-report",
    name: "Umsatzbericht",
    description:
      "Detaillierte Übersicht über Umsätze nach Zeitraum, Produkt und Kunde",
    category: "finance",
    formats: ["pdf", "excel", "csv"],
    isDefault: true,
    lastGenerated: new Date(2023, 3, 15),
    createdAt: new Date(2023, 1, 10),
    updatedAt: new Date(2023, 3, 15),
  },
  {
    id: "inventory-report",
    name: "Lagerbestandsbericht",
    description: "Aktueller Lagerbestand mit Warnungen für niedrige Bestände",
    category: "inventory",
    formats: ["pdf", "excel"],
    isDefault: false,
    lastGenerated: new Date(2023, 4, 2),
    createdAt: new Date(2023, 2, 5),
    updatedAt: new Date(2023, 4, 2),
  },
  {
    id: "customer-report",
    name: "Kundenbericht",
    description: "Analyse der Kundenaktivitäten und Umsätze pro Kunde",
    category: "customers",
    formats: ["pdf", "excel"],
    isDefault: false,
    lastGenerated: new Date(2023, 3, 28),
    createdAt: new Date(2023, 1, 15),
    updatedAt: new Date(2023, 3, 28),
  },
  {
    id: "tax-report",
    name: "Steuerbericht",
    description: "Zusammenfassung der Steuerinformationen für die Buchhaltung",
    category: "finance",
    formats: ["pdf", "excel", "csv"],
    isDefault: false,
    lastGenerated: new Date(2023, 3, 30),
    createdAt: new Date(2023, 1, 20),
    updatedAt: new Date(2023, 3, 30),
  },
  {
    id: "employee-report",
    name: "Mitarbeiterbericht",
    description: "Übersicht über Mitarbeiteraktivitäten und Arbeitszeiten",
    category: "employees",
    formats: ["pdf"],
    isDefault: false,
    lastGenerated: new Date(2023, 4, 5),
    createdAt: new Date(2023, 2, 10),
    updatedAt: new Date(2023, 4, 5),
  },
];

// Beispieldaten für Zeitpläne
const schedules: Schedule[] = [
  {
    id: "weekly-sales",
    name: "Wöchentlicher Umsatzbericht",
    reportId: "sales-report",
    frequency: "weekly",
    day: 1, // Montag
    time: "08:00",
    format: "pdf",
    recipients: ["buchhaltung@example.com", "geschaeftsfuehrung@example.com"],
    active: true,
    lastRun: new Date(2023, 4, 1),
    nextRun: new Date(2023, 4, 8),
  },
  {
    id: "monthly-inventory",
    name: "Monatlicher Lagerbestandsbericht",
    reportId: "inventory-report",
    frequency: "monthly",
    day: 1,
    time: "07:00",
    format: "excel",
    recipients: ["lager@example.com", "einkauf@example.com"],
    active: true,
    lastRun: new Date(2023, 3, 1),
    nextRun: new Date(2023, 4, 1),
  },
  {
    id: "quarterly-tax",
    name: "Vierteljährlicher Steuerbericht",
    reportId: "tax-report",
    frequency: "quarterly",
    day: 5,
    time: "09:00",
    format: "pdf",
    recipients: ["steuerberater@example.com", "buchhaltung@example.com"],
    active: true,
    lastRun: new Date(2023, 2, 31),
    nextRun: new Date(2023, 5, 30),
  },
];

// Formatoptionen für Berichte
const formatOptions = [
  { id: "pdf", name: "PDF", icon: FileText },
  { id: "excel", name: "Excel", icon: FileSpreadsheet },
  { id: "csv", name: "CSV", icon: Download },
];

// Frequenzoptionen für Zeitpläne
const frequencyOptions = [
  { value: "daily", label: "Täglich" },
  { value: "weekly", label: "Wöchentlich" },
  { value: "monthly", label: "Monatlich" },
  { value: "quarterly", label: "Vierteljährlich" },
  { value: "yearly", label: "Jährlich" },
];

// Kategorie-Optionen für Berichte
const categoryOptions = [
  { value: "finance", label: "Finanzen" },
  { value: "inventory", label: "Lager" },
  { value: "customers", label: "Kunden" },
  { value: "employees", label: "Mitarbeiter" },
];

// Hilfsfunktion zum Formatieren von Daten
const formatDate = (date: Date) => {
  return format(date, "dd.MM.yyyy", { locale: de });
};

// Komponente für die Berichtseinstellungen
export default function ReportsSettingsPage() {
  // State-Management
  const [activeTab, setActiveTab] = useState("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewTemplateDialogOpen, setIsNewTemplateDialogOpen] = useState(false);
  const [isNewScheduleDialogOpen, setIsNewScheduleDialogOpen] = useState(false);
  const [isAddRecipientDialogOpen, setIsAddRecipientDialogOpen] =
    useState(false);
  const [newRecipient, setNewRecipient] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>("pdf");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  // Memoized gefilterte Vorlagen basierend auf der Suchanfrage
  const filteredTemplates = useMemo(() => {
    return reportTemplates.filter(
      (template) =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        categoryOptions
          .find((cat) => cat.value === template.category)
          ?.label.toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Aktuell ausgewählte Vorlage
  const currentTemplate = useMemo(() => {
    return reportTemplates.find((t) => t.id === selectedTemplate);
  }, [selectedTemplate]);

  // Aktuell ausgewählter Zeitplan
  const currentSchedule = useMemo(() => {
    return schedules.find((s) => s.id === selectedSchedule);
  }, [selectedSchedule]);

  // Funktion zum Speichern der Einstellungen
  const saveSettings = useCallback(() => {
    startTransition(() => {
      if (selectedTemplate) {
        // Hier würde normalerweise der API-Aufruf zum Speichern der Vorlage erfolgen
        const templateName = (
          document.getElementById("template-name") as HTMLInputElement
        )?.value;
        const templateCategory = (
          document.getElementById("template-category") as HTMLSelectElement
        )?.value as ReportCategory;
        const templateDescription = (
          document.getElementById("template-description") as HTMLInputElement
        )?.value;
        const isDefault = (
          document.getElementById("is-default") as HTMLInputElement
        )?.checked;

        // Sammle die ausgewählten Formate
        const selectedFormats = formatOptions
          .filter(
            (format) =>
              (
                document.getElementById(
                  `format-${format.id}`
                ) as HTMLInputElement
              )?.checked
          )
          .map((format) => format.id) as ReportFormat[];

        // Simuliere das Speichern der Daten
        console.log("Speichere Vorlage:", {
          id: selectedTemplate,
          name: templateName,
          category: templateCategory,
          description: templateDescription,
          isDefault,
          formats: selectedFormats,
        });
      }

      toast({
        title: "Einstellungen gespeichert",
        description:
          "Die Berichtseinstellungen wurden erfolgreich gespeichert.",
      });
    });
  }, [selectedTemplate]);

  // Funktion zum Löschen eines Elements
  const handleDelete = useCallback(
    (type: "template" | "schedule", id: string) => {
      startTransition(() => {
        // Hier würde normalerweise der API-Aufruf zum Löschen erfolgen
        toast({
          title: type === "template" ? "Vorlage gelöscht" : "Zeitplan gelöscht",
          description: `${
            type === "template" ? "Die Berichtsvorlage" : "Der Zeitplan"
          } wurde erfolgreich gelöscht.`,
        });

        if (type === "template") {
          setSelectedTemplate(null);
        } else {
          setSelectedSchedule(null);
        }
      });
    },
    []
  );

  // Funktion zum Erstellen eines Testberichts
  const generateTestReport = useCallback(
    (templateId: string, format: ReportFormat, isPreview = false) => {
      const template = reportTemplates.find((t) => t.id === templateId);
      const selectedDate = date || new Date();

      // Zeige einen Toast mit Ladeindikator
      const toastId = toast({
        title: isPreview ? "Vorschau wird geladen" : "Bericht wird generiert",
        description: `${
          template?.name
        } wird im ${format.toUpperCase()}-Format ${
          isPreview ? "vorbereitet" : "erstellt"
        }.`,
        action: <Loader2 className="h-4 w-4 animate-spin" />,
      });

      // Simuliere eine Verzögerung für die Berichtsgenerierung
      startTransition(() => {
        setTimeout(() => {
          if (isPreview) {
            // Für die Vorschau öffnen wir einen Dialog mit einer simulierten Vorschau
            setPreviewContent(`
            <div style="font-family: Arial, sans-serif;">
              <h1 style="color: #333;">${template?.name}</h1>
              <p>Generiert am: ${formatDate(new Date())}</p>
              <p>Zeitraum: ${formatDate(selectedDate)}</p>
              <hr />
              <h2>Zusammenfassung</h2>
              <p>Dies ist eine Vorschau des ${
                template?.name
              }. Der vollständige Bericht enthält detaillierte Daten und Grafiken.</p>
              <div style="background-color: #f5f5f5; padding: 10px; margin: 10px 0;">
                <h3>Beispieldaten</h3>
                <ul>
                  <li>Gesamtumsatz: 24.500,00 €</li>
                  <li>Anzahl Transaktionen: 128</li>
                  <li>Durchschnittlicher Bestellwert: 191,41 €</li>
                </ul>
              </div>
            </div>
          `);
            setIsPreviewOpen(true);
            toast({
              id: toastId,
              title: "Vorschau bereit",
              description: `Vorschau für ${template?.name} wurde erstellt.`,
            });
          } else {
            // Für den Testbericht simulieren wir einen Download
            toast({
              id: toastId,
              title: "Bericht fertiggestellt",
              description: `${
                template?.name
              } wurde im ${format.toUpperCase()}-Format erstellt und steht zum Download bereit.`,
              action: (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => console.log("Download simuliert")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              ),
            });
          }
        }, 1500);
      });
    },
    [date]
  );

  // Funktion zum Aktivieren/Deaktivieren eines Zeitplans
  const toggleScheduleActive = useCallback(
    (scheduleId: string, active: boolean, event?: React.MouseEvent) => {
      if (event) {
        event.stopPropagation();
      }

      startTransition(() => {
        // Hier würde normalerweise der API-Aufruf zum Aktualisieren des Zeitplans erfolgen
        toast({
          title: active ? "Zeitplan aktiviert" : "Zeitplan deaktiviert",
          description: `Der Zeitplan wurde ${
            active ? "aktiviert" : "deaktiviert"
          }.`,
        });
      });
    },
    []
  );

  // Funktion zum Hinzufügen eines neuen Empfängers
  const addRecipient = useCallback(() => {
    if (!newRecipient || !selectedSchedule) return;

    // E-Mail-Validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newRecipient)) {
      toast({
        title: "Ungültige E-Mail-Adresse",
        description: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        variant: "destructive",
      });
      return;
    }

    // Hier würde normalerweise der API-Aufruf zum Hinzufügen des Empfängers erfolgen
    toast({
      title: "Empfänger hinzugefügt",
      description: `${newRecipient} wurde zur Empfängerliste hinzugefügt.`,
    });

    setNewRecipient("");
    setIsAddRecipientDialogOpen(false);
  }, [newRecipient, selectedSchedule]);

  // Funktion zum Entfernen eines Empfängers
  const removeRecipient = useCallback(
    (email: string, event: React.MouseEvent) => {
      event.stopPropagation();

      // Hier würde normalerweise der API-Aufruf zum Entfernen des Empfängers erfolgen
      toast({
        title: "Empfänger entfernt",
        description: `${email} wurde aus der Empfängerliste entfernt.`,
      });
    },
    []
  );

  // Funktion zum Erstellen einer neuen Vorlage
  const createNewTemplate = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const name = formData.get("name") as string;
    const category = formData.get("category") as ReportCategory;
    const description = formData.get("description") as string;

    if (!name || !category) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie alle erforderlichen Felder aus.",
        variant: "destructive",
      });
      return;
    }

    // Hier würde normalerweise der API-Aufruf zum Erstellen der Vorlage erfolgen
    toast({
      title: "Vorlage erstellt",
      description: `Die Berichtsvorlage "${name}" wurde erfolgreich erstellt.`,
    });

    setIsNewTemplateDialogOpen(false);
  }, []);

  // Funktion zum Erstellen eines neuen Zeitplans
  const createNewSchedule = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const name = formData.get("name") as string;
    const reportId = formData.get("reportId") as string;
    const frequency = formData.get("frequency") as ScheduleFrequency;
    const time = formData.get("time") as string;

    if (!name || !reportId || !frequency || !time) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie alle erforderlichen Felder aus.",
        variant: "destructive",
      });
      return;
    }

    // Hier würde normalerweise der API-Aufruf zum Erstellen des Zeitplans erfolgen
    toast({
      title: "Zeitplan erstellt",
      description: `Der Zeitplan "${name}" wurde erfolgreich erstellt.`,
    });

    setIsNewScheduleDialogOpen(false);
  }, []);

  // Funktion zum Senden einer Test-E-Mail
  const sendTestEmail = useCallback(() => {
    if (!selectedSchedule) return;

    const toastId = toast({
      title: "E-Mail wird gesendet",
      description:
        "Die Test-E-Mail wird an die konfigurierten Empfänger gesendet.",
      action: <Loader2 className="h-4 w-4 animate-spin" />,
    });

    // Simuliere eine Verzögerung für den E-Mail-Versand
    setTimeout(() => {
      toast({
        id: toastId,
        title: "E-Mail gesendet",
        description: "Die Test-E-Mail wurde erfolgreich versendet.",
      });
    }, 1500);
  }, [selectedSchedule]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <PageHeader
          heading="Berichtseinstellungen"
          description="Konfigurieren Sie Berichtsvorlagen, Formate und automatische Zeitpläne."
          headerClassName="text-2xl"
        />
        <Button onClick={saveSettings} disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Einstellungen speichern
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto justify-center md:justify-start w-full">
          <TabsTrigger value="templates">Berichtsvorlagen</TabsTrigger>
          <TabsTrigger value="schedules">Zeitpläne</TabsTrigger>
          <TabsTrigger value="settings">Allgemeine Einstellungen</TabsTrigger>
        </TabsList>

        {/* Berichtsvorlagen Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Liste der Vorlagen */}
            <Card className="col-span-1 md:row-span-2">
              <CardHeader className="space-y-1">
                <CardTitle>Verfügbare Vorlagen</CardTitle>
                <CardDescription>
                  Wählen Sie eine Vorlage zur Bearbeitung aus
                </CardDescription>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Vorlagen durchsuchen..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px] w-full overflow-auto">
                  <div className="space-y-1 p-4 w-max">
                    {filteredTemplates.length > 0 ? (
                      filteredTemplates.map((template) => (
                        <div
                          key={template.id}
                          className={`flex items-center justify-between p-3 rounded-md cursor-pointer hover:bg-muted ${
                            selectedTemplate === template.id ? "bg-muted" : ""
                          }`}
                          onClick={() => setSelectedTemplate(template.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <PieChart className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{template.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Zuletzt generiert:{" "}
                                {formatDate(template.lastGenerated)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {template.isDefault && (
                              <Badge
                                variant="outline"
                                className="bg-primary/10 text-primary"
                              >
                                Standard
                              </Badge>
                            )}
                            <Badge variant="outline">
                              {
                                categoryOptions.find(
                                  (cat) => cat.value === template.category
                                )?.label
                              }
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          Keine Vorlagen gefunden
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Versuchen Sie es mit anderen Suchbegriffen oder
                          erstellen Sie eine neue Vorlage.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-1  justify-between">
                <Button
                  variant="outline"
                  onClick={() => setIsNewTemplateDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Neue Vorlage
                </Button>
                <Button variant="outline" disabled={!selectedTemplate}>
                  Duplizieren
                </Button>
              </CardFooter>
            </Card>

            {/* Vorlagendetails */}
            {selectedTemplate ? (
              <>
                <Card className="col-span-1 md:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Vorlagendetails</CardTitle>
                      <CardDescription>
                        Bearbeiten Sie die Einstellungen der ausgewählten
                        Vorlage
                      </CardDescription>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete("template", selectedTemplate)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentTemplate && (
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="template-name">Name</Label>
                            <Input
                              id="template-name"
                              defaultValue={currentTemplate.name}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="template-category">Kategorie</Label>
                            <Select defaultValue={currentTemplate.category}>
                              <SelectTrigger id="template-category">
                                <SelectValue placeholder="Kategorie auswählen" />
                              </SelectTrigger>
                              <SelectContent>
                                {categoryOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="template-description">
                            Beschreibung
                          </Label>
                          <Textarea
                            id="template-description"
                            defaultValue={currentTemplate.description}
                            className="min-h-[100px]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Verfügbare Formate</Label>
                          <div className="flex flex-wrap gap-4">
                            {formatOptions.map((format) => (
                              <div
                                key={format.id}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`format-${format.id}`}
                                  checked={currentTemplate.formats.includes(
                                    format.id as ReportFormat
                                  )}
                                />
                                <Label
                                  htmlFor={`format-${format.id}`}
                                  className="flex items-center"
                                >
                                  <format.icon className="h-4 w-4 mr-2" />
                                  {format.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="is-default"
                            checked={currentTemplate.isDefault}
                          />
                          <Label htmlFor="is-default">
                            Als Standardvorlage festlegen
                          </Label>
                        </div>

                        <Separator />

                        <div className="flex justify-between text-sm text-muted-foreground">
                          <div>
                            Erstellt am:{" "}
                            {currentTemplate.createdAt
                              ? formatDate(currentTemplate.createdAt)
                              : "Unbekannt"}
                          </div>
                          <div>
                            Zuletzt aktualisiert:{" "}
                            {currentTemplate.updatedAt
                              ? formatDate(currentTemplate.updatedAt)
                              : "Unbekannt"}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedTemplate(null)}
                    >
                      Abbrechen
                    </Button>
                    <Button onClick={saveSettings} disabled={isPending}>
                      {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Speichern
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="col-span-1 md:col-span-2">
                  <CardHeader>
                    <CardTitle>Vorschau und Test</CardTitle>
                    <CardDescription>
                      Generieren Sie einen Testbericht mit dieser Vorlage
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="test-date-range">Zeitraum</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? (
                                format(date, "PPP", { locale: de })
                              ) : (
                                <span>Datum auswählen</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              initialFocus
                              locale={de}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="test-format">Format</Label>
                        <Select
                          defaultValue={selectedFormat}
                          onValueChange={(value) =>
                            setSelectedFormat(value as ReportFormat)
                          }
                        >
                          <SelectTrigger id="test-format">
                            <SelectValue placeholder="Format auswählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {currentTemplate?.formats.map((format) => (
                              <SelectItem key={format} value={format}>
                                {format.toUpperCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-wrap justify-start md:justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        generateTestReport(
                          selectedTemplate,
                          selectedFormat,
                          true
                        )
                      }
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <FileText className="mr-2 h-4 w-4" />
                      )}
                      Vorschau
                    </Button>
                    <Button
                      onClick={() =>
                        generateTestReport(selectedTemplate, selectedFormat)
                      }
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Testbericht generieren
                    </Button>
                  </CardFooter>
                </Card>
              </>
            ) : (
              <Card className="col-span-1 md:col-span-2 md:row-span-2 flex items-center justify-center">
                <CardContent className="py-12 text-center">
                  <PieChart className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">
                    Keine Vorlage ausgewählt
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Wählen Sie eine Berichtsvorlage aus der Liste aus, um die
                    Details anzuzeigen und zu bearbeiten.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsNewTemplateDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Neue Vorlage erstellen
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Zeitpläne Tab */}
        <TabsContent value="schedules" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Liste der Zeitpläne */}
            <Card className="col-span-1 md:row-span-2">
              <CardHeader>
                <CardTitle>Automatische Zeitpläne</CardTitle>
                <CardDescription>
                  Konfigurieren Sie regelmäßige Berichtsgenerierung
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px] overflow-auto">
                  <div className="space-y-1 p-4 ">
                    {schedules.map((schedule) => (
                      <Button
                        key={schedule.id}
                        variant="outline"
                        className={`flex items-center justify-between p-3 rounded-md cursor-pointer hover:bg-muted ${
                          selectedSchedule === schedule.id ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedSchedule(schedule.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{schedule.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {
                                frequencyOptions.find(
                                  (f) => f.value === schedule.frequency
                                )?.label
                              }
                              {" • "}
                              {schedule.time} Uhr
                              {schedule.nextRun && (
                                <>
                                  {" • "}
                                  Nächste Ausführung:{" "}
                                  {formatDate(schedule.nextRun)}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Switch
                            checked={schedule.active}
                            onCheckedChange={(checked) =>
                              toggleScheduleActive(schedule.id, checked)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => setIsNewScheduleDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Neuen Zeitplan erstellen
                </Button>
              </CardFooter>
            </Card>

            {/* Zeitplandetails */}
            {selectedSchedule ? (
              <Card className="col-span-1 md:col-span-2 md:row-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Zeitplandetails</CardTitle>
                    <CardDescription>
                      Bearbeiten Sie die Einstellungen des ausgewählten
                      Zeitplans
                    </CardDescription>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete("schedule", selectedSchedule)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentSchedule && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="schedule-name">Name</Label>
                          <Input
                            id="schedule-name"
                            defaultValue={currentSchedule.name}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="schedule-report">
                            Berichtsvorlage
                          </Label>
                          <Select defaultValue={currentSchedule.reportId}>
                            <SelectTrigger id="schedule-report">
                              <SelectValue placeholder="Vorlage auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                              {reportTemplates.map((template) => (
                                <SelectItem
                                  key={template.id}
                                  value={template.id}
                                >
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="schedule-frequency">Häufigkeit</Label>
                          <Select defaultValue={currentSchedule.frequency}>
                            <SelectTrigger id="schedule-frequency">
                              <SelectValue placeholder="Häufigkeit auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                              {frequencyOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="schedule-time">Uhrzeit</Label>
                          <Input
                            id="schedule-time"
                            type="time"
                            defaultValue={currentSchedule.time}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="schedule-format">Format</Label>
                        <Select defaultValue={currentSchedule.format}>
                          <SelectTrigger id="schedule-format">
                            <SelectValue placeholder="Format auswählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {reportTemplates
                              .find((t) => t.id === currentSchedule.reportId)
                              ?.formats.map((format) => (
                                <SelectItem key={format} value={format}>
                                  {format.toUpperCase()}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Empfänger</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAddRecipientDialogOpen(true)}
                          >
                            <Plus className="mr-2 h-3 w-3" />
                            Hinzufügen
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {currentSchedule.recipients.length > 0 ? (
                            currentSchedule.recipients.map(
                              (recipient, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  {recipient}
                                  <button
                                    className="ml-1 rounded-full hover:bg-muted p-1"
                                    onClick={(e) =>
                                      removeRecipient(recipient, e)
                                    }
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </Badge>
                              )
                            )
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Keine Empfänger konfiguriert
                            </p>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="schedule-active"
                          checked={currentSchedule.active}
                          onCheckedChange={(checked) =>
                            toggleScheduleActive(currentSchedule.id, checked)
                          }
                        />
                        <Label htmlFor="schedule-active">
                          Zeitplan aktivieren
                        </Label>
                      </div>

                      {currentSchedule.lastRun && (
                        <div className="text-sm text-muted-foreground">
                          Letzte Ausführung:{" "}
                          {formatDate(currentSchedule.lastRun)}
                        </div>
                      )}
                      {currentSchedule.nextRun && (
                        <div className="text-sm text-muted-foreground">
                          Nächste Ausführung:{" "}
                          {formatDate(currentSchedule.nextRun)}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSchedule(null)}
                  >
                    Abbrechen
                  </Button>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={sendTestEmail}>
                      <Mail className="mr-2 h-4 w-4" />
                      Testmail senden
                    </Button>
                    <Button onClick={saveSettings} disabled={isPending}>
                      {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Speichern
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ) : (
              <Card className="col-span-1 md:col-span-2 md:row-span-2 flex items-center justify-center">
                <CardContent className="py-12 text-center">
                  <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">
                    Kein Zeitplan ausgewählt
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Wählen Sie einen Zeitplan aus der Liste aus, um die Details
                    anzuzeigen und zu bearbeiten.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsNewScheduleDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Neuen Zeitplan erstellen
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Allgemeine Einstellungen Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Allgemeine Berichtseinstellungen
                </CardTitle>
                <CardDescription>
                  Konfigurieren Sie globale Einstellungen für alle Berichte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Firmenname im Bericht</Label>
                  <Input
                    id="company-name"
                    defaultValue="KMW Business Management"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-format">Standardformat</Label>
                  <Select defaultValue="pdf">
                    <SelectTrigger id="default-format">
                      <SelectValue placeholder="Format auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo-position">Logo-Position</Label>
                  <Select defaultValue="top-right">
                    <SelectTrigger id="logo-position">
                      <SelectValue placeholder="Position auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Oben links</SelectItem>
                      <SelectItem value="top-center">Oben mittig</SelectItem>
                      <SelectItem value="top-right">Oben rechts</SelectItem>
                      <SelectItem value="none">Kein Logo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="include-signature" />
                  <Label htmlFor="include-signature">
                    Unterschrift in Berichten einbinden
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="include-page-numbers" defaultChecked />
                  <Label htmlFor="include-page-numbers">
                    Seitenzahlen anzeigen
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>E-Mail-Einstellungen</CardTitle>
                <CardDescription>
                  Konfigurieren Sie die E-Mail-Einstellungen für Berichtsversand
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-subject">Standard-Betreff</Label>
                  <Input
                    id="email-subject"
                    defaultValue="Ihr KMW Bericht: {report_name}"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-template">E-Mail-Vorlage</Label>
                  <Select defaultValue="default">
                    <SelectTrigger id="email-template">
                      <SelectValue placeholder="Vorlage auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Standard</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="detailed">Detailliert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-signature">E-Mail-Signatur</Label>
                  <Input
                    id="email-signature"
                    defaultValue="Ihr KMW Business Management Team"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="attach-pdf" defaultChecked />
                  <Label htmlFor="attach-pdf">
                    PDF-Berichte als Anhang senden
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="include-preview" defaultChecked />
                  <Label htmlFor="include-preview">
                    Vorschau im E-Mail-Text einbinden
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Datenschutz und Sicherheit</CardTitle>
                <CardDescription>
                  Konfigurieren Sie Sicherheitseinstellungen für Ihre Berichte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="retention-period">
                      Aufbewahrungszeitraum
                    </Label>
                    <Select defaultValue="365">
                      <SelectTrigger id="retention-period">
                        <SelectValue placeholder="Zeitraum auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 Tage</SelectItem>
                        <SelectItem value="90">90 Tage</SelectItem>
                        <SelectItem value="180">180 Tage</SelectItem>
                        <SelectItem value="365">1 Jahr</SelectItem>
                        <SelectItem value="730">2 Jahre</SelectItem>
                        <SelectItem value="unlimited">Unbegrenzt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="access-level">Standardzugriffsebene</Label>
                    <Select defaultValue="department">
                      <SelectTrigger id="access-level">
                        <SelectValue placeholder="Zugriffsebene auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Nur Ersteller</SelectItem>
                        <SelectItem value="department">Abteilung</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="all">Alle Mitarbeiter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="password-protect" />
                  <Label htmlFor="password-protect">
                    PDF-Berichte mit Passwort schützen
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="watermark" defaultChecked />
                  <Label htmlFor="watermark">
                    Wasserzeichen in Berichten anzeigen
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="audit-log" defaultChecked />
                  <Label htmlFor="audit-log">
                    Zugriffe auf Berichte protokollieren
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog für neue Vorlage */}
      <Dialog
        open={isNewTemplateDialogOpen}
        onOpenChange={setIsNewTemplateDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Neue Berichtsvorlage erstellen</DialogTitle>
            <DialogDescription>
              Erstellen Sie eine neue Berichtsvorlage für Ihr Unternehmen.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createNewTemplate}>
            <div className="grid py-4">
              <div className="space-y-2">
                <Label htmlFor="new-template-name">Name</Label>
                <Input
                  id="new-template-name"
                  name="name"
                  placeholder="Name der Vorlage"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-template-category">Kategorie</Label>
                <Select name="category" required>
                  <SelectTrigger id="new-template-category">
                    <SelectValue placeholder="Kategorie auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-template-description">Beschreibung</Label>
                <Textarea
                  id="new-template-description"
                  name="description"
                  placeholder="Beschreibung der Vorlage"
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Verfügbare Formate</Label>
                <div className="flex flex-wrap gap-4">
                  {formatOptions.map((format) => (
                    <div
                      key={format.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`new-format-${format.id}`}
                        name={`format-${format.id}`}
                        defaultChecked={format.id === "pdf"}
                      />
                      <Label
                        htmlFor={`new-format-${format.id}`}
                        className="flex items-center"
                      >
                        <format.icon className="h-4 w-4 mr-2" />
                        {format.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewTemplateDialogOpen(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit">Erstellen</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog für neuen Zeitplan */}
      <Dialog
        open={isNewScheduleDialogOpen}
        onOpenChange={setIsNewScheduleDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Neuen Zeitplan erstellen</DialogTitle>
            <DialogDescription>
              Erstellen Sie einen neuen Zeitplan für die automatische
              Berichtsgenerierung.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createNewSchedule}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-schedule-name">Name</Label>
                <Input
                  id="new-schedule-name"
                  name="name"
                  placeholder="Name des Zeitplans"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-schedule-report">Berichtsvorlage</Label>
                <Select name="reportId" required>
                  <SelectTrigger id="new-schedule-report">
                    <SelectValue placeholder="Vorlage auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-schedule-frequency">Häufigkeit</Label>
                  <Select name="frequency" defaultValue="monthly" required>
                    <SelectTrigger id="new-schedule-frequency">
                      <SelectValue placeholder="Häufigkeit auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-schedule-time">Uhrzeit</Label>
                  <Input
                    id="new-schedule-time"
                    name="time"
                    type="time"
                    defaultValue="08:00"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-schedule-format">Format</Label>
                <Select name="format" defaultValue="pdf" required>
                  <SelectTrigger id="new-schedule-format">
                    <SelectValue placeholder="Format auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewScheduleDialogOpen(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit">Erstellen</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog für neuen Empfänger */}
      <Dialog
        open={isAddRecipientDialogOpen}
        onOpenChange={setIsAddRecipientDialogOpen}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Empfänger hinzufügen</DialogTitle>
            <DialogDescription>
              Fügen Sie einen neuen Empfänger für den Berichtsversand hinzu.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-recipient">E-Mail-Adresse</Label>
              <Input
                id="new-recipient"
                placeholder="beispiel@firma.de"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddRecipientDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button onClick={addRecipient}>Hinzufügen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog für Berichtsvorschau */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Berichtsvorschau</DialogTitle>
            <DialogDescription>
              Vorschau des generierten Berichts
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[500px] w-full rounded-md border p-4">
            {previewContent && (
              <div
                className="preview-content"
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Schließen
            </Button>
            <Button
              onClick={() => {
                setIsPreviewOpen(false);
                if (selectedTemplate) {
                  generateTestReport(selectedTemplate, selectedFormat);
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Bericht generieren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
