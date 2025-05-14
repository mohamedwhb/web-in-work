"use client";

import SignaturePad from "@/components/signature-pad";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Download,
  Info,
  Pencil,
  Plus,
  Search,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import { useState } from "react";

interface Signature {
  id: string;
  name: string;
  data: string;
  category: string;
  isDefault: boolean;
  createdAt: string;
  lastUsed?: string;
}

export default function UnterschriftenPage() {
  const [signatures, setSignatures] = useState<Signature[]>([
    {
      id: "1",
      name: "Mohamed Wahba",
      data: "/placeholder.svg?height=100&width=200",
      category: "Geschäftsführung",
      isDefault: true,
      createdAt: "2023-05-15T10:30:00Z",
      lastUsed: "2023-06-20T14:45:00Z",
    },
    {
      id: "2",
      name: "Julia Berger",
      data: "/placeholder.svg?height=100&width=200",
      category: "Vertrieb",
      isDefault: false,
      createdAt: "2023-04-10T09:15:00Z",
      lastUsed: "2023-06-18T11:20:00Z",
    },
    {
      id: "3",
      name: "Markus Schmidt",
      data: "/placeholder.svg?height=100&width=200",
      category: "Buchhaltung",
      isDefault: false,
      createdAt: "2023-03-22T13:45:00Z",
    },
  ]);

  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [editingSignature, setEditingSignature] = useState<Signature | null>(
    null
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [signatureToDelete, setSignatureToDelete] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("alle");
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [editMode, setEditMode] = useState<"create" | "edit">("create");
  const [signatureName, setSignatureName] = useState("");
  const [signatureCategory, setSignatureCategory] = useState("Allgemein");
  const [isDefaultSignature, setIsDefaultSignature] = useState(false);

  // Kategorien für Unterschriften
  const categories = [
    "Geschäftsführung",
    "Vertrieb",
    "Buchhaltung",
    "Produktion",
    "Allgemein",
  ];

  // Filtern der Unterschriften basierend auf Suche und Tab
  const filteredSignatures = signatures.filter((signature) => {
    const matchesSearch =
      signature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      signature.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "alle") return matchesSearch;
    if (activeTab === "standard") return signature.isDefault && matchesSearch;
    return (
      signature.category.toLowerCase() === activeTab.toLowerCase() &&
      matchesSearch
    );
  });

  // Öffnen des Dialogs zum Hinzufügen einer neuen Unterschrift
  const handleAddSignature = () => {
    setEditMode("create");
    setEditingSignature(null);
    setSignatureName("");
    setSignatureCategory("Allgemein");
    setIsDefaultSignature(false);
    setShowSignaturePad(true);
  };

  // Öffnen des Dialogs zum Bearbeiten einer bestehenden Unterschrift
  const handleEditSignature = (signature: Signature) => {
    setEditMode("edit");
    setEditingSignature(signature);
    setSignatureName(signature.name);
    setSignatureCategory(signature.category);
    setIsDefaultSignature(signature.isDefault);
    setShowSignaturePad(true);
  };

  // Speichern einer Unterschrift (neu oder bearbeitet)
  const handleSaveSignature = (signatureData: string) => {
    if (editMode === "edit" && editingSignature) {
      // Wenn eine Unterschrift als Standard markiert wird, alle anderen auf nicht-Standard setzen
      let updatedSignatures = [...signatures];
      if (isDefaultSignature) {
        updatedSignatures = updatedSignatures.map((sig) => ({
          ...sig,
          isDefault: sig.id === editingSignature.id,
        }));
      }

      // Aktualisieren der bearbeiteten Unterschrift
      setSignatures(
        updatedSignatures.map((sig) =>
          sig.id === editingSignature.id
            ? {
                ...sig,
                name: signatureName,
                data: signatureData,
                category: signatureCategory,
                isDefault: isDefaultSignature,
              }
            : sig
        )
      );

      toast({
        title: "Unterschrift aktualisiert",
        description: `Die Unterschrift "${signatureName}" wurde erfolgreich aktualisiert.`,
      });
    } else {
      // Erstellen einer neuen Unterschrift
      const newSignature = {
        id: `sig-${Date.now()}`,
        name: signatureName,
        data: signatureData,
        category: signatureCategory,
        isDefault: isDefaultSignature,
        createdAt: new Date().toISOString(),
      };

      // Wenn die neue Unterschrift als Standard markiert wird, alle anderen auf nicht-Standard setzen
      if (isDefaultSignature) {
        setSignatures([
          ...signatures.map((sig) => ({ ...sig, isDefault: false })),
          newSignature,
        ]);
      } else {
        setSignatures([...signatures, newSignature]);
      }

      toast({
        title: "Unterschrift hinzugefügt",
        description: `Die Unterschrift "${signatureName}" wurde erfolgreich hinzugefügt.`,
      });
    }

    setShowSignaturePad(false);
    setEditingSignature(null);
  };

  // Löschen einer Unterschrift nach Bestätigung
  const handleConfirmDelete = () => {
    if (signatureToDelete) {
      const signatureToRemove = signatures.find(
        (sig) => sig.id === signatureToDelete
      );
      setSignatures(signatures.filter((sig) => sig.id !== signatureToDelete));

      toast({
        title: "Unterschrift gelöscht",
        description: `Die Unterschrift "${signatureToRemove?.name}" wurde erfolgreich gelöscht.`,
      });

      setShowDeleteDialog(false);
      setSignatureToDelete(null);
    }
  };

  // Öffnen des Bestätigungsdialogs zum Löschen
  const handleDeleteSignature = (id: string) => {
    setSignatureToDelete(id);
    setShowDeleteDialog(true);
  };

  // Herunterladen einer Unterschrift
  const handleDownloadSignature = (signature: Signature) => {
    const link = document.createElement("a");
    link.download = `${signature.name.replace(/\s+/g, "_")}.png`;
    link.href = signature.data;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Unterschrift heruntergeladen",
      description: `Die Unterschrift "${signature.name}" wurde erfolgreich heruntergeladen.`,
    });
  };

  // Festlegen einer Unterschrift als Standard
  const handleSetDefault = (id: string) => {
    setSignatures(
      signatures.map((sig) => ({
        ...sig,
        isDefault: sig.id === id,
      }))
    );

    const defaultSignature = signatures.find((sig) => sig.id === id);
    toast({
      title: "Standardunterschrift festgelegt",
      description: `"${defaultSignature?.name}" wurde als Standardunterschrift festgelegt.`,
    });
  };

  // Formatieren eines Datums für die Anzeige
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Nie verwendet";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Unterschriften</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Unterschriften für Dokumente
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Unterschriften suchen..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleAddSignature}>
            <Plus className="h-4 w-4 mr-2" />
            Neue Unterschrift
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowInfoDialog(true)}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <Tabs defaultValue="alle" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex flex-wrap h-auto justify-center md:justify-start w-fit">
          <TabsTrigger value="alle">Alle</TabsTrigger>
          <TabsTrigger value="standard">Standard</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category.toLowerCase()}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {filteredSignatures.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center ">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">
                  Keine Unterschriften gefunden
                </h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  {searchQuery
                    ? `Keine Ergebnisse für "${searchQuery}"`
                    : "Fügen Sie eine neue Unterschrift hinzu, um zu beginnen"}
                </p>
                <Button onClick={handleAddSignature}>
                  <Plus className="h-4 w-4 mr-2" />
                  Neue Unterschrift
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSignatures.map((signature) => (
                <Card
                  key={signature.id}
                  className={signature.isDefault ? "border-primary" : ""}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {signature.name}
                          {signature.isDefault && (
                            <Badge variant="default" className="ml-2">
                              Standard
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{signature.category}</CardDescription>
                      </div>
                      {signature.isDefault ? (
                        <Star className="h-5 w-5 text-primary" />
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSetDefault(signature.id)}
                          title="Als Standard festlegen"
                        >
                          <StarOff className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border rounded-md p-4 bg-white flex items-center justify-center h-32">
                      <img
                        src={signature.data || "/placeholder.svg"}
                        alt={signature.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Erstellt am: {formatDate(signature.createdAt)}</div>
                      <div>
                        Zuletzt verwendet: {formatDate(signature.lastUsed)}
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-center lg:justify-between gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadSignature(signature)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Speichern
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSignature(signature)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSignature(signature.id)}
                          disabled={signature.isDefault}
                          title={
                            signature.isDefault
                              ? "Standardunterschrift kann nicht gelöscht werden"
                              : "Unterschrift löschen"
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog für Unterschriften-Pad */}
      <Dialog open={showSignaturePad} onOpenChange={setShowSignaturePad}>
        <DialogContent className="sm:max-w-md ">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">
              {editMode === "create"
                ? "Neue Unterschrift"
                : "Unterschrift bearbeiten"}
            </h2>
            <div className="max-md:max-h-[60dvh] max-md:overflow-y-auto max-md:px-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signature-name">Name</Label>
                <Input
                  id="signature-name"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="Name der unterschreibenden Person"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signature-category">Kategorie</Label>
                <Select
                  value={signatureCategory}
                  onValueChange={setSignatureCategory}
                >
                  <SelectTrigger id="signature-category">
                    <SelectValue placeholder="Kategorie auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="default-signature"
                  checked={isDefaultSignature}
                  onCheckedChange={setIsDefaultSignature}
                />
                <Label htmlFor="default-signature">
                  Als Standardunterschrift festlegen
                </Label>
              </div>

              <SignaturePad
                onSave={handleSaveSignature}
                onCancel={() => setShowSignaturePad(false)}
                initialSignature={editingSignature?.data}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bestätigungsdialog für das Löschen */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unterschrift löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie diese Unterschrift löschen möchten?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Informationsdialog */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Über Unterschriften</h2>
            <p>
              Unterschriften werden verwendet, um Dokumente wie Angebote,
              Rechnungen und Lieferscheine zu signieren. Sie können mehrere
              Unterschriften für verschiedene Personen oder Abteilungen
              erstellen.
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">
                  Standard
                </Badge>
                <p className="text-sm">
                  Eine Standardunterschrift wird automatisch für neue Dokumente
                  verwendet.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Star className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-sm">
                  Die Standardunterschrift ist mit einem Stern markiert und kann
                  nicht gelöscht werden.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Download className="h-4 w-4 mt-0.5" />
                <p className="text-sm">
                  Sie können Unterschriften als PNG-Dateien herunterladen, um
                  sie in anderen Anwendungen zu verwenden.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
