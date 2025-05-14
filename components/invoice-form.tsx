"use client";

import {
  ArticleManagement,
  type ArticleItem,
} from "@/components/article-management";
import AutosaveIndicator from "@/components/autosave-indicator";
import EmailDialog from "@/components/email-dialog";
import RestoreAutosaveDialog from "@/components/restore-autosave-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import type { InvoiceData } from "@/lib/invoice-types";
import type { DocumentData } from "@/lib/pdf-generator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ArrowLeft, CalendarIcon, FileText, Save, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Default empty invoice data
const emptyInvoiceData: InvoiceData = {
  id: "",
  date: new Date(),
  customer: {
    id: "",
    name: "",
    address: "",
    email: "",
    phone: "",
    taxId: "",
  },
  items: [],
  notes: "",
  paymentTerms: "14 Tage",
  paymentStatus: "unpaid",
  paymentMethod: "bank_transfer",
  paymentDueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
  paymentDate: null,
  paymentAmount: 0,
  paymentReference: "",
  offerReference: "",
};

interface InvoiceFormProps {
  initialData?: Partial<InvoiceData>;
  onSave?: (data: InvoiceData) => void;
  readOnly?: boolean;
  offerData?: DocumentData; // Optional offer data to convert to invoice
  onCancel?: () => void;
}

// Sample customers data
const customers = [
  {
    id: "1",
    name: "Max Mustermann GmbH",
    address: "Max Straße 123\n1010 Wien\nÖsterreich",
    email: "max@mustermann.at",
    phone: "+43 1 234567",
    taxId: "ATU 123456",
    vatId: "ATU 123456",
  },
  {
    id: "2",
    name: "Firma ABC",
    address: "ABC Straße 456\n1020 Wien\nÖsterreich",
    email: "info@abc.at",
    phone: "+43 1 345678",
    taxId: "ATU 234567",
    vatId: "ATU 234567",
  },
  {
    id: "3",
    name: "XYZ GmbH",
    address: "XYZ Platz 789\n1030 Wien\nÖsterreich",
    email: "kontakt@xyz.at",
    phone: "+43 1 456789",
    taxId: "ATU 345678",
    vatId: "ATU 345678",
  },
];

// Sample products data
const products = [
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
  {
    id: 6,
    name: "Zwiebel",
    artNr: "67890",
    price: 3.5,
    unit: "Kg",
    group: "Gemüse",
    stock: 40,
  },
  {
    id: 7,
    name: "Knoblauch",
    artNr: "78901",
    price: 4.2,
    unit: "Bund",
    group: "Kräuter",
    stock: 25,
  },
  {
    id: 8,
    name: "Apfel",
    artNr: "89012",
    price: 6.5,
    unit: "Kg",
    group: "Obst",
    stock: 35,
  },
  {
    id: 9,
    name: "Birne",
    artNr: "90123",
    price: 7.2,
    unit: "Kg",
    group: "Obst",
    stock: 30,
  },
  {
    id: 10,
    name: "Zitrone",
    artNr: "01234",
    price: 9.8,
    unit: "Kg",
    group: "Obst",
    stock: 20,
  },
];

export function InvoiceForm({
  initialData,
  onSave,
  readOnly = false,
  offerData,
  onCancel,
}: InvoiceFormProps) {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    ...emptyInvoiceData,
    ...initialData,
    date: initialData?.date ? new Date(initialData.date) : new Date(),
    paymentDueDate: initialData?.paymentDueDate
      ? new Date(initialData.paymentDueDate)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    paymentDate: initialData?.paymentDate
      ? new Date(initialData.paymentDate)
      : null,
  });
  const [activeTab, setActiveTab] = useState("general");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Calculate totals
  const subtotal = invoiceData.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const taxAmount = subtotal * 0.2; // 20% VAT
  const total = subtotal + taxAmount;

  // Autosave functionality
  const {
    isSaving,
    lastSaved,
    hasAutosave,
    restoreAutosave,
    confirmRestore,
    cancelRestore,
  } = useAutosave({
    data: invoiceData,
    key: `invoice-${invoiceData.id || "new"}`,
    onSave: (data) => {
      console.log("Autosaving invoice:", data);
      return Promise.resolve();
    },
  });

  // Generate invoice ID if not provided
  useEffect(() => {
    if (!invoiceData.id) {
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, "0");
      const day = today.getDate().toString().padStart(2, "0");
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      setInvoiceData((prev) => ({
        ...prev,
        id: `RE-${year}${month}${day}-${random}`,
      }));
    }
  }, [invoiceData.id]);

  // Convert offer data to invoice if provided
  useEffect(() => {
    if (offerData && !initialData) {
      const items = offerData.items.map((item) => ({
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: item.product,
        description: "",
        quantity: item.quantity,
        price: item.price,
        unit: "Stück",
      }));

      const customer = customers.find(
        (c) => c.name.toLowerCase() === offerData.customer.name.toLowerCase()
      ) || {
        id: "new",
        name: offerData.customer.name,
        address: `${offerData.customer.address}\n${offerData.customer.zip} ${offerData.customer.city}\n${offerData.customer.country}`,
        email: offerData.customer.email || "",
        phone: "",
        taxId: offerData.customer.taxId || "",
        vatId: offerData.customer.vatId || "",
      };

      setInvoiceData((prev) => ({
        ...prev,
        customer,
        items,
        offerReference: offerData.id,
        notes: "Vielen Dank für Ihren Auftrag!",
      }));
    }
  }, [offerData, initialData]);

  // Update payment due date when payment terms change
  useEffect(() => {
    if (invoiceData.paymentTerms) {
      const days =
        Number.parseInt(invoiceData.paymentTerms.split(" ")[0]) || 14;
      const dueDate = new Date(invoiceData.date);
      dueDate.setDate(dueDate.getDate() + days);
      setInvoiceData((prev) => ({ ...prev, paymentDueDate: dueDate }));
    }
  }, [invoiceData.paymentTerms, invoiceData.date]);

  // Handle form field changes
  const handleChange = (field: string, value: any) => {
    setInvoiceData((prev) => {
      if (field.startsWith("customer.")) {
        const customerField = field.split(".")[1];
        return {
          ...prev,
          customer: {
            ...prev.customer,
            [customerField]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });
  };

  // Handle customer selection
  const handleSelectCustomer = (customerId: string) => {
    const selectedCustomer = customers.find((c) => c.id === customerId);
    if (selectedCustomer) {
      setInvoiceData((prev) => ({
        ...prev,
        customer: selectedCustomer,
      }));
    }
  };

  // Handle items change from ArticleManagement
  const handleItemsChange = (newItems: ArticleItem[]) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: newItems.map((item) => ({
        id: item.id.toString(),
        name: item.name || item.product || "",
        description: item.description || "",
        quantity: item.quantity,
        price: item.price,
        unit: item.unit || "Stück",
      })),
    }));
  };

  // Handle save
  const handleSave = async () => {
    try {
      if (onSave) {
        await onSave(invoiceData);
      }
      toast({
        title: "Rechnung gespeichert",
        description: `Rechnung ${invoiceData.id} wurde erfolgreich gespeichert.`,
      });
      router.push("/rechnungen");
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast({
        title: "Fehler beim Speichern",
        description: "Die Rechnung konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  // Handle email send
  const handleSendEmail = () => {
    setIsEmailDialogOpen(true);
  };

  // Handle preview
  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  // Get payment status badge variant
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "partial":
        return "warning";
      case "overdue":
        return "destructive";
      case "cancelled":
        return "outline";
      default:
        return "secondary";
    }
  };

  // Get payment status text
  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "unpaid":
        return "Unbezahlt";
      case "partial":
        return "Teilweise bezahlt";
      case "paid":
        return "Bezahlt";
      case "overdue":
        return "Überfällig";
      case "cancelled":
        return "Storniert";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {hasAutosave && (
        <RestoreAutosaveDialog
          onConfirm={restoreAutosave}
          onCancel={cancelRestore}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-2xl font-bold">
            {invoiceData.id ? `Rechnung: ${invoiceData.id}` : "Neue Rechnung"}
          </h1>
          {invoiceData.paymentStatus && (
            <Badge
              variant={getPaymentStatusBadge(invoiceData.paymentStatus) as any}
              className="ml-2"
            >
              {getPaymentStatusText(invoiceData.paymentStatus)}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <AutosaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
          {!readOnly && (
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={handlePreview}
                className="flex-1 sm:flex-auto"
              >
                <FileText className="mr-2 h-4 w-4" />
                Vorschau
              </Button>
              <Button
                variant="outline"
                onClick={handleSendEmail}
                className="flex-1 sm:flex-auto"
              >
                <Send className="mr-2 h-4 w-4" />
                E-Mail
              </Button>
              <Button onClick={handleSave} className="flex-1 sm:flex-auto">
                <Save className="mr-2 h-4 w-4" />
                Speichern
              </Button>
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full h-auto flex gap-2 flex-wrap justify-center md:justify-start">
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="customer">Kunde</TabsTrigger>
          <TabsTrigger value="items">Positionen</TabsTrigger>
          <TabsTrigger value="payment">Zahlung</TabsTrigger>
          <TabsTrigger value="notes">Notizen</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label htmlFor="invoice-id">Rechnungsnummer</Label>
                  <Input
                    id="invoice-id"
                    value={invoiceData.id}
                    onChange={(e) => handleChange("id", e.target.value)}
                    readOnly={readOnly}
                  />
                </div>

                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label htmlFor="invoice-date">Rechnungsdatum</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !invoiceData.date && "text-muted-foreground"
                        )}
                        disabled={readOnly}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {invoiceData.date ? (
                          format(invoiceData.date, "PPP", { locale: de })
                        ) : (
                          <span>Datum wählen</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={invoiceData.date}
                        onSelect={(date) => handleChange("date", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label htmlFor="payment-terms">Zahlungsbedingungen</Label>
                  <Select
                    value={invoiceData.paymentTerms}
                    onValueChange={(value) =>
                      handleChange("paymentTerms", value)
                    }
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Zahlungsbedingungen wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7 Tage">7 Tage</SelectItem>
                      <SelectItem value="14 Tage">14 Tage</SelectItem>
                      <SelectItem value="30 Tage">30 Tage</SelectItem>
                      <SelectItem value="Sofort">Sofort</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label htmlFor="payment-due-date">Fälligkeitsdatum</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !invoiceData.paymentDueDate && "text-muted-foreground"
                        )}
                        disabled={readOnly}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {invoiceData.paymentDueDate ? (
                          format(invoiceData.paymentDueDate, "PPP", {
                            locale: de,
                          })
                        ) : (
                          <span>Datum wählen</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={invoiceData.paymentDueDate}
                        onSelect={(date) =>
                          handleChange("paymentDueDate", date)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {invoiceData.offerReference && (
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="offer-reference">Angebotsnummer</Label>
                    <Input
                      id="offer-reference"
                      value={invoiceData.offerReference}
                      onChange={(e) =>
                        handleChange("offerReference", e.target.value)
                      }
                      readOnly={readOnly}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Tab */}
        <TabsContent value="customer">
          <Card>
            <CardContent className="pt-6">
              {!readOnly && (
                <div className="mb-6">
                  <Label htmlFor="customer-select">Kunde auswählen</Label>
                  <Select
                    value={invoiceData.customer.id || ""}
                    onValueChange={handleSelectCustomer}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kunde auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label htmlFor="customer-name">Name</Label>
                  <Input
                    id="customer-name"
                    value={invoiceData.customer.name}
                    onChange={(e) =>
                      handleChange("customer.name", e.target.value)
                    }
                    readOnly={readOnly}
                  />
                </div>

                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label htmlFor="customer-id">Kundennummer</Label>
                  <Input
                    id="customer-id"
                    value={invoiceData.customer.id}
                    onChange={(e) =>
                      handleChange("customer.id", e.target.value)
                    }
                    readOnly={readOnly}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="customer-address">Adresse</Label>
                  <Textarea
                    id="customer-address"
                    value={invoiceData.customer.address}
                    onChange={(e) =>
                      handleChange("customer.address", e.target.value)
                    }
                    readOnly={readOnly}
                    rows={4}
                  />
                </div>

                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label htmlFor="customer-email">E-Mail</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    value={invoiceData.customer.email}
                    onChange={(e) =>
                      handleChange("customer.email", e.target.value)
                    }
                    readOnly={readOnly}
                  />
                </div>

                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label htmlFor="customer-phone">Telefon</Label>
                  <Input
                    id="customer-phone"
                    value={invoiceData.customer.phone}
                    onChange={(e) =>
                      handleChange("customer.phone", e.target.value)
                    }
                    readOnly={readOnly}
                  />
                </div>

                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label htmlFor="customer-tax-id">UID-Nummer</Label>
                  <Input
                    id="customer-tax-id"
                    value={invoiceData.customer.taxId}
                    onChange={(e) =>
                      handleChange("customer.taxId", e.target.value)
                    }
                    readOnly={readOnly}
                  />
                </div>

                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label htmlFor="customer-vat-id">Steuer-Nummer</Label>
                  <Input
                    id="customer-vat-id"
                    value={invoiceData.customer.vatId || ""}
                    onChange={(e) =>
                      handleChange("customer.vatId", e.target.value)
                    }
                    readOnly={readOnly}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items">
          <Card>
            <CardContent className="pt-6">
              <ArticleManagement
                items={invoiceData.items.map((item) => ({
                  id: item.id,
                  product: item.name,
                  name: item.name,
                  description: item.description,
                  quantity: item.quantity,
                  price: item.price,
                  unit: item.unit,
                  total: item.quantity * item.price,
                }))}
                onItemsChange={handleItemsChange}
                products={products}
                readOnly={readOnly}
                showTax={true}
                showDiscount={true}
                allowBatchInput={true}
                toast={toast}
              />

              <div className="mt-6 border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Zwischensumme:</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>MwSt. (20%):</span>
                  <span>{taxAmount.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Gesamtsumme:</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="payment-status">Zahlungsstatus</Label>
                  <Select
                    value={invoiceData.paymentStatus}
                    onValueChange={(value) =>
                      handleChange("paymentStatus", value as any)
                    }
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Unbezahlt</SelectItem>
                      <SelectItem value="partial">Teilweise bezahlt</SelectItem>
                      <SelectItem value="paid">Bezahlt</SelectItem>
                      <SelectItem value="overdue">Überfällig</SelectItem>
                      <SelectItem value="cancelled">Storniert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-method">Zahlungsmethode</Label>
                  <Select
                    value={invoiceData.paymentMethod}
                    onValueChange={(value) =>
                      handleChange("paymentMethod", value as any)
                    }
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Methode wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Überweisung</SelectItem>
                      <SelectItem value="cash">Barzahlung</SelectItem>
                      <SelectItem value="credit_card">Kreditkarte</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="direct_debit">Lastschrift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(invoiceData.paymentStatus === "paid" ||
                  invoiceData.paymentStatus === "partial") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="payment-date">Zahlungsdatum</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !invoiceData.paymentDate &&
                                "text-muted-foreground"
                            )}
                            disabled={readOnly}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {invoiceData.paymentDate ? (
                              format(invoiceData.paymentDate, "PPP", {
                                locale: de,
                              })
                            ) : (
                              <span>Datum wählen</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={invoiceData.paymentDate || undefined}
                            onSelect={(date) =>
                              handleChange("paymentDate", date)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment-amount">
                        Bezahlter Betrag (€)
                      </Label>
                      <Input
                        id="payment-amount"
                        type="number"
                        step="0.01"
                        value={invoiceData.paymentAmount}
                        onChange={(e) =>
                          handleChange(
                            "paymentAmount",
                            Number.parseFloat(e.target.value) || 0
                          )
                        }
                        readOnly={readOnly}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="payment-reference">Zahlungsreferenz</Label>
                  <Input
                    id="payment-reference"
                    value={invoiceData.paymentReference}
                    onChange={(e) =>
                      handleChange("paymentReference", e.target.value)
                    }
                    readOnly={readOnly}
                  />
                </div>

                {invoiceData.paymentStatus === "partial" && (
                  <div className="col-span-2 p-4 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-amber-800">
                      <strong>Hinweis:</strong> Diese Rechnung wurde teilweise
                      bezahlt. Offener Betrag:{" "}
                      {(total - invoiceData.paymentAmount).toFixed(2)} €
                    </p>
                  </div>
                )}

                {invoiceData.paymentStatus === "overdue" && (
                  <div className="col-span-2 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-800">
                      <strong>Hinweis:</strong> Diese Rechnung ist überfällig
                      seit{" "}
                      {invoiceData.paymentDueDate
                        ? format(invoiceData.paymentDueDate, "PPP", {
                            locale: de,
                          })
                        : "unbekannt"}
                      .
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="notes">Notizen</Label>
                <Textarea
                  id="notes"
                  className="min-h-[200px]"
                  value={invoiceData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  readOnly={readOnly}
                  placeholder="Interne Notizen zur Rechnung..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isEmailDialogOpen && (
        <EmailDialog
          open={isEmailDialogOpen}
          onOpenChange={setIsEmailDialogOpen}
          type="rechnung"
          data={invoiceData}
          defaultTo={invoiceData.customer.email}
        />
      )}
    </div>
  );
}
