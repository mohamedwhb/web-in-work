"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";

export default function RegionalSettingsPage() {
  const [language, setLanguage] = useState("de");
  const [currency, setCurrency] = useState("EUR");
  const [dateFormat, setDateFormat] = useState("dd.MM.yyyy");
  const [timeFormat, setTimeFormat] = useState("24h");
  const [timezone, setTimezone] = useState("Europe/Berlin");
  const [numberFormat, setNumberFormat] = useState("de-DE");
  const [measurementSystem, setMeasurementSystem] = useState("metric");
  const [firstDayOfWeek, setFirstDayOfWeek] = useState("monday");
  const [autoDetectRegion, setAutoDetectRegion] = useState(true);

  const handleSaveSettings = () => {
    toast({
      title: "Einstellungen gespeichert",
      description:
        "Die regionalen Einstellungen wurden erfolgreich gespeichert.",
    });
  };

  return (
    <div className="max-w-7xl px-2 lg:px-0 mx-auto py-6 space-y-6">
      <PageHeader
        heading="Regionale Einstellungen"
        description="Konfigurieren Sie Sprache, Währung und Formate für Ihr System"
      />

      <Tabs defaultValue="language-currency">
        <TabsList className="flex flex-wrap h-auto justify-center md:justify-start w-full">
          <TabsTrigger value="language-currency">Sprache & Währung</TabsTrigger>
          <TabsTrigger value="date-time">Datum & Zeit</TabsTrigger>
          <TabsTrigger value="formats">Formate</TabsTrigger>
        </TabsList>

        <TabsContent value="language-currency" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sprache und Währung</CardTitle>
              <CardDescription>
                Stellen Sie die Standardsprache und -währung für Ihr System ein.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language">Systemsprache</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Wählen Sie eine Sprache" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="en">Englisch</SelectItem>
                    <SelectItem value="fr">Französisch</SelectItem>
                    <SelectItem value="it">Italienisch</SelectItem>
                    <SelectItem value="es">Spanisch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Standardwährung</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Wählen Sie eine Währung" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                    <SelectItem value="USD">US-Dollar ($)</SelectItem>
                    <SelectItem value="GBP">Britisches Pfund (£)</SelectItem>
                    <SelectItem value="CHF">Schweizer Franken (CHF)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-detect">
                    Region automatisch erkennen
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Erkennt automatisch die Region des Benutzers und passt die
                    Einstellungen an
                  </p>
                </div>
                <Switch
                  id="auto-detect"
                  checked={autoDetectRegion}
                  onCheckedChange={setAutoDetectRegion}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="date-time" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Datum und Zeit</CardTitle>
              <CardDescription>
                Konfigurieren Sie, wie Datum und Zeit im System angezeigt
                werden.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="date-format">Datumsformat</Label>
                <Select value={dateFormat} onValueChange={setDateFormat}>
                  <SelectTrigger id="date-format">
                    <SelectValue placeholder="Wählen Sie ein Datumsformat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd.MM.yyyy">
                      31.12.2023 (DD.MM.YYYY)
                    </SelectItem>
                    <SelectItem value="MM/dd/yyyy">
                      12/31/2023 (MM/DD/YYYY)
                    </SelectItem>
                    <SelectItem value="yyyy-MM-dd">
                      2023-12-31 (YYYY-MM-DD)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-format">Zeitformat</Label>
                <RadioGroup value={timeFormat} onValueChange={setTimeFormat}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="24h" id="24h" />
                    <Label htmlFor="24h">24-Stunden-Format (14:30)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="12h" id="12h" />
                    <Label htmlFor="12h">12-Stunden-Format (2:30 PM)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Zeitzone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Wählen Sie eine Zeitzone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Berlin">
                      Berlin (GMT+1/GMT+2)
                    </SelectItem>
                    <SelectItem value="Europe/London">
                      London (GMT+0/GMT+1)
                    </SelectItem>
                    <SelectItem value="America/New_York">
                      New York (GMT-5/GMT-4)
                    </SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokio (GMT+9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="first-day">Erster Tag der Woche</Label>
                <RadioGroup
                  value={firstDayOfWeek}
                  onValueChange={setFirstDayOfWeek}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monday" id="monday" />
                    <Label htmlFor="monday">Montag</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sunday" id="sunday" />
                    <Label htmlFor="sunday">Sonntag</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formats" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Formate</CardTitle>
              <CardDescription>
                Konfigurieren Sie Zahlen- und Maßeinheiten für Ihr System.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="number-format">Zahlenformat</Label>
                <Select value={numberFormat} onValueChange={setNumberFormat}>
                  <SelectTrigger id="number-format">
                    <SelectValue placeholder="Wählen Sie ein Zahlenformat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de-DE">1.234,56 (Deutsch)</SelectItem>
                    <SelectItem value="en-US">1,234.56 (Englisch)</SelectItem>
                    <SelectItem value="fr-FR">
                      1 234,56 (Französisch)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Bestimmt, wie Zahlen formatiert werden (Tausendertrennzeichen
                  und Dezimaltrennzeichen)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="measurement-system">Maßsystem</Label>
                <RadioGroup
                  value={measurementSystem}
                  onValueChange={setMeasurementSystem}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="metric" id="metric" />
                    <Label htmlFor="metric">Metrisch (kg, cm, km)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="imperial" id="imperial" />
                    <Label htmlFor="imperial">Imperial (lb, in, mi)</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>Einstellungen speichern</Button>
      </div>
    </div>
  );
}
