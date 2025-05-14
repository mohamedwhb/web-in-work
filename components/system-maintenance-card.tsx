"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { clearCache, optimizeDatabase, generateSystemReport, checkForUpdates } from "@/lib/system-service"
import { Loader2, RefreshCw, Database, FileText } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function SystemMaintenanceCard() {
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false)
  const [isClearingCache, setIsClearingCache] = useState(false)
  const [isOptimizingDb, setIsOptimizingDb] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  const handleCheckUpdates = async () => {
    setIsCheckingUpdates(true)
    try {
      const result = await checkForUpdates()
      if (result.available) {
        toast({
          title: "Update verfügbar",
          description: `Version ${result.version} steht zum Download bereit.`,
        })
      } else {
        toast({
          title: "Keine Updates verfügbar",
          description: "Ihr System ist auf dem neuesten Stand.",
        })
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Updates konnten nicht überprüft werden.",
        variant: "destructive",
      })
    } finally {
      setIsCheckingUpdates(false)
    }
  }

  const handleClearCache = async () => {
    setIsClearingCache(true)
    try {
      await clearCache()
      toast({
        title: "Cache geleert",
        description: "Der System-Cache wurde erfolgreich geleert.",
      })
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Cache konnte nicht geleert werden.",
        variant: "destructive",
      })
    } finally {
      setIsClearingCache(false)
    }
  }

  const handleOptimizeDb = async () => {
    setIsOptimizingDb(true)
    try {
      const result = await optimizeDatabase()
      toast({
        title: "Datenbank optimiert",
        description: result.message,
      })
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Datenbank konnte nicht optimiert werden.",
        variant: "destructive",
      })
    } finally {
      setIsOptimizingDb(false)
    }
  }

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true)
    try {
      const result = await generateSystemReport()
      toast({
        title: "Bericht erstellt",
        description: "Der Systembericht wurde erfolgreich erstellt.",
        action: (
          <a href={result.url} download className="bg-primary text-primary-foreground px-3 py-2 rounded-md text-xs">
            Herunterladen
          </a>
        ),
      })
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Bericht konnte nicht erstellt werden.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingReport(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Systemwartung</CardTitle>
        <CardDescription>Wartungsaufgaben und Systemoptimierung</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleCheckUpdates}
            disabled={isCheckingUpdates}
          >
            {isCheckingUpdates ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Nach Updates suchen
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleClearCache}
            disabled={isClearingCache}
          >
            {isClearingCache ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Cache leeren
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleOptimizeDb}
            disabled={isOptimizingDb}
          >
            {isOptimizingDb ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            Datenbank optimieren
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
          >
            {isGeneratingReport ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Systembericht erstellen
          </Button>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Regelmäßige Wartung verbessert die Systemleistung und Stabilität.
      </CardFooter>
    </Card>
  )
}
