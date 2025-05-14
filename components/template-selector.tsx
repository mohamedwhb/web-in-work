"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { documentTemplates, type DocumentTemplate } from "@/lib/templates";
import { Check, Layout, Palette, Type } from "lucide-react";
import { useState } from "react";

interface TemplateSelectorProps {
  selectedTemplate: DocumentTemplate;
  onSelectTemplate: (template: DocumentTemplate) => void;
  onClose: () => void;
}

export default function TemplateSelector({
  selectedTemplate,
  onSelectTemplate,
  onClose,
}: TemplateSelectorProps) {
  const [currentTemplate, setCurrentTemplate] =
    useState<DocumentTemplate>(selectedTemplate);

  const handleSelectTemplate = (templateId: string) => {
    const template = documentTemplates.find((t) => t.id === templateId);
    if (template) {
      setCurrentTemplate(template);
    }
  };

  const handleSave = () => {
    onSelectTemplate(currentTemplate);
    onClose();
  };

  const updateTemplateOption = (key: string, value: any) => {
    setCurrentTemplate((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="design">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="design">
            <Layout className="h-4 w-4 mr-2" />
            Design
          </TabsTrigger>
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Farben
          </TabsTrigger>
          <TabsTrigger value="options">
            <Type className="h-4 w-4 mr-2" />
            Optionen
          </TabsTrigger>
        </TabsList>
        <div className="overflow-y-auto max-h-[50dvh]">
          <TabsContent value="design" className="space-y-4">
            <RadioGroup
              value={currentTemplate.id}
              onValueChange={handleSelectTemplate}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {documentTemplates.map((template) => (
                <div key={template.id} className="relative">
                  <RadioGroupItem
                    value={template.id}
                    id={template.id}
                    className="sr-only"
                  />
                  <Label htmlFor={template.id} className="cursor-pointer block">
                    <Card
                      className={`overflow-hidden ${
                        currentTemplate.id === template.id
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                    >
                      <div className="h-24 bg-muted flex items-center justify-center">
                        <img
                          src={template.preview || "/placeholder.svg"}
                          alt={template.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <CardContent className="p-3">
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {template.description}
                        </div>
                      </CardContent>
                    </Card>
                    {currentTemplate.id === template.id && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </TabsContent>

          <TabsContent value="colors" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primärfarbe</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="primaryColor"
                    value={currentTemplate.colors.primary}
                    onChange={(e) =>
                      setCurrentTemplate({
                        ...currentTemplate,
                        colors: {
                          ...currentTemplate.colors,
                          primary: e.target.value,
                        },
                      })
                    }
                    className="w-10 h-10 rounded border p-1"
                  />
                  <span className="text-sm">
                    {currentTemplate.colors.primary}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Sekundärfarbe</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="secondaryColor"
                    value={currentTemplate.colors.secondary}
                    onChange={(e) =>
                      setCurrentTemplate({
                        ...currentTemplate,
                        colors: {
                          ...currentTemplate.colors,
                          secondary: e.target.value,
                        },
                      })
                    }
                    className="w-10 h-10 rounded border p-1"
                  />
                  <span className="text-sm">
                    {currentTemplate.colors.secondary}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accentColor">Akzentfarbe</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="accentColor"
                    value={currentTemplate.colors.accent}
                    onChange={(e) =>
                      setCurrentTemplate({
                        ...currentTemplate,
                        colors: {
                          ...currentTemplate.colors,
                          accent: e.target.value,
                        },
                      })
                    }
                    className="w-10 h-10 rounded border p-1"
                  />
                  <span className="text-sm">
                    {currentTemplate.colors.accent}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="textColor">Textfarbe</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="textColor"
                    value={currentTemplate.colors.text}
                    onChange={(e) =>
                      setCurrentTemplate({
                        ...currentTemplate,
                        colors: {
                          ...currentTemplate.colors,
                          text: e.target.value,
                        },
                      })
                    }
                    className="w-10 h-10 rounded border p-1"
                  />
                  <span className="text-sm">{currentTemplate.colors.text}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-md mt-4">
              <h3 className="font-medium mb-2">Vorschau</h3>
              <div className="flex flex-col gap-2">
                <div
                  className="h-8 rounded"
                  style={{ backgroundColor: currentTemplate.colors.primary }}
                ></div>
                <div
                  className="h-8 rounded"
                  style={{ backgroundColor: currentTemplate.colors.secondary }}
                ></div>
                <div className="flex gap-2">
                  <div
                    className="h-8 flex-1 rounded"
                    style={{ backgroundColor: currentTemplate.colors.accent }}
                  ></div>
                  <div
                    className="h-8 flex-1 rounded flex items-center justify-center"
                    style={{
                      backgroundColor: currentTemplate.colors.text,
                      color: "#ffffff",
                    }}
                  >
                    <span className="text-xs">Text</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="options" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showLogo" className="font-medium">
                    Logo anzeigen
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Firmenlogo im Dokument anzeigen
                  </p>
                </div>
                <Switch
                  id="showLogo"
                  checked={currentTemplate.showLogo}
                  onCheckedChange={(checked) =>
                    updateTemplateOption("showLogo", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showSignature" className="font-medium">
                    Unterschrift anzeigen
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Unterschrift im Dokument anzeigen
                  </p>
                </div>
                <Switch
                  id="showSignature"
                  checked={currentTemplate.showSignature}
                  onCheckedChange={(checked) =>
                    updateTemplateOption("showSignature", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showFooter" className="font-medium">
                    Fußzeile anzeigen
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Fußzeile mit Firmeninformationen anzeigen
                  </p>
                </div>
                <Switch
                  id="showFooter"
                  checked={currentTemplate.showFooter}
                  onCheckedChange={(checked) =>
                    updateTemplateOption("showFooter", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showWatermark" className="font-medium">
                    Wasserzeichen anzeigen
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Wasserzeichen im Hintergrund anzeigen
                  </p>
                </div>
                <Switch
                  id="showWatermark"
                  checked={currentTemplate.showWatermark}
                  onCheckedChange={(checked) =>
                    updateTemplateOption("showWatermark", checked)
                  }
                />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Abbrechen
        </Button>
        <Button onClick={handleSave}>
          <Check className="h-4 w-4 mr-2" />
          Übernehmen
        </Button>
      </div>
    </div>
  );
}
