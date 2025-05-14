"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { type SystemSettings, updateSystemSettings } from "@/lib/system-service"
import { toast } from "@/hooks/use-toast"
import { Loader2, Save } from "lucide-react"

const systemSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  language: z.string(),
  dateFormat: z.string(),
  timeFormat: z.string(),
  timezone: z.string(),
  notifications: z.boolean(),
  autoSave: z.boolean(),
  autoSaveInterval: z.number().min(1).max(60),
  debugMode: z.boolean(),
  analyticsEnabled: z.boolean(),
  sessionTimeout: z.number().min(5).max(120),
  maxUploadSize: z.number().min(1).max(100),
  cacheEnabled: z.boolean(),
  cacheDuration: z.number().min(5).max(1440),
})

interface SystemSettingsFormProps {
  initialSettings: SystemSettings
}

export function SystemSettingsForm({ initialSettings }: SystemSettingsFormProps) {
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<z.infer<typeof systemSettingsSchema>>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: initialSettings,
  })

  async function onSubmit(data: z.infer<typeof systemSettingsSchema>) {
    setIsSaving(true)
    try {
      await updateSystemSettings(data)
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Systemeinstellungen wurden erfolgreich aktualisiert.",
      })
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
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Systemeinstellungen</CardTitle>
        <CardDescription>Konfigurieren Sie die grundlegenden Systemeinstellungen</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Appearance Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Darstellung</h3>

                <FormField
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Design</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wählen Sie ein Design" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="light">Hell</SelectItem>
                          <SelectItem value="dark">Dunkel</SelectItem>
                          <SelectItem value="system">Systemeinstellung</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sprache</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wählen Sie eine Sprache" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="de">Deutsch</SelectItem>
                          <SelectItem value="en">Englisch</SelectItem>
                          <SelectItem value="fr">Französisch</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Datumsformat</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wählen Sie ein Datumsformat" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zeitformat</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wählen Sie ein Zeitformat" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="24h">24 Stunden</SelectItem>
                          <SelectItem value="12h">12 Stunden (AM/PM)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zeitzone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wählen Sie eine Zeitzone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                          <SelectItem value="Europe/London">Europe/London</SelectItem>
                          <SelectItem value="America/New_York">America/New_York</SelectItem>
                          <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Behavior Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Verhalten</h3>

                <FormField
                  control={form.control}
                  name="notifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Benachrichtigungen</FormLabel>
                        <FormDescription>Systembenachrichtigungen aktivieren</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="autoSave"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Automatisches Speichern</FormLabel>
                        <FormDescription>Änderungen automatisch speichern</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("autoSave") && (
                  <FormField
                    control={form.control}
                    name="autoSaveInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Speicherintervall (Minuten): {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            min={1}
                            max={60}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="sessionTimeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sitzungs-Timeout (Minuten): {field.value}</FormLabel>
                      <FormControl>
                        <Slider
                          min={5}
                          max={120}
                          step={5}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormDescription>Zeit bis zur automatischen Abmeldung bei Inaktivität</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Advanced Section */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Erweiterte Einstellungen</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="debugMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Debug-Modus</FormLabel>
                          <FormDescription>Erweiterte Protokollierung aktivieren</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="analyticsEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Nutzungsstatistiken</FormLabel>
                          <FormDescription>Anonyme Nutzungsdaten senden</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="maxUploadSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max. Upload-Größe (MB): {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            min={1}
                            max={100}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cacheEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Caching aktivieren</FormLabel>
                          <FormDescription>Verbessert die Leistung durch Zwischenspeicherung</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("cacheEnabled") && (
                    <FormField
                      control={form.control}
                      name="cacheDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cache-Dauer (Minuten): {field.value}</FormLabel>
                          <FormControl>
                            <Slider
                              min={5}
                              max={1440}
                              step={5}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Einstellungen speichern
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
