"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)

    // Initialen Wert setzen
    setMatches(media.matches)

    // Event-Listener für Änderungen
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Event-Listener hinzufügen
    media.addEventListener("change", listener)

    // Event-Listener entfernen beim Cleanup
    return () => {
      media.removeEventListener("change", listener)
    }
  }, [query])

  return matches
}
