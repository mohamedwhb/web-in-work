"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface Size {
  width: number | undefined
  height: number | undefined
}

export function useResizeObserver(ref: React.RefObject<HTMLElement>): Size {
  const [size, setSize] = useState<Size>({
    width: undefined,
    height: undefined,
  })

  const observer = useRef<ResizeObserver | null>(null)

  useEffect(() => {
    // Skip if ref or element is not available
    if (!ref.current) {
      return
    }

    // Cleanup any existing observer
    if (observer.current) {
      observer.current.disconnect()
    }

    // Create a new observer
    observer.current = new ResizeObserver((entries) => {
      // We're only observing one element, so we can use entries[0]
      const entry = entries[0]

      if (entry) {
        const { width, height } = entry.contentRect
        setSize({ width, height })
      }
    })

    // Start observing
    observer.current.observe(ref.current)

    // Cleanup on unmount
    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [ref])

  return size
}
