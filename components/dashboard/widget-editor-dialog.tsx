"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { type WidgetConfig, type WidgetType, type WidgetSize, DATA_SOURCES, COLOR_SCHEMES } from "./widget-types"
import { updateWidget, addWidget } from "@/lib/widget-service"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface WidgetEditorDialogProps {
  widget?: WidgetConfig
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function WidgetEditorDialog({ widget, isOpen, onClose, onSave }: WidgetEditorDialogProps) {
  const [formData, setFormData] = useState<Partial<WidgetConfig>>({
    title: "",
    type: "number",
    size: "small",
    dataSource: "",
    refreshInterval: 60,
    showActions: true,
    isVisible: true,
    colorScheme: "default",
    dateRange: "month",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const { toast } = useToast()

  useEffect(() => {
    if (widget) {
      setFormData({
        ...widget,
      })

      // Set date range if available
      if (widget.customDateRange) {
        setStartDate(widget.customDateRange.start ? new Date(widget.customDateRange.start) : undefined)
        setEndDate(widget.customDateRange.end ? new Date(widget.customDateRange.end) : undefined)
      }
    } else {
      // Reset form for new widget
      setFormData({
        title: "",
        type: "number",
        size: "small",
        dataSource: "",
        refreshInterval: 60,
        showActions: true,
        isVisible: true,
        colorScheme: "default",
        dateRange: "month",
      })
      setStartDate(undefined)
      setEndDate(undefined)
    }
    setActiveTab("general")
  }, [widget, isOpen])

  const handleChange = (field: keyof WidgetConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Special handling for dateRange
    if (field === "dateRange" && value !== "custom") {
      // Clear custom date range when selecting a predefined range
      setStartDate(undefined)
      setEndDate(undefined)
      setFormData((prev) => ({
        ...prev,
        customDateRange: undefined,
      }))
    }
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.type || !formData.dataSource) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie alle erforderlichen Felder aus.",
        variant: "destructive",
      })
      return
    }

    // Handle custom date range
    if (formData.dateRange === "custom") {
      if (!startDate || !endDate) {
        toast({
          title: "Fehlende Datumsangaben",
          description: "Bitte wählen Sie Start- und Enddatum für den benutzerdefinierten Zeitraum.",
          variant: "destructive",
        })
        return
      }

      formData.customDateRange = {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      }
    }

    setIsSaving(true)
    try {
      if (widget) {
        // Update existing widget
        await updateWidget(formData as WidgetConfig)
        toast({
          title: "Widget aktualisiert",
          description: "Das Widget wurde erfolgreich aktualisiert.",
        })
      } else {
        // Add new widget
        await addWidget(formData as Omit<WidgetConfig, "id">)
        toast({
          title: "Widget hinzugefügt",
          description: "Das neue Widget wurde erfolgreich hinzugefügt.",
        })
      }
      onSave()
      onClose()
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Beim Speichern des Widgets ist ein Fehler aufgetreten.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{widget ? "Widget bearbeiten" : "Neues Widget erstellen"}</DialogTitle>
          <DialogDescription>
            {widget
              ? "Bearbeiten Sie die Einstellungen des Widgets."
              : "Erstellen Sie ein neues Widget für Ihr Dashboard."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="general">Allgemein</TabsTrigger>
            <TabsTrigger value="appearance">Darstellung</TabsTrigger>
            <TabsTrigger value="data">Daten</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Titel
              </Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Typ
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value as WidgetType)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Widget-Typ auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="number">Zahl</SelectItem>
                  <SelectItem value="chart-bar">Balkendiagramm</SelectItem>
                  <SelectItem value="chart-line">Liniendiagramm</SelectItem>
                  <SelectItem value="chart-pie">Kreisdiagramm</SelectItem>
                  <SelectItem value="list">Liste</SelectItem>
                  <SelectItem value="table">Tabelle</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="comparison">Vergleich</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="size" className="text-right">
                Größe
              </Label>
              <Select value={formData.size} onValueChange={(value) => handleChange("size", value as WidgetSize)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Widget-Größe auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Klein (1x1)</SelectItem>
                  <SelectItem value="medium">Mittel (2x1)</SelectItem>
                  <SelectItem value="large">Groß (3x1)</SelectItem>
                  <SelectItem value="full">Volle Breite (4x1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dataSource" className="text-right">
                Datenquelle
              </Label>
              <Select value={formData.dataSource} onValueChange={(value) => handleChange("dataSource", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Datenquelle auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {DATA_SOURCES.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="colorScheme" className="text-right">
                Farbschema
              </Label>
              <Select
                value={formData.colorScheme || "default"}
                onValueChange={(value) => handleChange("colorScheme", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Farbschema auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_SCHEMES.map((scheme) => (
                    <SelectItem key={scheme.id} value={scheme.id}>
                      {scheme.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="showActions" className="text-right">
                Aktionen anzeigen
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="showActions"
                  checked={formData.showActions}
                  onCheckedChange={(checked) => handleChange("showActions", checked)}
                />
                <Label htmlFor="showActions">Details-Button anzeigen</Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isVisible" className="text-right">
                Sichtbar
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="isVisible"
                  checked={formData.isVisible}
                  onCheckedChange={(checked) => handleChange("isVisible", checked)}
                />
                <Label htmlFor="isVisible">Widget auf Dashboard anzeigen</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="refreshInterval" className="text-right">
                Aktualisierung
              </Label>
              <Select
                value={formData.refreshInterval?.toString() || "0"}
                onValueChange={(value) => handleChange("refreshInterval", Number.parseInt(value))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Aktualisierungsintervall" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Keine automatische Aktualisierung</SelectItem>
                  <SelectItem value="5">Alle 5 Minuten</SelectItem>
                  <SelectItem value="15">Alle 15 Minuten</SelectItem>
                  <SelectItem value="30">Alle 30 Minuten</SelectItem>
                  <SelectItem value="60">Stündlich</SelectItem>
                  <SelectItem value="360">Alle 6 Stunden</SelectItem>
                  <SelectItem value="720">Alle 12 Stunden</SelectItem>
                  <SelectItem value="1440">Täglich</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dateRange" className="text-right">
                Zeitraum
              </Label>
              <Select value={formData.dateRange || "month"} onValueChange={(value) => handleChange("dateRange", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Zeitraum auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Heute</SelectItem>
                  <SelectItem value="week">Diese Woche</SelectItem>
                  <SelectItem value="month">Dieser Monat</SelectItem>
                  <SelectItem value="quarter">Dieses Quartal</SelectItem>
                  <SelectItem value="year">Dieses Jahr</SelectItem>
                  <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.dateRange === "custom" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Zeitraum von/bis</Label>
                <div className="col-span-3 flex flex-wrap gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[180px] justify-start text-left font-normal",
                          !startDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP", { locale: de }) : "Von Datum"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[180px] justify-start text-left font-normal",
                          !endDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP", { locale: de }) : "Bis Datum"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        disabled={(date) => (startDate ? date < startDate : false)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Wird gespeichert..." : widget ? "Aktualisieren" : "Erstellen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
