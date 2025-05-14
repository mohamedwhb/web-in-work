"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import {
  Barcode,
  Bell,
  ClipboardList,
  Edit,
  Plus,
  Save,
  Trash2,
  Warehouse,
} from "lucide-react";
import { useState } from "react";

// Typen für Lagerorte
type StorageLocation = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
};

export default function InventorySettingsPage() {
  // State für Lagerorte
  const [locations, setLocations] = useState<StorageLocation[]>([
    {
      id: "loc1",
      name: "Hauptlager",
      description: "Hauptlagerbereich",
      isActive: true,
    },
    {
      id: "loc2",
      name: "Kühlraum",
      description: "Gekühlter Lagerbereich",
      isActive: true,
    },
    {
      id: "loc3",
      name: "Außenlager",
      description: "Zusätzlicher Lagerbereich",
      isActive: false,
    },
  ]);

  // State für Lagerort-Dialog
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [currentLocation, setCurrentLocation] =
    useState<StorageLocation | null>(null);
  const [locationForm, setLocationForm] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  // State für Benachrichtigungseinstellungen
  const [notificationSettings, setNotificationSettings] = useState({
    lowStockNotifications: true,
    lowStockThreshold: 15, // Prozent
    outOfStockNotifications: true,
    expiryDateNotifications: true,
    expiryDateThreshold: 14, // Tage
  });

  // State für Barcode-Einstellungen
  const [barcodeSettings, setBarcodeSettings] = useState({
    defaultBarcodeType: "ean13",
    autogenerateBarcodes: true,
    printFormat: "a4",
    includePrice: true,
    includeName: true,
  });

  // State für allgemeine Einstellungen
  const [generalSettings, setGeneralSettings] = useState({
    trackInventory: true,
    allowNegativeStock: false,
    autoUpdateStock: true,
    defaultUnit: "stück",
    roundDecimalPlaces: 2,
  });

  // Lagerort-Dialog öffnen für Bearbeitung
  const openEditLocationDialog = (location: StorageLocation) => {
    setCurrentLocation(location);
    setLocationForm({
      name: location.name,
      description: location.description,
      isActive: location.isActive,
    });
    setIsLocationDialogOpen(true);
  };

  // Lagerort-Dialog öffnen für Neuanlage
  const openNewLocationDialog = () => {
    setCurrentLocation(null);
    setLocationForm({
      name: "",
      description: "",
      isActive: true,
    });
    setIsLocationDialogOpen(true);
  };

  // Lagerort speichern
  const saveLocation = () => {
    if (!locationForm.name.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Namen für den Lagerort ein.",
        variant: "destructive",
      });
      return;
    }

    if (currentLocation) {
      // Bestehenden Lagerort aktualisieren
      setLocations(
        locations.map((loc) =>
          loc.id === currentLocation.id ? { ...loc, ...locationForm } : loc
        )
      );
      toast({
        title: "Lagerort aktualisiert",
        description: `Der Lagerort "${locationForm.name}" wurde erfolgreich aktualisiert.`,
      });
    } else {
      // Neuen Lagerort erstellen
      const newLocation: StorageLocation = {
        id: `loc${Date.now()}`,
        ...locationForm,
      };
      setLocations([...locations, newLocation]);
      toast({
        title: "Lagerort erstellt",
        description: `Der Lagerort "${locationForm.name}" wurde erfolgreich erstellt.`,
      });
    }

    setIsLocationDialogOpen(false);
  };

  // Lagerort löschen
  const deleteLocation = (id: string) => {
    setLocations(locations.filter((loc) => loc.id !== id));
    toast({
      title: "Lagerort gelöscht",
      description: "Der Lagerort wurde erfolgreich gelöscht.",
    });
  };

  // Einstellungen speichern
  const saveSettings = () => {
    toast({
      title: "Einstellungen gespeichert",
      description: "Ihre Lagereinstellungen wurden erfolgreich gespeichert.",
    });
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Lagereinstellungen</h1>

      <Tabs defaultValue="locations" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <Warehouse className="h-4 w-4" />
            <span className="hidden sm:inline">Lagerorte</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Benachrichtigungen</span>
          </TabsTrigger>
          <TabsTrigger value="barcodes" className="flex items-center gap-2">
            <Barcode className="h-4 w-4" />
            <span className="hidden sm:inline">Barcodes & Etiketten</span>
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Allgemein</span>
          </TabsTrigger>
        </TabsList>

        {/* Lagerorte Tab */}
        <TabsContent value="locations">
          <Card>
            <CardHeader>
              <CardTitle>Lagerorte verwalten</CardTitle>
              <CardDescription>
                Definieren Sie verschiedene Lagerorte für Ihre Produkte und
                verwalten Sie deren Eigenschaften.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button onClick={openNewLocationDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Neuen Lagerort hinzufügen
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Beschreibung</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">
                        {location.name}
                      </TableCell>
                      <TableCell>{location.description}</TableCell>
                      <TableCell>
                        {location.isActive ? (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Aktiv
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            Inaktiv
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditLocationDialog(location)}
                          className="mr-2"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Bearbeiten</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteLocation(location.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Löschen</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benachrichtigungen Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Benachrichtigungseinstellungen
              </CardTitle>
              <CardDescription>
                Konfigurieren Sie, wann und wie Sie über Lagerbestandsänderungen
                benachrichtigt werden möchten.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="lowStockNotifications"
                      className="text-base"
                    >
                      Benachrichtigungen bei niedrigem Bestand
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Erhalten Sie Benachrichtigungen, wenn der Bestand eines
                      Produkts unter den Schwellenwert fällt.
                    </p>
                  </div>
                  <Switch
                    id="lowStockNotifications"
                    checked={notificationSettings.lowStockNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        lowStockNotifications: checked,
                      })
                    }
                  />
                </div>

                {notificationSettings.lowStockNotifications && (
                  <div className="ml-6 border-l-2 pl-6 border-muted">
                    <Label htmlFor="lowStockThreshold">
                      Schwellenwert für niedrigen Bestand (%)
                    </Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Slider
                        id="lowStockThreshold"
                        value={[notificationSettings.lowStockThreshold]}
                        min={5}
                        max={50}
                        step={5}
                        onValueChange={(value) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            lowStockThreshold: value[0],
                          })
                        }
                        className="flex-1"
                      />
                      <span className="w-12 text-center">
                        {notificationSettings.lowStockThreshold}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Benachrichtigung, wenn der Bestand unter{" "}
                      {notificationSettings.lowStockThreshold}% des
                      Mindestbestands fällt.
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label
                    htmlFor="outOfStockNotifications"
                    className="text-base"
                  >
                    Benachrichtigungen bei Nullbestand
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Erhalten Sie Benachrichtigungen, wenn ein Produkt nicht mehr
                    auf Lager ist.
                  </p>
                </div>
                <Switch
                  id="outOfStockNotifications"
                  checked={notificationSettings.outOfStockNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      outOfStockNotifications: checked,
                    })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="expiryDateNotifications"
                      className="text-base"
                    >
                      Benachrichtigungen bei Ablaufdatum
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Erhalten Sie Benachrichtigungen, wenn Produkte kurz vor
                      dem Ablaufdatum stehen.
                    </p>
                  </div>
                  <Switch
                    id="expiryDateNotifications"
                    checked={notificationSettings.expiryDateNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        expiryDateNotifications: checked,
                      })
                    }
                  />
                </div>

                {notificationSettings.expiryDateNotifications && (
                  <div className="ml-6 border-l-2 pl-6 border-muted">
                    <Label htmlFor="expiryDateThreshold">
                      Tage vor Ablaufdatum
                    </Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Slider
                        id="expiryDateThreshold"
                        value={[notificationSettings.expiryDateThreshold]}
                        min={1}
                        max={30}
                        step={1}
                        onValueChange={(value) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            expiryDateThreshold: value[0],
                          })
                        }
                        className="flex-1"
                      />
                      <span className="w-12 text-center">
                        {notificationSettings.expiryDateThreshold} Tage
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Benachrichtigung, wenn Produkte in{" "}
                      {notificationSettings.expiryDateThreshold} Tagen ablaufen.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Einstellungen speichern
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Barcodes & Etiketten Tab */}
        <TabsContent value="barcodes">
          <Card>
            <CardHeader>
              <CardTitle>Barcode- und Etiketteneinstellungen</CardTitle>
              <CardDescription>
                Konfigurieren Sie, wie Barcodes generiert und Etiketten gedruckt
                werden sollen.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="defaultBarcodeType">
                      Standard-Barcode-Typ
                    </Label>
                    <Select
                      value={barcodeSettings.defaultBarcodeType}
                      onValueChange={(value) =>
                        setBarcodeSettings({
                          ...barcodeSettings,
                          defaultBarcodeType: value,
                        })
                      }
                    >
                      <SelectTrigger id="defaultBarcodeType" className="mt-1">
                        <SelectValue placeholder="Barcode-Typ auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ean13">EAN-13</SelectItem>
                        <SelectItem value="ean8">EAN-8</SelectItem>
                        <SelectItem value="code128">Code 128</SelectItem>
                        <SelectItem value="qrcode">QR-Code</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      Dieser Barcode-Typ wird für neue Produkte verwendet.
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label
                        htmlFor="autogenerateBarcodes"
                        className="text-base"
                      >
                        Barcodes automatisch generieren
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Automatisch Barcodes für neue Produkte generieren.
                      </p>
                    </div>
                    <Switch
                      id="autogenerateBarcodes"
                      checked={barcodeSettings.autogenerateBarcodes}
                      onCheckedChange={(checked) =>
                        setBarcodeSettings({
                          ...barcodeSettings,
                          autogenerateBarcodes: checked,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="printFormat">
                      Druckformat für Etiketten
                    </Label>
                    <Select
                      value={barcodeSettings.printFormat}
                      onValueChange={(value) =>
                        setBarcodeSettings({
                          ...barcodeSettings,
                          printFormat: value,
                        })
                      }
                    >
                      <SelectTrigger id="printFormat" className="mt-1">
                        <SelectValue placeholder="Druckformat auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a4">A4 (21 pro Blatt)</SelectItem>
                        <SelectItem value="a5">A5 (10 pro Blatt)</SelectItem>
                        <SelectItem value="roll">
                          Etikettenrolle (einzeln)
                        </SelectItem>
                        <SelectItem value="custom">
                          Benutzerdefiniert
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      Dieses Format wird für den Etikettendruck verwendet.
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="includePrice" className="text-base">
                        Preis auf Etikett anzeigen
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Den Produktpreis auf dem Etikett anzeigen.
                      </p>
                    </div>
                    <Switch
                      id="includePrice"
                      checked={barcodeSettings.includePrice}
                      onCheckedChange={(checked) =>
                        setBarcodeSettings({
                          ...barcodeSettings,
                          includePrice: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="includeName" className="text-base">
                        Produktname auf Etikett anzeigen
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Den Produktnamen auf dem Etikett anzeigen.
                      </p>
                    </div>
                    <Switch
                      id="includeName"
                      checked={barcodeSettings.includeName}
                      onCheckedChange={(checked) =>
                        setBarcodeSettings({
                          ...barcodeSettings,
                          includeName: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Etikettenvorschau</h3>
                <div className="border rounded-md p-4 flex justify-center">
                  <div className="bg-white border rounded-md p-4 w-64 flex flex-col items-center">
                    <div className="text-sm font-medium mb-2">
                      {barcodeSettings.includeName && "Beispielprodukt"}
                    </div>
                    <div className="bg-gray-200 h-16 w-full flex items-center justify-center text-xs text-gray-500">
                      [Barcode:{" "}
                      {barcodeSettings.defaultBarcodeType.toUpperCase()}]
                    </div>
                    <div className="mt-2 text-sm">
                      {barcodeSettings.includePrice && "2,99 €"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Einstellungen speichern
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Allgemeine Einstellungen Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Allgemeine Lagereinstellungen</CardTitle>
              <CardDescription>
                Konfigurieren Sie grundlegende Einstellungen für die
                Bestandsführung.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="trackInventory" className="text-base">
                    Bestandsführung aktivieren
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Aktivieren Sie die Bestandsführung für alle Produkte.
                  </p>
                </div>
                <Switch
                  id="trackInventory"
                  checked={generalSettings.trackInventory}
                  onCheckedChange={(checked) =>
                    setGeneralSettings({
                      ...generalSettings,
                      trackInventory: checked,
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowNegativeStock" className="text-base">
                    Negativen Bestand erlauben
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Erlauben Sie, dass der Bestand unter Null fallen kann.
                  </p>
                </div>
                <Switch
                  id="allowNegativeStock"
                  checked={generalSettings.allowNegativeStock}
                  onCheckedChange={(checked) =>
                    setGeneralSettings({
                      ...generalSettings,
                      allowNegativeStock: checked,
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoUpdateStock" className="text-base">
                    Bestand automatisch aktualisieren
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Bestand automatisch aktualisieren, wenn Verkäufe oder
                    Einkäufe getätigt werden.
                  </p>
                </div>
                <Switch
                  id="autoUpdateStock"
                  checked={generalSettings.autoUpdateStock}
                  onCheckedChange={(checked) =>
                    setGeneralSettings({
                      ...generalSettings,
                      autoUpdateStock: checked,
                    })
                  }
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="defaultUnit">Standard-Einheit</Label>
                  <Select
                    value={generalSettings.defaultUnit}
                    onValueChange={(value) =>
                      setGeneralSettings({
                        ...generalSettings,
                        defaultUnit: value,
                      })
                    }
                  >
                    <SelectTrigger id="defaultUnit" className="mt-1">
                      <SelectValue placeholder="Einheit auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stück">Stück</SelectItem>
                      <SelectItem value="kg">Kilogramm (kg)</SelectItem>
                      <SelectItem value="g">Gramm (g)</SelectItem>
                      <SelectItem value="l">Liter (l)</SelectItem>
                      <SelectItem value="ml">Milliliter (ml)</SelectItem>
                      <SelectItem value="m">Meter (m)</SelectItem>
                      <SelectItem value="cm">Zentimeter (cm)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Diese Einheit wird für neue Produkte verwendet.
                  </p>
                </div>

                <div>
                  <Label htmlFor="roundDecimalPlaces">
                    Dezimalstellen runden
                  </Label>
                  <Select
                    value={generalSettings.roundDecimalPlaces.toString()}
                    onValueChange={(value) =>
                      setGeneralSettings({
                        ...generalSettings,
                        roundDecimalPlaces: Number.parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger id="roundDecimalPlaces" className="mt-1">
                      <SelectValue placeholder="Dezimalstellen auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 (Ganze Zahlen)</SelectItem>
                      <SelectItem value="1">1 Dezimalstelle</SelectItem>
                      <SelectItem value="2">2 Dezimalstellen</SelectItem>
                      <SelectItem value="3">3 Dezimalstellen</SelectItem>
                      <SelectItem value="4">4 Dezimalstellen</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Auf diese Anzahl von Dezimalstellen wird der Bestand
                    gerundet.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Einstellungen speichern
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog für Lagerorte */}
      <Dialog
        open={isLocationDialogOpen}
        onOpenChange={setIsLocationDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentLocation
                ? "Lagerort bearbeiten"
                : "Neuen Lagerort erstellen"}
            </DialogTitle>
            <DialogDescription>
              {currentLocation
                ? "Bearbeiten Sie die Details des Lagerorts."
                : "Fügen Sie einen neuen Lagerort hinzu, um Ihre Produkte zu organisieren."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={locationForm.name}
                onChange={(e) =>
                  setLocationForm({ ...locationForm, name: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Input
                id="description"
                value={locationForm.description}
                onChange={(e) =>
                  setLocationForm({
                    ...locationForm,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={locationForm.isActive}
                onCheckedChange={(checked) =>
                  setLocationForm({ ...locationForm, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Aktiv</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLocationDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button onClick={saveLocation}>
              {currentLocation ? "Aktualisieren" : "Erstellen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
