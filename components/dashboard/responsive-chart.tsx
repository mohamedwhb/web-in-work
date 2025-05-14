"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { useResizeObserver } from "@/hooks/use-resize-observer"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface ResponsiveChartProps {
  renderChart: (width: number, height: number) => React.ReactNode
  aspectRatio?: number
  minHeight?: number
  maxHeight?: number
  className?: string
  loading?: boolean
}

export function ResponsiveChart({
  renderChart,
  aspectRatio = 16 / 9,
  minHeight = 200,
  maxHeight = 400,
  className,
  loading = false,
}: ResponsiveChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { width } = useResizeObserver(containerRef)
  const [height, setHeight] = useState(minHeight)

  useEffect(() => {
    if (width > 0) {
      // Calculate height based on aspect ratio
      const calculatedHeight = width / aspectRatio

      // Constrain height between min and max
      const constrainedHeight = Math.max(minHeight, Math.min(calculatedHeight, maxHeight))

      setHeight(constrainedHeight)
    }
  }, [width, aspectRatio, minHeight, maxHeight])

  return (
    <div ref={containerRef} className={className} style={{ height }}>
      {loading ? (
        <Card className="w-full h-full">
          <CardContent className="p-0 flex items-center justify-center h-full">
            <Skeleton className="w-full h-full" />
          </CardContent>
        </Card>
      ) : (
        width > 0 && renderChart(width, height)
      )}
    </div>
  )
}
