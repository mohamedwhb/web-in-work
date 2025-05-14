"use client"

import type React from "react"

import { useRef } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useResizeObserver } from "@/hooks/use-resize-observer"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface ResponsiveCardGridProps<T> {
  data: T[]
  renderItem: (item: T, index: number, isCompact: boolean) => React.ReactNode
  keyField: keyof T
  className?: string
  columns?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: number
  isLoading?: boolean
  emptyState?: React.ReactNode
}

export function ResponsiveCardGrid<T>({
  data,
  renderItem,
  keyField,
  className,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 4,
  isLoading = false,
  emptyState,
}: ResponsiveCardGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { width } = useResizeObserver(containerRef)
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(max-width: 1024px)")
  const isCompact = width < 300 || isMobile

  if (isLoading) {
    return (
      <div
        className={cn(
          "grid gap-4",
          `grid-cols-1 sm:grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg} xl:grid-cols-${columns.xl}`,
          className,
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="w-full">
            <CardHeader className="p-4">
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter className="p-4">
              <Skeleton className="h-4 w-1/2" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (data.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "grid",
        `gap-${gap}`,
        `grid-cols-1 sm:grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg} xl:grid-cols-${columns.xl}`,
        className,
      )}
    >
      {data.map((item, index) => (
        <div key={String(item[keyField])}>{renderItem(item, index, isCompact)}</div>
      ))}
    </div>
  )
}
