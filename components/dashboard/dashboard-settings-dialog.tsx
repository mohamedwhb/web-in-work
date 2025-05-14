"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { getDashboardSettings, saveDashboardSettings } from "@/lib/widget-service"
import { useToast } from "@/components/ui/use-toast"

interface DashboardSettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function DashboardSettingsDialog({ isOpen, onClose, onSave }: DashboardSettingsDialogProps) {
  const [settings, setSettings] = useState({
    refreshInterval: 5, // minutes
    theme: "system",
    layout: "grid",
    compactView: false,
    autoRefresh: true,
    animations: true,
    notifications: true,
    notificationSound: false,
    dataCache: true,
    dataCacheDuration: 15, // minutes
  })
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      loadSettings()
    }
  }, [isOpen])

  const loadSettings = async () => {
    try {
      const savedSettings = await getDashboardSettings()
      setSettings((prev) => ({
        ...prev,
        ...savedSettings,
      }))
    } catch (error) {
      console.error("Error loading settings:", error)
      toast({
        title: "Fehler",
        description: "Die Einstellungen konnten nicht geladen werden.",
        variant: "destructive",
      })
    }
  }

  const handleChange = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      await saveDashboardSettings(settings)
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Dashboard-Einstellungen wurden erfolgreich gespeichert.",
      })
      onSave()
      onClose()
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Dashboard-Einstellungen</DialogTitle>
          <DialogDescription>Passen Sie die Einstellungen für Ihr Dashboard an.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="general">Allgemein</TabsTrigger>
            <TabsTrigger value="appearance">Darstellung</TabsTrigger>
            <TabsTrigger value="data">Daten</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="autoRefresh">Automatische Aktualisierung</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoRefresh"
                  checked={settings.autoRefresh}
                  onCheckedChange={(checked) => handleChange("autoRefresh", checked)}
                />
                <Label htmlFor="autoRefresh">Aktiviert</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="refreshInterval">Aktualisierungsintervall</Label>
              <Select
                value={settings.refreshInterval.toString()}
                onValueChange={(value) => handleChange("refreshInterval", Number.parseInt(value))}
                disabled={!settings.autoRefresh}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Intervall wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Minute</SelectItem>
                  <SelectItem value="5">5 Minuten</SelectItem>
                  <SelectItem value="10">10 Minuten</SelectItem>
                  <SelectItem value="15">15 Minuten</SelectItem>
                  <SelectItem value="30">30 Minuten</SelectItem>
                  <SelectItem value="60">1 Stunde</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="notifications">Benachrichtigungen</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => handleChange("notifications", checked)}
                />
                <Label htmlFor="notifications">Aktiviert</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="notificationSound">Benachrichtigungston</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="notificationSound"
                  checked={settings.notificationSound}
                  onCheckedChange={(checked) => handleChange("notificationSound", checked)}
                  disabled={!settings.notifications}
                />
                <Label htmlFor="notificationSound">Aktiviert</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="theme">Farbschema</Label>
              <Select value={settings.theme} onValueChange={(value) => handleChange("theme", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Farbschema wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Hell</SelectItem>
                  <SelectItem value="dark">Dunkel</SelectItem>
                  <SelectItem value="system">Systemeinstellung</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="layout">Layout</Label>
              <Select value={settings.layout} onValueChange={(value) => handleChange("layout", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Layout wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Raster</SelectItem>
                  <SelectItem value="list">Liste</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="compactView">Kompakte Ansicht</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="compactView"
                  checked={settings.compactView}
                  onCheckedChange={(checked) => handleChange("compactView", checked)}
                />
                <Label htmlFor="compactView">Aktiviert</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="animations">Animationen</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="animations"
                  checked={settings.animations}
                  onCheckedChange={(checked) => handleChange("animations", checked)}
                />
                <Label htmlFor="animations">Aktiviert</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="dataCache">Daten-Cache</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="dataCache"
                  checked={settings.dataCache}
                  onCheckedChange={(checked) => handleChange("dataCache", checked)}
                />
                <Label htmlFor="dataCache">Aktiviert</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="dataCacheDuration">Cache-Dauer (Minuten)</Label>
              <div className="flex flex-col space-y-2 w-full">
                <Slider
                  id="dataCacheDuration"
                  min={1}
                  max={60}
                  step={1}
                  value={[settings.dataCacheDuration]}
                  onValueChange={(value) => handleChange("dataCacheDuration", value[0])}
                  disabled={!settings.dataCache}
                />
                <div className="text-right text-sm">{settings.dataCacheDuration} Minuten</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Wird gespeichert..." : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
