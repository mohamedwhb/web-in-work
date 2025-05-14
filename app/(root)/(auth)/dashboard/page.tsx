"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { WidgetGrid } from "@/components/dashboard/widget-grid"
import { WidgetEditorDialog } from "@/components/dashboard/widget-editor-dialog"
import { DashboardSettingsDialog } from "@/components/dashboard/dashboard-settings-dialog"
import type { WidgetConfig } from "@/components/dashboard/widget-types"
import { deleteWidget, getDashboardSettings, saveDashboardSettings } from "@/lib/widget-service"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { startOfMonth, endOfMonth } from "date-fns"
import { useTheme } from "next-themes"

export default function DashboardPage() {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [currentWidget, setCurrentWidget] = useState<WidgetConfig | undefined>(undefined)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [widgetToDelete, setWidgetToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [compactView, setCompactView] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [layout, setLayout] = useState<"grid" | "list">("grid")
  const [refreshInterval, setRefreshInterval] = useState(5)
  const [defaultChartType, setDefaultChartType] = useState<"bar" | "line" | "pie" | "table">("bar")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()

  // Load dashboard settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getDashboardSettings()
        setCompactView(settings.compactView || false)
        setAutoRefresh(settings.autoRefresh !== false) // Default to true
        setLayout(settings.layout || "grid")
        setRefreshInterval(settings.refreshInterval || 5)
        setDefaultChartType(settings.defaultChartType || "bar")

        // Set theme if it exists in settings
        if (settings.theme) {
          setTheme(settings.theme)
        }
      } catch (error) {
        console.error("Error loading dashboard settings:", error)
      }
    }

    loadSettings()
  }, [setTheme])

  // Set up auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(
      () => {
        handleRefreshAll()
      },
      refreshInterval * 60 * 1000,
    ) // Convert minutes to milliseconds

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  const handleAddWidget = () => {
    setCurrentWidget(undefined)
    setIsEditorOpen(true)
  }

  const handleEditWidget = (widget: WidgetConfig) => {
    setCurrentWidget(widget)
    setIsEditorOpen(true)
  }

  const handleDeleteWidget = (widgetId: string) => {
    setWidgetToDelete(widgetId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteWidget = async () => {
    if (!widgetToDelete) return

    setIsDeleting(true)
    try {
      await deleteWidget(widgetToDelete)
      toast({
        title: "Widget entfernt",
        description: "Das Widget wurde erfolgreich vom Dashboard entfernt.",
      })
      setRefreshTrigger((prev) => prev + 1)
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Beim Entfernen des Widgets ist ein Fehler aufgetreten.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setWidgetToDelete(null)
    }
  }

  const handleRefreshAll = useCallback(() => {
    toast({
      title: "Aktualisierung",
      description: "Alle Widgets werden aktualisiert.",
    })
    setRefreshTrigger((prev) => prev + 1)
  }, [toast])

  const handleSaveWidget = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleToggleCompactView = async () => {
    const newValue = !compactView
    setCompactView(newValue)

    try {
      const settings = await getDashboardSettings()
      await saveDashboardSettings({
        ...settings,
        compactView: newValue,
      })
    } catch (error) {
      console.error("Error saving compact view setting:", error)
    }
  }

  const handleAutoRefreshChange = async (enabled: boolean) => {
    setAutoRefresh(enabled)

    try {
      const settings = await getDashboardSettings()
      await saveDashboardSettings({
        ...settings,
        autoRefresh: enabled,
      })
    } catch (error) {
      console.error("Error saving auto refresh setting:", error)
    }
  }

  const handleDateRangeChange = (range: { from: Date; to: Date } | undefined) => {
    setDateRange(range)
  }

  const handleOpenSettings = () => {
    setIsSettingsOpen(true)
  }

  const handleSaveSettings = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)

    try {
      const settings = await getDashboardSettings()
      await saveDashboardSettings({
        ...settings,
        theme: newTheme,
      })
    } catch (error) {
      console.error("Error saving theme setting:", error)
    }
  }

  const handleLayoutChange = async (newLayout: "grid" | "list") => {
    setLayout(newLayout)

    try {
      const settings = await getDashboardSettings()
      await saveDashboardSettings({
        ...settings,
        layout: newLayout,
      })
    } catch (error) {
      console.error("Error saving layout setting:", error)
    }
  }

  const handleRefreshIntervalChange = async (minutes: number) => {
    setRefreshInterval(minutes)

    try {
      const settings = await getDashboardSettings()
      await saveDashboardSettings({
        ...settings,
        refreshInterval: minutes,
      })
    } catch (error) {
      console.error("Error saving refresh interval setting:", error)
    }
  }

  const handleDefaultChartTypeChange = async (chartType: "bar" | "line" | "pie" | "table") => {
    setDefaultChartType(chartType)

    try {
      const settings = await getDashboardSettings()
      await saveDashboardSettings({
        ...settings,
        defaultChartType: chartType,
      })
    } catch (error) {
      console.error("Error saving default chart type setting:", error)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader
        onAddWidget={handleAddWidget}
        onRefreshAll={handleRefreshAll}
        onToggleCompactView={handleToggleCompactView}
        compactView={compactView}
        onDateRangeChange={handleDateRangeChange}
        dateRange={dateRange}
        onAutoRefreshChange={handleAutoRefreshChange}
        autoRefresh={autoRefresh}
        onOpenSettings={handleOpenSettings}
        onThemeChange={handleThemeChange}
        onLayoutChange={handleLayoutChange}
        onRefreshIntervalChange={handleRefreshIntervalChange}
        onDefaultChartTypeChange={handleDefaultChartTypeChange}
        theme={theme as "light" | "dark" | "system"}
        layout={layout}
        refreshInterval={refreshInterval}
        defaultChartType={defaultChartType}
      />

      <WidgetGrid
        key={`widget-grid-${refreshTrigger}`}
        onEditWidget={handleEditWidget}
        onDeleteWidget={handleDeleteWidget}
        onAddWidget={handleAddWidget}
        compactView={compactView}
        layout={layout}
        dateRange={dateRange ? "custom" : "month"}
        customDateRange={
          dateRange
            ? {
                start: dateRange.from.toISOString(),
                end: dateRange.to.toISOString(),
              }
            : undefined
        }
        defaultChartType={defaultChartType}
      />

      <WidgetEditorDialog
        widget={currentWidget}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveWidget}
        defaultChartType={defaultChartType}
      />

      <DashboardSettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Widget entfernen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie dieses Widget wirklich vom Dashboard entfernen? Diese Aktion kann rückgängig gemacht werden,
              indem Sie ein neues Widget mit den gleichen Einstellungen erstellen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteWidget}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Wird entfernt..." : "Entfernen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
