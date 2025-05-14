"use client";

import AutosaveIndicator from "@/components/autosave-indicator";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { useAutosave } from "@/hooks/use-autosave";
import { ImageIcon, LayoutGrid, List, Settings2, X } from "lucide-react";
import { useCallback, useState } from "react";

interface ProductDisplaySettings {
  general: {
    defaultView: "grid" | "list" | "compact";
    productsPerPage: number;
    showOutOfStock: boolean;
    showPrices: boolean;
    enableQuickView: boolean;
    enableComparisons: boolean;
    enableWishlist: boolean;
  };
  images: {
    quality: "low" | "medium" | "high";
    thumbnailSize: number;
    zoomEnabled: boolean;
    showAlternateImages: boolean;
    lazyLoading: boolean;
    placeholderImage: string;
  };
  sorting: {
    defaultSortBy: "name" | "price" | "popularity" | "newest";
    defaultSortOrder: "asc" | "desc";
    enableUserSorting: boolean;
    enableFiltering: boolean;
    rememberUserPreferences: boolean;
  };
  information: {
    showSKU: boolean;
    showAvailability: boolean;
    showShortDescription: boolean;
    showRatings: boolean;
    showCategories: boolean;
    showBrand: boolean;
    showTags: boolean;
    showAttributes: string[];
  };
}

// Mock-Daten für die Produktanzeige-Einstellungen
const defaultProductDisplaySettings: ProductDisplaySettings = {
  general: {
    defaultView: "grid",
    productsPerPage: 24,
    showOutOfStock: true,
    showPrices: true,
    enableQuickView: true,
    enableComparisons: false,
    enableWishlist: true,
  },
  images: {
    quality: "medium",
    thumbnailSize: 200,
    zoomEnabled: true,
    showAlternateImages: true,
    lazyLoading: true,
    placeholderImage: "/placeholder-product.jpg",
  },
  sorting: {
    defaultSortBy: "popularity",
    defaultSortOrder: "desc",
    enableUserSorting: true,
    enableFiltering: true,
    rememberUserPreferences: true,
  },
  information: {
    showSKU: true,
    showAvailability: true,
    showShortDescription: true,
    showRatings: true,
    showCategories: true,
    showBrand: true,
    showTags: false,
    showAttributes: ["color", "size", "material"],
  },
};

export default function ProductDisplaySettingsPage() {
  const [settings, setSettings] = useState<ProductDisplaySettings>(
    defaultProductDisplaySettings
  );
  const [activeTab, setActiveTab] = useState("general");
  const [newAttribute, setNewAttribute] = useState("");

  // Autosave-Funktion
  const { isSaving, lastSaved } = useAutosave({
    data: settings,
    onSave: async (data) => {
      // Hier würde normalerweise ein API-Aufruf stehen
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast({
        title: "Einstellungen gespeichert",
        description:
          "Die Produktanzeige-Einstellungen wurden erfolgreich aktualisiert.",
      });
      return true;
    },
  });

  // Attribut hinzufügen
  const addAttribute = useCallback(() => {
    if (!newAttribute) return;

    if (settings.information.showAttributes.includes(newAttribute)) {
      toast({
        title: "Attribut existiert bereits",
        description: `Das Attribut "${newAttribute}" ist bereits in der Liste vorhanden.`,
        variant: "destructive",
      });
      return;
    }

    setSettings((prev) => ({
      ...prev,
      information: {
        ...prev.information,
        showAttributes: [...prev.information.showAttributes, newAttribute],
      },
    }));
    setNewAttribute("");

    toast({
      title: "Attribut hinzugefügt",
      description: `Das Attribut "${newAttribute}" wurde zur Liste hinzugefügt.`,
    });
  }, [newAttribute, settings.information.showAttributes]);

  // Attribut entfernen
  const removeAttribute = useCallback((attribute: string) => {
    setSettings((prev) => ({
      ...prev,
      information: {
        ...prev.information,
        showAttributes: prev.information.showAttributes.filter(
          (item) => item !== attribute
        ),
      },
    }));

    toast({
      title: "Attribut entfernt",
      description: `Das Attribut "${attribute}" wurde aus der Liste entfernt.`,
    });
  }, []);

  // Vorschau aktualisieren
  const updatePreview = useCallback(() => {
    toast({
      title: "Vorschau aktualisiert",
      description: "Die Produktanzeige-Vorschau wurde aktualisiert.",
    });
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <PageHeader
          heading="Produktanzeige-Einstellungen"
          description="Konfigurieren Sie die Darstellung von Produkten im Shop"
          headerClassName="max-md:text-2xl"
        />
        <div className="flex items-center gap-2">
          <AutosaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
          <Button onClick={updatePreview} variant="outline">
            <ImageIcon className="mr-2 h-4 w-4" />
            Vorschau
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto justify-center md:justify-start w-fit mb-6">
          <TabsTrigger value="general">
            <Settings2 className="mr-2 h-4 w-4" />
            Allgemein
          </TabsTrigger>
          <TabsTrigger value="images">
            <ImageIcon className="mr-2 h-4 w-4" />
            Bilder
          </TabsTrigger>
          <TabsTrigger value="sorting">
            <LayoutGrid className="mr-2 h-4 w-4" />
            Sortierung
          </TabsTrigger>
          <TabsTrigger value="information">
            <List className="mr-2 h-4 w-4" />
            Informationen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Allgemeine Anzeigeeinstellungen</CardTitle>
              <CardDescription>
                Konfigurieren Sie die grundlegenden Anzeigeoptionen für Produkte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultView">Standardansicht</Label>
                <Select
                  value={settings.general.defaultView}
                  onValueChange={(value: "grid" | "list" | "compact") =>
                    setSettings((prev) => ({
                      ...prev,
                      general: { ...prev.general, defaultView: value },
                    }))
                  }
                >
                  <SelectTrigger id="defaultView">
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Rasteransicht</SelectItem>
                    <SelectItem value="list">Listenansicht</SelectItem>
                    <SelectItem value="compact">Kompakte Ansicht</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="productsPerPage">
                    Produkte pro Seite: {settings.general.productsPerPage}
                  </Label>
                </div>
                <Slider
                  id="productsPerPage"
                  min={12}
                  max={96}
                  step={12}
                  value={[settings.general.productsPerPage]}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      general: { ...prev.general, productsPerPage: value[0] },
                    }))
                  }
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showOutOfStock"
                    checked={settings.general.showOutOfStock}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        general: { ...prev.general, showOutOfStock: checked },
                      }))
                    }
                  />
                  <Label htmlFor="showOutOfStock">
                    Nicht verfügbare Produkte anzeigen
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showPrices"
                    checked={settings.general.showPrices}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        general: { ...prev.general, showPrices: checked },
                      }))
                    }
                  />
                  <Label htmlFor="showPrices">Preise anzeigen</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableQuickView"
                    checked={settings.general.enableQuickView}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        general: { ...prev.general, enableQuickView: checked },
                      }))
                    }
                  />
                  <Label htmlFor="enableQuickView">
                    Schnellansicht aktivieren
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableComparisons"
                    checked={settings.general.enableComparisons}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        general: {
                          ...prev.general,
                          enableComparisons: checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="enableComparisons">
                    Produktvergleich aktivieren
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableWishlist"
                    checked={settings.general.enableWishlist}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        general: { ...prev.general, enableWishlist: checked },
                      }))
                    }
                  />
                  <Label htmlFor="enableWishlist">Wunschliste aktivieren</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="ml-auto"
                onClick={() => {
                  setSettings((prev) => ({
                    ...prev,
                    general: defaultProductDisplaySettings.general,
                  }));
                  toast({ title: "Allgemeine Einstellungen zurückgesetzt" });
                }}
              >
                Zurücksetzen
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bildeinstellungen</CardTitle>
              <CardDescription>
                Konfigurieren Sie die Darstellung von Produktbildern
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageQuality">Bildqualität</Label>
                <Select
                  value={settings.images.quality}
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setSettings((prev) => ({
                      ...prev,
                      images: { ...prev.images, quality: value },
                    }))
                  }
                >
                  <SelectTrigger id="imageQuality">
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      Niedrig (schnellere Ladezeit)
                    </SelectItem>
                    <SelectItem value="medium">Mittel (ausgewogen)</SelectItem>
                    <SelectItem value="high">Hoch (beste Qualität)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="thumbnailSize">
                    Vorschaubildgröße: {settings.images.thumbnailSize}px
                  </Label>
                </div>
                <Slider
                  id="thumbnailSize"
                  min={100}
                  max={400}
                  step={10}
                  value={[settings.images.thumbnailSize]}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      images: { ...prev.images, thumbnailSize: value[0] },
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="placeholderImage">Platzhalter-Bild URL</Label>
                <Input
                  id="placeholderImage"
                  value={settings.images.placeholderImage}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      images: {
                        ...prev.images,
                        placeholderImage: e.target.value,
                      },
                    }))
                  }
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="zoomEnabled"
                    checked={settings.images.zoomEnabled}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        images: { ...prev.images, zoomEnabled: checked },
                      }))
                    }
                  />
                  <Label htmlFor="zoomEnabled">Bildzoom aktivieren</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showAlternateImages"
                    checked={settings.images.showAlternateImages}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        images: {
                          ...prev.images,
                          showAlternateImages: checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="showAlternateImages">
                    Alternative Bilder anzeigen
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="lazyLoading"
                    checked={settings.images.lazyLoading}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        images: { ...prev.images, lazyLoading: checked },
                      }))
                    }
                  />
                  <Label htmlFor="lazyLoading">Lazy Loading aktivieren</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="ml-auto"
                onClick={() => {
                  setSettings((prev) => ({
                    ...prev,
                    images: defaultProductDisplaySettings.images,
                  }));
                  toast({ title: "Bildeinstellungen zurückgesetzt" });
                }}
              >
                Zurücksetzen
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="sorting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sortierung und Filterung</CardTitle>
              <CardDescription>
                Konfigurieren Sie die Sortier- und Filteroptionen für Produkte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultSortBy">Standard-Sortierung nach</Label>
                <Select
                  value={settings.sorting.defaultSortBy}
                  onValueChange={(
                    value: "name" | "price" | "popularity" | "newest"
                  ) =>
                    setSettings((prev) => ({
                      ...prev,
                      sorting: { ...prev.sorting, defaultSortBy: value },
                    }))
                  }
                >
                  <SelectTrigger id="defaultSortBy">
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price">Preis</SelectItem>
                    <SelectItem value="popularity">Beliebtheit</SelectItem>
                    <SelectItem value="newest">Neueste zuerst</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultSortOrder">
                  Standard-Sortierreihenfolge
                </Label>
                <Select
                  value={settings.sorting.defaultSortOrder}
                  onValueChange={(value: "asc" | "desc") =>
                    setSettings((prev) => ({
                      ...prev,
                      sorting: { ...prev.sorting, defaultSortOrder: value },
                    }))
                  }
                >
                  <SelectTrigger id="defaultSortOrder">
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Aufsteigend</SelectItem>
                    <SelectItem value="desc">Absteigend</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableUserSorting"
                    checked={settings.sorting.enableUserSorting}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        sorting: {
                          ...prev.sorting,
                          enableUserSorting: checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="enableUserSorting">
                    Benutzerdefinierte Sortierung erlauben
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableFiltering"
                    checked={settings.sorting.enableFiltering}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        sorting: { ...prev.sorting, enableFiltering: checked },
                      }))
                    }
                  />
                  <Label htmlFor="enableFiltering">Filterung aktivieren</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="rememberUserPreferences"
                    checked={settings.sorting.rememberUserPreferences}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        sorting: {
                          ...prev.sorting,
                          rememberUserPreferences: checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="rememberUserPreferences">
                    Benutzereinstellungen speichern
                  </Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="ml-auto"
                onClick={() => {
                  setSettings((prev) => ({
                    ...prev,
                    sorting: defaultProductDisplaySettings.sorting,
                  }));
                  toast({ title: "Sortierungseinstellungen zurückgesetzt" });
                }}
              >
                Zurücksetzen
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="information" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Produktinformationen</CardTitle>
              <CardDescription>
                Konfigurieren Sie, welche Produktinformationen angezeigt werden
                sollen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showSKU"
                    checked={settings.information.showSKU}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        information: { ...prev.information, showSKU: checked },
                      }))
                    }
                  />
                  <Label htmlFor="showSKU">Artikelnummer anzeigen</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showAvailability"
                    checked={settings.information.showAvailability}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        information: {
                          ...prev.information,
                          showAvailability: checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="showAvailability">
                    Verfügbarkeit anzeigen
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showShortDescription"
                    checked={settings.information.showShortDescription}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        information: {
                          ...prev.information,
                          showShortDescription: checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="showShortDescription">
                    Kurzbeschreibung anzeigen
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showRatings"
                    checked={settings.information.showRatings}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        information: {
                          ...prev.information,
                          showRatings: checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="showRatings">Bewertungen anzeigen</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showCategories"
                    checked={settings.information.showCategories}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        information: {
                          ...prev.information,
                          showCategories: checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="showCategories">Kategorien anzeigen</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showBrand"
                    checked={settings.information.showBrand}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        information: {
                          ...prev.information,
                          showBrand: checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="showBrand">Marke anzeigen</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showTags"
                    checked={settings.information.showTags}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        information: { ...prev.information, showTags: checked },
                      }))
                    }
                  />
                  <Label htmlFor="showTags">Tags anzeigen</Label>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Anzuzeigende Attribute</Label>
                <div className="flex flex-wrap gap-2">
                  {settings.information.showAttributes.map((attribute) => (
                    <Badge
                      key={attribute}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {attribute}
                      <button
                        onClick={() => removeAttribute(attribute)}
                        className="ml-1 rounded-full hover:bg-muted p-0.5"
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Entfernen</span>
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Input
                    placeholder="Neues Attribut hinzufügen"
                    value={newAttribute}
                    onChange={(e) => setNewAttribute(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addAttribute();
                      }
                    }}
                  />
                  <Button onClick={addAttribute} type="button">
                    Hinzufügen
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-1 justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setSettings((prev) => ({
                    ...prev,
                    information: defaultProductDisplaySettings.information,
                  }));
                  toast({ title: "Informationseinstellungen zurückgesetzt" });
                }}
              >
                Zurücksetzen
              </Button>

              <Button
                onClick={() => {
                  toast({
                    title: "Einstellungen gespeichert",
                    description:
                      "Alle Produktanzeige-Einstellungen wurden erfolgreich gespeichert.",
                  });
                }}
              >
                Alle Einstellungen speichern
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
