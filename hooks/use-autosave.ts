"use client"

import { useState, useEffect, useRef, useCallback } from "react"

type AutosaveOptions = {
  key: string
  data: any
  interval?: number
  onSave?: (data: any) => void
}

export function useAutosave({ key, data, interval = 5000, onSave }: AutosaveOptions) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isRestored, setIsRestored] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const previousDataRef = useRef<string>("")

  // Function to save data to localStorage
  const saveToStorage = useCallback(() => {
    try {
      const dataString = JSON.stringify(data)

      // Only save if data has changed
      if (dataString !== previousDataRef.current) {
        setIsSaving(true)
        localStorage.setItem(`autosave:${key}`, dataString)
        localStorage.setItem(`autosave:${key}:timestamp`, new Date().toISOString())
        setLastSaved(new Date())
        previousDataRef.current = dataString

        if (onSave) {
          onSave(data)
        }

        setTimeout(() => setIsSaving(false), 1000)
      }
    } catch (error) {
      console.error("Error saving data:", error)
    }
  }, [data, key, onSave])

  // Set up autosave interval
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(saveToStorage, interval)

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, interval, saveToStorage])

  // Save on window unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveToStorage()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [saveToStorage])

  // Function to get saved data
  const getSavedData = useCallback(() => {
    try {
      const savedDataString = localStorage.getItem(`autosave:${key}`)
      const timestamp = localStorage.getItem(`autosave:${key}:timestamp`)

      if (savedDataString && timestamp) {
        return {
          data: JSON.parse(savedDataString),
          timestamp: new Date(timestamp),
        }
      }
    } catch (error) {
      console.error("Error retrieving saved data:", error)
    }

    return null
  }, [key])

  // Function to clear saved data
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(`autosave:${key}`)
      localStorage.removeItem(`autosave:${key}:timestamp`)
      setLastSaved(null)
      previousDataRef.current = ""
    } catch (error) {
      console.error("Error clearing saved data:", error)
    }
  }, [key])

  // Function to manually trigger a save
  const save = useCallback(() => {
    saveToStorage()
  }, [saveToStorage])

  return {
    lastSaved,
    isRestored,
    isSaving,
    getSavedData,
    clearSavedData,
    save,
    setIsRestored,
  }
}
