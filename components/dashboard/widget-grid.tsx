"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Widget } from "./widget"
import type { WidgetConfig } from "./widget-types"
import { getWidgetConfigurations, saveWidgetConfigurations } from "@/lib/widget-service"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PlusCircle, LayoutGrid, LayoutList, Smartphone, Tablet, Monitor } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useResizeObserver } from "@/hooks/use-resize-observer"

interface WidgetGridProps {
  onEditWidget: (widget: WidgetConfig) => void
  onDeleteWidget: (widgetId: string) => void
  onAddWidget: () => void
  compactView?: boolean
  dateRange?: string
  customDateRange?: { start: string; end: string }
}

export function WidgetGrid({
  onEditWidget,
  onDeleteWidget,
  onAddWidget,
  compactView = false,
  dateRange,
  customDateRange,
}: WidgetGridProps) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "tablet" | "desktop">("desktop")
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")
  const containerRef = useRef<HTMLDivElement>(null)
  const { width: containerWidth } = useResizeObserver(containerRef)

  // Automatisch das richtige Gerät für die Vorschau basierend auf der Bildschirmgröße auswählen
  useEffect(() => {
    if (isMobile) setPreviewDevice("mobile")
    else if (isTablet) setPreviewDevice("tablet")
    else setPreviewDevice("desktop")
  }, [isMobile, isTablet])

  const loadWidgets = useCallback(async () => {
    setLoading(true)
    try {
      const configs = await getWidgetConfigurations()
      // Sort by position
      const sortedConfigs = [...configs].sort((a, b) => (a.position || 0) - (b.position || 0))
      setWidgets(sortedConfigs)
    } catch (error) {
      console.error("Error loading widget configurations:", error)
      toast({
        title: "Fehler",
        description: "Die Widget-Konfigurationen konnten nicht geladen werden.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadWidgets()
  }, [loadWidgets])

  const handleRefreshWidget = (widgetId: string) => {
    // This is handled within the Widget component itself
    console.log(`Refreshing widget: ${widgetId}`)
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const items = Array.from(widgets)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index,
    }))

    setWidgets(updatedItems)

    // Save the new order
    try {
      await saveWidgetConfigurations(updatedItems)
      toast({
        title: "Layout gespeichert",
        description: "Die neue Anordnung der Widgets wurde gespeichert.",
      })
    } catch (error) {
      console.error("Error saving widget order:", error)
      toast({
        title: "Fehler",
        description: "Die neue Anordnung konnte nicht gespeichert werden.",
        variant: "destructive",
      })
      // Revert to previous state if save fails
      loadWidgets()
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-muted/20 rounded-lg h-[200px] animate-pulse" />
        ))}
      </div>
    )
  }

  // Filter visible widgets
  const visibleWidgets = widgets.filter((widget) => widget.isVisible !== false)

  // If no widgets are visible, show an empty state
  if (visibleWidgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/10 min-h-[300px]">
        <h3 className="text-lg font-medium mb-2">Keine Widgets vorhanden</h3>
        <p className="text-muted-foreground mb-4 text-center max-w-md">
          Fügen Sie Widgets hinzu, um Ihre wichtigsten Geschäftskennzahlen auf einen Blick zu sehen.
        </p>
        <Button onClick={onAddWidget} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Widget hinzufügen
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4" ref={containerRef}>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant={previewDevice === "mobile" ? "default" : "outline"}
            size="sm"
            className="h-8 px-2 sm:px-3"
            onClick={() => setPreviewDevice("mobile")}
          >
            <Smartphone className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Mobil</span>
          </Button>
          <Button
            variant={previewDevice === "tablet" ? "default" : "outline"}
            size="sm"
            className="h-8 px-2 sm:px-3"
            onClick={() => setPreviewDevice("tablet")}
          >
            <Tablet className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Tablet</span>
          </Button>
          <Button
            variant={previewDevice === "desktop" ? "default" : "outline"}
            size="sm"
            className="h-8 px-2 sm:px-3"
            onClick={() => setPreviewDevice("desktop")}
          >
            <Monitor className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Desktop</span>
          </Button>
        </div>

        <Tabs defaultValue="grid" value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
          <TabsList className="grid w-[120px] sm:w-[180px] grid-cols-2">
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Kacheln</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <LayoutList className="h-4 w-4" />
              <span className="hidden sm:inline">Liste</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewMode === "grid" ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="widgets" direction="horizontal">
            {(provided, snapshot) => (
              <div
                className={`grid gap-4 ${
                  previewDevice === "mobile"
                    ? "grid-cols-1"
                    : previewDevice === "tablet"
                      ? "grid-cols-2"
                      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                }`}
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{
                  maxWidth: previewDevice === "mobile" ? "480px" : previewDevice === "tablet" ? "768px" : "100%",
                  margin: previewDevice !== "desktop" ? "0 auto" : undefined,
                }}
              >
                {visibleWidgets.map((widget, index) => (
                  <DraggableWidget
                    key={widget.id}
                    widget={widget}
                    index={index}
                    onEdit={onEditWidget}
                    onDelete={onDeleteWidget}
                    onRefresh={handleRefreshWidget}
                    compactView={compactView || previewDevice === "mobile"}
                    dateRange={dateRange}
                    customDateRange={customDateRange}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div
          className="space-y-2"
          style={{
            maxWidth: previewDevice === "mobile" ? "480px" : previewDevice === "tablet" ? "768px" : "100%",
            margin: previewDevice !== "desktop" ? "0 auto" : undefined,
          }}
        >
          {visibleWidgets.map((widget) => (
            <Widget
              key={widget.id}
              config={{
                ...widget,
                dateRange: dateRange || widget.dateRange,
                customDateRange: customDateRange || widget.customDateRange,
              }}
              onEdit={onEditWidget}
              onDelete={onDeleteWidget}
              onRefresh={handleRefreshWidget}
              compactView={true}
              className="!col-span-1 !md:col-span-1"
            />
          ))}
        </div>
      )}

      {/* Floating Add Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button onClick={onAddWidget} size="icon" className="h-12 w-12 rounded-full shadow-lg">
          <PlusCircle className="h-6 w-6" />
          <span className="sr-only">Widget hinzufügen</span>
        </Button>
      </div>
    </div>
  )
}

// Helper component for draggable widgets
interface DraggableWidgetProps {
  widget: WidgetConfig
  index: number
  onEdit: (widget: WidgetConfig) => void
  onDelete: (widgetId: string) => void
  onRefresh: (widgetId: string) => void
  compactView?: boolean
  dateRange?: string
  customDateRange?: { start: string; end: string }
}

function DraggableWidget({
  widget,
  index,
  onEdit,
  onDelete,
  onRefresh,
  compactView,
  dateRange,
  customDateRange,
}: DraggableWidgetProps) {
  return (
    <Draggable draggableId={widget.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(snapshot.isDragging ? "opacity-70 z-50" : "")}
        >
          <Widget
            config={{
              ...widget,
              dateRange: dateRange || widget.dateRange,
              customDateRange: customDateRange || widget.customDateRange,
            }}
            onEdit={onEdit}
            onDelete={onDelete}
            onRefresh={onRefresh}
            compactView={compactView}
          />
        </div>
      )}
    </Draggable>
  )
}
