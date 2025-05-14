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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function TaxSettingsPage() {
  const [taxRates, setTaxRates] = useState([
    { id: 1, name: "Standard", rate: 19, isDefault: true, active: true },
    { id: 2, name: "Reduziert", rate: 7, isDefault: false, active: true },
    { id: 3, name: "Befreit", rate: 0, isDefault: false, active: true },
  ]);

  const [newTaxRate, setNewTaxRate] = useState({
    name: "",
    rate: "",
    isDefault: false,
    active: true,
  });
  const [automaticTax, setAutomaticTax] = useState(true);
  const [defaultCountry, setDefaultCountry] = useState("DE");
  const [euVatEnabled, setEuVatEnabled] = useState(true);
  const [reverseChargeEnabled, setReverseChargeEnabled] = useState(true);

  const handleAddTaxRate = () => {
    if (!newTaxRate.name || !newTaxRate.rate) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Namen und einen Steuersatz ein.",
        variant: "destructive",
      });
      return;
    }

    const rate = Number.parseFloat(newTaxRate.rate.toString());
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast({
        title: "Fehler",
        description: "Der Steuersatz muss zwischen 0 und 100 liegen.",
        variant: "destructive",
      });
      return;
    }

    const newId = Math.max(...taxRates.map((tax) => tax.id), 0) + 1;
    setTaxRates([...taxRates, { ...newTaxRate, id: newId, rate }]);
    setNewTaxRate({ name: "", rate: "", isDefault: false, active: true });

    toast({
      title: "Steuersatz hinzugefügt",
      description: `Der Steuersatz "${newTaxRate.name}" wurde erfolgreich hinzugefügt.`,
    });
  };

  const handleDeleteTaxRate = (id: number) => {
    const taxToDelete = taxRates.find((tax) => tax.id === id);
    if (taxToDelete?.isDefault) {
      toast({
        title: "Fehler",
        description: "Der Standard-Steuersatz kann nicht gelöscht werden.",
        variant: "destructive",
      });
      return;
    }

    setTaxRates(taxRates.filter((tax) => tax.id !== id));
    toast({
      title: "Steuersatz gelöscht",
      description: "Der Steuersatz wurde erfolgreich gelöscht.",
    });
  };

  const handleSetDefault = (id: number) => {
    setTaxRates(
      taxRates.map((tax) => ({
        ...tax,
        isDefault: tax.id === id,
      }))
    );

    toast({
      title: "Standard-Steuersatz geändert",
      description: "Der Standard-Steuersatz wurde erfolgreich geändert.",
    });
  };

  const handleToggleActive = (id: number) => {
    const taxToToggle = taxRates.find((tax) => tax.id === id);
    if (taxToToggle?.isDefault && taxToToggle.active) {
      toast({
        title: "Fehler",
        description: "Der Standard-Steuersatz kann nicht deaktiviert werden.",
        variant: "destructive",
      });
      return;
    }

    setTaxRates(
      taxRates.map((tax) =>
        tax.id === id ? { ...tax, active: !tax.active } : tax
      )
    );
  };

  const handleSaveSettings = () => {
    toast({
      title: "Einstellungen gespeichert",
      description: "Die Steuereinstellungen wurden erfolgreich gespeichert.",
    });
  };

  return (
    <div className="max-w-7xl px-2 lg:px-0 mx-auto py-6 space-y-6">
      <PageHeader
        heading="Steuereinstellungen"
        description="Verwalten Sie Steuersätze und Steuerregeln für Ihre Dokumente"
      />

      <Tabs defaultValue="tax-rates">
        <TabsList className="flex flex-wrap h-auto justify-center md:justify-start w-full">
          <TabsTrigger value="tax-rates">Steuersätze</TabsTrigger>
          <TabsTrigger value="tax-rules">Steuerregeln</TabsTrigger>
          <TabsTrigger value="tax-reports">Steuerberichte</TabsTrigger>
        </TabsList>

        <TabsContent value="tax-rates" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Steuersätze verwalten</CardTitle>
              <CardDescription>
                Definieren Sie die Steuersätze, die in Ihren Dokumenten
                verwendet werden können.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Steuersatz (%)</TableHead>
                    <TableHead>Standard</TableHead>
                    <TableHead>Aktiv</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxRates.map((tax) => (
                    <TableRow key={tax.id}>
                      <TableCell>{tax.name}</TableCell>
                      <TableCell>{tax.rate}%</TableCell>
                      <TableCell>
                        <Switch
                          checked={tax.isDefault}
                          onCheckedChange={() => handleSetDefault(tax.id)}
                          disabled={tax.isDefault}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={tax.active}
                          onCheckedChange={() => handleToggleActive(tax.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTaxRate(tax.id)}
                          disabled={tax.isDefault}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">
                  Neuen Steuersatz hinzufügen
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax-name">Name</Label>
                    <Input
                      id="tax-name"
                      value={newTaxRate.name}
                      onChange={(e) =>
                        setNewTaxRate({ ...newTaxRate, name: e.target.value })
                      }
                      placeholder="z.B. Reduziert"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax-rate">Steuersatz (%)</Label>
                    <Input
                      id="tax-rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={newTaxRate.rate}
                      onChange={(e) =>
                        setNewTaxRate({ ...newTaxRate, rate: e.target.value })
                      }
                      placeholder="z.B. 7"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddTaxRate}>
                      <Plus className="h-4 w-4 mr-2" />
                      Hinzufügen
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax-rules" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Steuerregeln</CardTitle>
              <CardDescription>
                Konfigurieren Sie, wie Steuern in Ihrem System angewendet
                werden.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="automatic-tax">
                    Automatische Steuerberechnung
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Steuern werden automatisch basierend auf dem Kundenstandort
                    berechnet
                  </p>
                </div>
                <Switch
                  id="automatic-tax"
                  checked={automaticTax}
                  onCheckedChange={setAutomaticTax}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-country">Standardland</Label>
                <Select
                  value={defaultCountry}
                  onValueChange={setDefaultCountry}
                >
                  <SelectTrigger id="default-country">
                    <SelectValue placeholder="Wählen Sie ein Land" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DE">Deutschland</SelectItem>
                    <SelectItem value="AT">Österreich</SelectItem>
                    <SelectItem value="CH">Schweiz</SelectItem>
                    <SelectItem value="FR">Frankreich</SelectItem>
                    <SelectItem value="IT">Italien</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Dieses Land wird verwendet, wenn kein Kundenland angegeben ist
                </p>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="eu-vat">EU-Mehrwertsteuer</Label>
                  <p className="text-sm text-muted-foreground">
                    Aktivieren Sie die EU-Mehrwertsteuerregeln für Kunden in der
                    EU
                  </p>
                </div>
                <Switch
                  id="eu-vat"
                  checked={euVatEnabled}
                  onCheckedChange={setEuVatEnabled}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="reverse-charge">
                    Reverse-Charge-Verfahren
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Aktivieren Sie das Reverse-Charge-Verfahren für B2B-Kunden
                    in der EU
                  </p>
                </div>
                <Switch
                  id="reverse-charge"
                  checked={reverseChargeEnabled}
                  onCheckedChange={setReverseChargeEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax-reports" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Steuerberichte</CardTitle>
              <CardDescription>
                Konfigurieren Sie Ihre Steuerberichte und Exportformate.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="report-period">Standard-Berichtszeitraum</Label>
                <Select defaultValue="monthly">
                  <SelectTrigger id="report-period">
                    <SelectValue placeholder="Wählen Sie einen Zeitraum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monatlich</SelectItem>
                    <SelectItem value="quarterly">Vierteljährlich</SelectItem>
                    <SelectItem value="yearly">Jährlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="export-format">Standard-Exportformat</Label>
                <Select defaultValue="csv">
                  <SelectTrigger id="export-format">
                    <SelectValue placeholder="Wählen Sie ein Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax-office-id">Finanzamt-ID</Label>
                <Input id="tax-office-id" placeholder="z.B. 1234567890" />
                <p className="text-sm text-muted-foreground">
                  Diese ID wird für elektronische Steuerberichte verwendet
                </p>
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
