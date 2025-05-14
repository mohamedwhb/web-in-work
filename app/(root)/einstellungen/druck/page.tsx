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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";

export default function PrintSettingsPage() {
  const [paperSize, setPaperSize] = useState("a4");
  const [orientation, setOrientation] = useState("portrait");
  const [margins, setMargins] = useState({
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  });
  const [headerHeight, setHeaderHeight] = useState(40);
  const [footerHeight, setFooterHeight] = useState(30);
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [defaultPrinter, setDefaultPrinter] = useState("");
  const [colorMode, setColorMode] = useState("color");
  const [duplexPrinting, setDuplexPrinting] = useState(false);

  const handleSaveSettings = () => {
    toast({
      title: "Einstellungen gespeichert",
      description: "Die Druckeinstellungen wurden erfolgreich gespeichert.",
    });
  };

  return (
    <div className="max-w-7xl px-2 lg:px-0 mx-auto py-6 space-y-6">
      <PageHeader
        heading="Druckeinstellungen"
        description="Konfigurieren Sie, wie Ihre Dokumente gedruckt werden"
      />

      <Tabs defaultValue="page-setup">
        <TabsList className="flex flex-wrap h-auto justify-center md:justify-start w-full">
          <TabsTrigger value="page-setup">Seiteneinrichtung</TabsTrigger>
          <TabsTrigger value="headers-footers">Kopf- und Fußzeilen</TabsTrigger>
          <TabsTrigger value="printer-settings">
            Druckereinstellungen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="page-setup" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Seiteneinrichtung</CardTitle>
              <CardDescription>
                Konfigurieren Sie das Papierformat, die Ausrichtung und die
                Ränder.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="paper-size">Papierformat</Label>
                <Select value={paperSize} onValueChange={setPaperSize}>
                  <SelectTrigger id="paper-size">
                    <SelectValue placeholder="Wählen Sie ein Papierformat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                    <SelectItem value="a5">A5 (148 × 210 mm)</SelectItem>
                    <SelectItem value="letter">Letter (8.5 × 11 in)</SelectItem>
                    <SelectItem value="legal">Legal (8.5 × 14 in)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orientation">Ausrichtung</Label>
                <RadioGroup value={orientation} onValueChange={setOrientation}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="portrait" id="portrait" />
                    <Label htmlFor="portrait">Hochformat</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="landscape" id="landscape" />
                    <Label htmlFor="landscape">Querformat</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label>Ränder (mm)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="margin-top">Oben</Label>
                    <Input
                      id="margin-top"
                      type="number"
                      min="0"
                      max="100"
                      value={margins.top}
                      onChange={(e) =>
                        setMargins({
                          ...margins,
                          top: Number.parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="margin-right">Rechts</Label>
                    <Input
                      id="margin-right"
                      type="number"
                      min="0"
                      max="100"
                      value={margins.right}
                      onChange={(e) =>
                        setMargins({
                          ...margins,
                          right: Number.parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="margin-bottom">Unten</Label>
                    <Input
                      id="margin-bottom"
                      type="number"
                      min="0"
                      max="100"
                      value={margins.bottom}
                      onChange={(e) =>
                        setMargins({
                          ...margins,
                          bottom: Number.parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="margin-left">Links</Label>
                    <Input
                      id="margin-left"
                      type="number"
                      min="0"
                      max="100"
                      value={margins.left}
                      onChange={(e) =>
                        setMargins({
                          ...margins,
                          left: Number.parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="headers-footers" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Kopf- und Fußzeilen</CardTitle>
              <CardDescription>
                Konfigurieren Sie die Kopf- und Fußzeilen Ihrer Dokumente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="header-height">Kopfzeilenhöhe (mm)</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    id="header-height"
                    min={0}
                    max={100}
                    step={1}
                    value={[headerHeight]}
                    onValueChange={(value) => setHeaderHeight(value[0])}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">{headerHeight}</span>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="footer-height">Fußzeilenhöhe (mm)</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    id="footer-height"
                    min={0}
                    max={100}
                    step={1}
                    value={[footerHeight]}
                    onValueChange={(value) => setFooterHeight(value[0])}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">{footerHeight}</span>
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="show-page-numbers">
                    Seitenzahlen anzeigen
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Zeigt Seitenzahlen in der Fußzeile an (z.B. Seite 1 von 5)
                  </p>
                </div>
                <Switch
                  id="show-page-numbers"
                  checked={showPageNumbers}
                  onCheckedChange={setShowPageNumbers}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="show-date">Datum anzeigen</Label>
                  <p className="text-sm text-muted-foreground">
                    Zeigt das aktuelle Datum in der Kopfzeile an
                  </p>
                </div>
                <Switch
                  id="show-date"
                  checked={showDate}
                  onCheckedChange={setShowDate}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="printer-settings" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Druckereinstellungen</CardTitle>
              <CardDescription>
                Konfigurieren Sie Ihren Standarddrucker und Druckoptionen.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="default-printer">Standarddrucker</Label>
                <Select
                  value={defaultPrinter}
                  onValueChange={setDefaultPrinter}
                >
                  <SelectTrigger id="default-printer">
                    <SelectValue placeholder="Wählen Sie einen Drucker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system_default">
                      Systemstandard
                    </SelectItem>
                    <SelectItem value="printer1">HP LaserJet Pro</SelectItem>
                    <SelectItem value="printer2">
                      Brother MFC-L2710DW
                    </SelectItem>
                    <SelectItem value="printer3">
                      Epson WorkForce Pro
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color-mode">Farbmodus</Label>
                <RadioGroup value={colorMode} onValueChange={setColorMode}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="color" id="color" />
                    <Label htmlFor="color">Farbe</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="grayscale" id="grayscale" />
                    <Label htmlFor="grayscale">Graustufen</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="blackwhite" id="blackwhite" />
                    <Label htmlFor="blackwhite">Schwarz-Weiß</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="duplex-printing">Beidseitiger Druck</Label>
                  <p className="text-sm text-muted-foreground">
                    Druckt automatisch auf beiden Seiten des Papiers
                  </p>
                </div>
                <Switch
                  id="duplex-printing"
                  checked={duplexPrinting}
                  onCheckedChange={setDuplexPrinting}
                />
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
