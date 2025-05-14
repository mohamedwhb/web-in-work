"use client"

import { useState, useEffect } from "react"
import { Loader2, Check } from "lucide-react"

interface AutosaveIndicatorProps {
  lastSaved: Date | null
  isSaving: boolean
}

export default function AutosaveIndicator({ lastSaved, isSaving }: AutosaveIndicatorProps) {
  const [visible, setVisible] = useState(false)

  // Show indicator when saving status changes
  useEffect(() => {
    if (isSaving || lastSaved) {
      setVisible(true)

      // Hide after 3 seconds of inactivity
      const timer = setTimeout(() => {
        setVisible(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isSaving, lastSaved])

  if (!visible) return null

  return (
    <div className="flex items-center text-sm text-muted-foreground animate-fade-in">
      {isSaving ? (
        <>
          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
          <span>Speichern...</span>
        </>
      ) : lastSaved ? (
        <>
          <Check className="h-3 w-3 mr-2 text-green-500" />
          <span>Gespeichert um {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </>
      ) : null}
    </div>
  )
}
