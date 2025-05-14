"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useResizeObserver } from "@/hooks/use-resize-observer"
import { ChevronRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Column<T> {
  header: string
  accessorKey: keyof T
  cell?: (item: T) => React.ReactNode
  className?: string
  priority?: number // Higher number = higher priority (shown first on small screens)
}

interface ResponsiveTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyField: keyof T
  className?: string
  onRowClick?: (item: T) => void
  expandedContent?: (item: T) => React.ReactNode
  isLoading?: boolean
  emptyState?: React.ReactNode
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyField,
  className,
  onRowClick,
  expandedContent,
  isLoading = false,
  emptyState,
}: ResponsiveTableProps<T>) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const { width } = useResizeObserver(containerRef)
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(max-width: 1024px)")

  // Sort columns by priority
  const sortedColumns = [...columns].sort((a, b) => (b.priority || 0) - (a.priority || 0))

  // Determine how many columns to show based on screen size
  const getVisibleColumns = () => {
    if (isMobile) return sortedColumns.slice(0, 2)
    if (isTablet) return sortedColumns.slice(0, 4)
    return sortedColumns
  }

  const visibleColumns = getVisibleColumns()

  const toggleRow = (key: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted/20 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (data.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>
  }

  return (
    <div ref={containerRef} className={cn("space-y-1", className)}>
      {/* Table header on non-mobile */}
      {!isMobile && (
        <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2 bg-muted/20 rounded-md font-medium text-sm">
          {visibleColumns.map((column, index) => (
            <div key={String(column.accessorKey)} className={cn("col-span-3", column.className)}>
              {column.header}
            </div>
          ))}
        </div>
      )}

      {/* Table rows */}
      {data.map((item) => {
        const key = String(item[keyField])
        const isExpanded = expandedRows[key]

        return (
          <div key={key} className="space-y-1">
            <div
              className={cn(
                "grid grid-cols-12 gap-2 px-4 py-3 bg-card rounded-md border",
                onRowClick && "cursor-pointer hover:bg-muted/10",
              )}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
            >
              {/* Expand button if expandable */}
              {expandedContent && (
                <div className="col-span-1 flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleRow(key)
                    }}
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>
              )}

              {/* Visible columns */}
              {visibleColumns.map((column) => (
                <div
                  key={String(column.accessorKey)}
                  className={cn("col-span-3 flex items-center", expandedContent && "col-span-2", column.className)}
                >
                  {isMobile && <span className="font-medium text-xs mr-2 sm:hidden">{column.header}:</span>}
                  <div className="truncate">
                    {column.cell ? column.cell(item) : String(item[column.accessorKey] || "")}
                  </div>
                </div>
              ))}
            </div>

            {/* Expanded content */}
            {isExpanded && expandedContent && (
              <div className="px-4 py-3 bg-muted/5 rounded-md border border-dashed ml-6">{expandedContent(item)}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
