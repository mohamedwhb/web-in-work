"use client";

import TemplateSelector from "@/components/template-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  documentTemplates,
  getDefaultTemplate,
  type DocumentTemplate,
} from "@/lib/templates";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function VorlagenPage() {
  const [templates, setTemplates] =
    useState<DocumentTemplate[]>(documentTemplates);
  const [selectedTemplate, setSelectedTemplate] =
    useState<DocumentTemplate | null>(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);

  const handleEditTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateEditor(true);
  };

  const handleSaveTemplate = (template: DocumentTemplate) => {
    if (selectedTemplate) {
      // Update existing template
      setTemplates(templates.map((t) => (t.id === template.id ? template : t)));
    } else {
      // Add new template
      setTemplates([...templates, { ...template, id: `custom-${Date.now()}` }]);
    }
    setShowTemplateEditor(false);
    setSelectedTemplate(null);
  };

  const handleDuplicateTemplate = (template: DocumentTemplate) => {
    const newTemplate = {
      ...template,
      id: `${template.id}-copy-${Date.now()}`,
      name: `${template.name} (Kopie)`,
    };
    setTemplates([...templates, newTemplate]);
  };

  const handleDeleteTemplate = (templateId: string) => {
    // Don't allow deleting built-in templates
    if (documentTemplates.some((t) => t.id === templateId)) {
      alert("Standard-Vorlagen können nicht gelöscht werden.");
      return;
    }
    setTemplates(templates.filter((t) => t.id !== templateId));
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-wrap gap-2 justify-between items-center">
        <h1 className="text-2xl font-bold">Dokumentvorlagen</h1>
        <Button
          onClick={() => {
            setSelectedTemplate(null);
            setShowTemplateEditor(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Neue Vorlage
        </Button>
      </header>

      <Tabs defaultValue="angebot">
        <TabsList className="mb-4 max-sm:flex max-sm:flex-wrap max-sm:h-auto w-fit">
          <TabsTrigger value="angebot">Angebot</TabsTrigger>
          <TabsTrigger value="rechnung">Rechnung</TabsTrigger>
          <TabsTrigger value="lieferschein">Lieferschein</TabsTrigger>
        </TabsList>

        <TabsContent value="angebot" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <div className="h-40 bg-muted flex items-center justify-center">
                  <img
                    src={template.preview || "/placeholder.svg"}
                    alt={template.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicateTemplate(template)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTemplate(template.id)}
                        disabled={documentTemplates.some(
                          (t) => t.id === template.id
                        )}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rechnung" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <div className="h-40 bg-muted flex items-center justify-center">
                  <img
                    src={template.preview || "/placeholder.svg"}
                    alt={template.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicateTemplate(template)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTemplate(template.id)}
                        disabled={documentTemplates.some(
                          (t) => t.id === template.id
                        )}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lieferschein" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <div className="h-40 bg-muted flex items-center justify-center">
                  <img
                    src={template.preview || "/placeholder.svg"}
                    alt={template.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicateTemplate(template)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTemplate(template.id)}
                        disabled={documentTemplates.some(
                          (t) => t.id === template.id
                        )}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showTemplateEditor} onOpenChange={setShowTemplateEditor}>
        <DialogContent className="max-w-3xl">
          <TemplateSelector
            selectedTemplate={selectedTemplate || getDefaultTemplate()}
            onSelectTemplate={handleSaveTemplate}
            onClose={() => setShowTemplateEditor(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
