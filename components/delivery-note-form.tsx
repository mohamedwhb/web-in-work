"use client";

import {
  ArticleManagement,
  type ArticleItem,
  type Product,
} from "@/components/article-management";
import AutosaveIndicator from "@/components/autosave-indicator";
import RestoreAutosaveDialog from "@/components/restore-autosave-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAutosave } from "@/hooks/use-autosave";
import { useToast } from "@/hooks/use-toast";
import type { DocumentData } from "@/lib/pdf-generator";
import { ArrowLeft, FileDown, Save } from "lucide-react";
import { useEffect, useState } from "react";

type DeliveryNoteFormProps = {
  onCancel: () => void;
  onSave: () => void;
  onPreview: (data: DocumentData) => void;
  initialData?: any;
};

// Sample customers data
const customers = [
  {
    id: 1,
    name: "Max Mustermann GmbH",
    address: "Max Straße 123",
    city: "Wien",
    zip: "1010",
    country: "Österreich",
    customerNumber: "123456",
    vatId: "ATU 123456",
    taxId: "DN123456",
    email: "max@mustermann.at",
  },
  {
    id: 2,
    name: "Firma ABC",
    address: "ABC Straße 456",
    city: "Wien",
    zip: "1020",
    country: "Österreich",
    customerNumber: "234567",
    vatId: "ATU 234567",
    taxId: "DN234567",
    email: "info@abc.at",
  },
  {
    id: 3,
    name: "XYZ GmbH",
    address: "XYZ Platz 789",
    city: "Wien",
    zip: "1030",
    country: "Österreich",
    customerNumber: "345678",
    vatId: "ATU 345678",
    taxId: "DN345678",
    email: "kontakt@xyz.at",
  },
];

// Sample products data
const products: Product[] = [
  {
    id: 1,
    name: "Mango",
    artNr: "12345",
    price: 15.9,
    unit: "Kg",
    group: "Obst",
    stock: 10,
  },
  {
    id: 2,
    name: "Avocado",
    artNr: "23456",
    price: 12.5,
    unit: "Kg",
    group: "Obst",
    stock: 15,
  },
  {
    id: 3,
    name: "Kartoffel",
    artNr: "34567",
    price: 5.2,
    unit: "Kg",
    group: "Gemüse",
    stock: 50,
  },
  {
    id: 4,
    name: "Petersilie",
    artNr: "45678",
    price: 2.8,
    unit: "Bund",
    group: "Kräuter",
    stock: 20,
  },
  {
    id: 5,
    name: "Tomate",
    artNr: "56789",
    price: 8.9,
    unit: "Kg",
    group: "Gemüse",
    stock: 30,
  },
];

// Initial form state
const getInitialFormState = () => ({
  id: `LS-${new Date().getFullYear()}-${String(
    Math.floor(Math.random() * 10000)
  ).padStart(5, "0")}`,
  date: new Date().toISOString().split("T")[0],
  deliveryDate: new Date().toISOString().split("T")[0],
  reference: "",
  orderNumber: "",
  processor: "mohamed",
  customer: "1",
  customerNumber: "123456",
  vatId: "ATU 123456",
  taxId: "DN123456",
  email: "",
  shippingAddress: `Max Mustermann GmbH
Max Straße 123
1010 Wien
Österreich`,
  billingAddress: `Max Mustermann GmbH
Max Straße 123
1010 Wien
Österreich`,
  useSeparateShippingAddress: false,
  items: [
    {
      id: 1,
      product: "Mango",
      artNr: "12345",
      quantity: 1,
      price: 15.9,
      total: 15.9,
    },
  ],
  notes: "",
  status: "prepared", // prepared, shipped, delivered
  shippingMethod: "standard",
  trackingNumber: "",
});

export default function DeliveryNoteForm({
  onCancel,
  onSave,
  onPreview,
  initialData,
}: DeliveryNoteFormProps) {
  const [formState, setFormState] = useState(
    initialData || getInitialFormState()
  );
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [savedData, setSavedData] = useState<{
    data: any;
    timestamp: Date;
  } | null>(null);
  const { toast } = useToast();

  // Set up autosave
  const { lastSaved, isSaving, getSavedData, clearSavedData, save } =
    useAutosave({
      key: `delivery-note-form`,
      data: formState,
      interval: 10000, // Autosave every 10 seconds
    });

  // Check for saved data on mount
  useEffect(() => {
    const saved = getSavedData();
    if (saved) {
      setSavedData(saved);
      setShowRestoreDialog(true);
    }
  }, [getSavedData]);

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle items change
  const handleItemsChange = (items: ArticleItem[]) => {
    setFormState((prev) => ({
      ...prev,
      items,
    }));
  };

  // Handle restore from autosave
  const handleRestore = () => {
    if (savedData) {
      setFormState(savedData.data);
      setShowRestoreDialog(false);
      toast({
        title: "Daten wiederhergestellt",
        description:
          "Ihre automatisch gespeicherten Daten wurden erfolgreich wiederhergestellt.",
      });
    }
  };

  // Handle discard autosave
  const handleDiscard = () => {
    clearSavedData();
    setShowRestoreDialog(false);
    toast({
      title: "Gespeicherte Daten verworfen",
      description: "Die automatisch gespeicherten Daten wurden verworfen.",
    });
  };

  // Handle manual save
  const handleManualSave = () => {
    save();
    toast({
      title: "Änderungen gespeichert",
      description: "Ihre Änderungen wurden gespeichert.",
    });
  };

  // Handle final save
  const handleFinalSave = () => {
    clearSavedData();
    onSave();
  };

  // Calculate totals
  const subtotal = formState.items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  // Create document data for preview and export
  const createDocumentData = (): DocumentData => {
    return {
      id: formState.id,
      date: new Date(formState.date).toLocaleDateString("de-DE"),
      customer: {
        name: formState.useSeparateShippingAddress
          ? formState.shippingAddress.split("\n")[0] || ""
          : formState.billingAddress.split("\n")[0] || "",
        address: formState.useSeparateShippingAddress
          ? formState.shippingAddress.split("\n")[1] || ""
          : formState.billingAddress.split("\n")[1] || "",
        city: formState.useSeparateShippingAddress
          ? formState.shippingAddress.split("\n")[2]?.split(" ")[1] || ""
          : formState.billingAddress.split("\n")[2]?.split(" ")[1] || "",
        zip: formState.useSeparateShippingAddress
          ? formState.shippingAddress.split("\n")[2]?.split(" ")[0] || ""
          : formState.billingAddress.split("\n")[2]?.split(" ")[0] || "",
        country: formState.useSeparateShippingAddress
          ? formState.shippingAddress.split("\n")[3] || "Österreich"
          : formState.billingAddress.split("\n")[3] || "Österreich",
        customerNumber: formState.customerNumber,
        vatId: formState.vatId,
        taxId: formState.taxId,
        email: formState.email,
      },
      items: formState.items,
      subtotal,
      tax,
      taxRate: 10,
      total,
      processor:
        formState.processor === "mohamed"
          ? "Mohamed Wahba"
          : formState.processor,
      reference: formState.reference,
      period: "",
      bankDetails: {
        recipient: "Mohamed Wahba",
        institute: "Erste Bank",
        iban: "AT12 3456 7890 3456",
        bic: "GTRHMLKTGH",
        reference: "12456789",
      },
      deliveryDate: new Date(formState.deliveryDate).toLocaleDateString(
        "de-DE"
      ),
      orderNumber: formState.orderNumber,
      shippingMethod: formState.shippingMethod,
      trackingNumber: formState.trackingNumber,
      notes: formState.notes,
      status: formState.status,
    };
  };

  const handlePreview = () => {
    onPreview(createDocumentData());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lieferschein erstellen</CardTitle>
          <AutosaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="allgemein">
            <TabsList className="mb-4 flex flex-wrap justify-start gap-2 h-auto w-fit">
              <TabsTrigger value="allgemein">Allgemein</TabsTrigger>
              <TabsTrigger value="kunde">Kunde</TabsTrigger>
              <TabsTrigger value="artikel">Artikel</TabsTrigger>
              <TabsTrigger value="versand">Versand</TabsTrigger>
            </TabsList>

            <TabsContent value="allgemein" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id">Lieferschein Nr.</Label>
                  <Input
                    id="id"
                    value={formState.id}
                    onChange={(e) => handleInputChange("id", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Datum</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formState.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Lieferdatum</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={formState.deliveryDate}
                    onChange={(e) =>
                      handleInputChange("deliveryDate", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Referenz</Label>
                  <Input
                    id="reference"
                    value={formState.reference}
                    onChange={(e) =>
                      handleInputChange("reference", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Bestellnummer</Label>
                  <Input
                    id="orderNumber"
                    value={formState.orderNumber}
                    onChange={(e) =>
                      handleInputChange("orderNumber", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="processor">Bearbeiter</Label>
                  <Select
                    value={formState.processor}
                    onValueChange={(value) =>
                      handleInputChange("processor", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Bearbeiter auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mohamed">Mohamed Wahba</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formState.status}
                    onValueChange={(value) =>
                      handleInputChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prepared">Vorbereitet</SelectItem>
                      <SelectItem value="shipped">Versendet</SelectItem>
                      <SelectItem value="delivered">Geliefert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="kunde" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Kunde</Label>
                <Select
                  value={formState.customer}
                  onValueChange={(value) => {
                    // When customer changes, update all related fields
                    const selectedCustomer = customers.find(
                      (c) => c.id.toString() === value
                    );
                    if (selectedCustomer) {
                      handleInputChange("customer", value);
                      handleInputChange(
                        "customerNumber",
                        selectedCustomer.customerNumber || ""
                      );
                      handleInputChange("vatId", selectedCustomer.vatId || "");
                      handleInputChange("taxId", selectedCustomer.taxId || "");
                      handleInputChange("email", selectedCustomer.email || "");

                      const addressText = `${selectedCustomer.name}
${selectedCustomer.address}
${selectedCustomer.zip} ${selectedCustomer.city}
${selectedCustomer.country}`;

                      handleInputChange("billingAddress", addressText);

                      if (!formState.useSeparateShippingAddress) {
                        handleInputChange("shippingAddress", addressText);
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kunde auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem
                        key={customer.id}
                        value={customer.id.toString()}
                      >
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="useSeparateShippingAddress"
                  checked={formState.useSeparateShippingAddress}
                  onCheckedChange={(checked) => {
                    handleInputChange("useSeparateShippingAddress", checked);
                    if (!checked) {
                      // Reset shipping address to billing address
                      handleInputChange(
                        "shippingAddress",
                        formState.billingAddress
                      );
                    }
                  }}
                />
                <Label htmlFor="useSeparateShippingAddress">
                  Separate Lieferadresse verwenden
                </Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerNumber">Kunden-Nr.</Label>
                  <Input
                    id="customerNumber"
                    value={formState.customerNumber}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formState.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="billingAddress">Rechnungsadresse</Label>
                  <Textarea
                    id="billingAddress"
                    className="min-h-[100px]"
                    value={formState.billingAddress}
                    onChange={(e) =>
                      handleInputChange("billingAddress", e.target.value)
                    }
                  />
                </div>

                {formState.useSeparateShippingAddress && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="shippingAddress">Lieferadresse</Label>
                    <Textarea
                      id="shippingAddress"
                      className="min-h-[100px]"
                      value={formState.shippingAddress}
                      onChange={(e) =>
                        handleInputChange("shippingAddress", e.target.value)
                      }
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="artikel">
              <div className="space-y-4">
                <ArticleManagement
                  items={formState.items}
                  onItemsChange={handleItemsChange}
                  products={products}
                  showTax={false}
                  showDiscount={false}
                  showPositions={true}
                  allowReordering={true}
                  allowBatchInput={true}
                  showStock={true}
                />

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Zwischensumme:</span>
                    <span>€ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>MwSt. (10%):</span>
                    <span>€ {tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Gesamtbetrag:</span>
                    <span>€ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="versand" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shippingMethod">Versandart</Label>
                  <Select
                    value={formState.shippingMethod}
                    onValueChange={(value) =>
                      handleInputChange("shippingMethod", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Versandart auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                      <SelectItem value="pickup">Selbstabholung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trackingNumber">Sendungsnummer</Label>
                  <Input
                    id="trackingNumber"
                    value={formState.trackingNumber}
                    onChange={(e) =>
                      handleInputChange("trackingNumber", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Anmerkungen</Label>
                  <Textarea
                    id="notes"
                    placeholder="Zusätzliche Informationen zur Lieferung"
                    className="min-h-[100px]"
                    value={formState.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col md:flex-row gap-2 max-md:items-start md:justify-between">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleManualSave}>
              <Save className="h-4 w-4 mr-2" />
              Speichern
            </Button>
            <Button variant="outline" onClick={handlePreview}>
              <FileDown className="h-4 w-4 mr-2" />
              Vorschau
            </Button>
            <Button onClick={handleFinalSave}>Fertigstellen</Button>
          </div>
        </CardFooter>
      </Card>

      <RestoreAutosaveDialog
        open={showRestoreDialog}
        onOpenChange={setShowRestoreDialog}
        timestamp={savedData?.timestamp || new Date()}
        onRestore={handleRestore}
        onDiscard={handleDiscard}
      />
    </div>
  );
}
