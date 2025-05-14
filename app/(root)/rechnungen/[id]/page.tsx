"use client";

import { ArticleManagement } from "@/components/article-management";
import EmailDialog from "@/components/email-dialog";
import { PaymentQrCode } from "@/components/payment-qr-code";
import PaymentStatusDialog from "@/components/payment-status-dialog";
import PdfPreview from "@/components/pdf-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { InvoiceData, PaymentStatus } from "@/lib/invoice-types";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  ArrowLeft,
  CreditCard,
  FileText,
  Pencil,
  Send,
  Trash2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Mock-Daten für die Rechnung
const mockInvoice: InvoiceData = {
  id: "RE-230501-001",
  date: new Date(2023, 4, 1),
  customer: {
    id: "1",
    name: "Musterfirma GmbH",
    address: "Musterstraße 123\n1010 Wien\nÖsterreich",
    email: "office@musterfirma.at",
    phone: "+43 1 234567",
    taxId: "ATU12345678",
  },
  items: [
    {
      id: "1",
      name: "Mango",
      description: "Frische Bio-Mangos aus kontrolliertem Anbau",
      quantity: 5,
      price: 15.9,
      unit: "Kg",
    },
    {
      id: "2",
      name: "Avocado",
      description: "Reife Hass-Avocados",
      quantity: 3,
      price: 12.5,
      unit: "Kg",
    },
    {
      id: "3",
      name: "Kartoffel",
      description: "Festkochende Kartoffeln aus regionalem Anbau",
      quantity: 10,
      price: 5.2,
      unit: "Kg",
    },
  ],
  notes: "Vielen Dank für Ihren Auftrag!",
  paymentTerms: "14 Tage",
  paymentStatus: "unpaid",
  paymentMethod: "bank_transfer",
  paymentDueDate: new Date(2023, 4, 15),
  paymentDate: null,
  paymentAmount: 0,
  paymentReference: "RE-230501-001",
  offerReference: "AN-230415-001",
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const router = useRouter();
  const { toast } = useToast();

  // Lade Rechnungsdaten
  useEffect(() => {
    // In einer echten Anwendung würden wir hier die Daten von der API laden
    // Für dieses Beispiel verwenden wir die Mock-Daten
    setTimeout(() => {
      setInvoice(mockInvoice);
      setIsLoading(false);
    }, 500);
  }, [params.id]);

  // Berechne Gesamtbeträge
  const subtotal =
    invoice?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
    0;
  const taxAmount = subtotal * 0.2; // 20% MwSt.
  const total = subtotal + taxAmount;

  // Zahlungsstatus ändern
  const handlePaymentStatusChange = (
    newStatus: PaymentStatus,
    paymentData?: any
  ) => {
    if (!invoice) return;

    const updatedInvoice = {
      ...invoice,
      paymentStatus: newStatus,
      ...(paymentData && {
        paymentDate: paymentData.date || null,
        paymentAmount: paymentData.amount || 0,
        paymentMethod: paymentData.method || invoice.paymentMethod,
        paymentReference: paymentData.reference || invoice.paymentReference,
      }),
    };

    setInvoice(updatedInvoice);
    toast({
      title: "Zahlungsstatus aktualisiert",
      description: `Der Zahlungsstatus wurde auf "${getPaymentStatusText(
        newStatus
      )}" geändert.`,
    });
  };

  // Rechnung löschen
  const handleDelete = () => {
    if (confirm("Sind Sie sicher, dass Sie diese Rechnung löschen möchten?")) {
      toast({
        title: "Rechnung gelöscht",
        description: `Rechnung ${params.id} wurde gelöscht.`,
      });
      router.push("/rechnungen");
    }
  };

  // Rechnung bearbeiten
  const handleEdit = () => {
    router.push(`/rechnungen/${params.id}/edit`);
  };

  // Rechnung per E-Mail senden
  const handleSendEmail = () => {
    setIsEmailDialogOpen(true);
  };

  // Zahlungsstatus-Dialog öffnen
  const handleOpenPaymentDialog = () => {
    setIsPaymentDialogOpen(true);
  };

  // Zahlungsstatus-Text abrufen
  const getPaymentStatusText = (status: PaymentStatus) => {
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

  // Zahlungsstatus-Badge-Variante abrufen
  const getPaymentStatusBadge = (status: PaymentStatus) => {
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

  // Zahlungsmethode-Text abrufen
  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "bank_transfer":
        return "Überweisung";
      case "cash":
        return "Barzahlung";
      case "credit_card":
        return "Kreditkarte";
      case "paypal":
        return "PayPal";
      case "direct_debit":
        return "Lastschrift";
      default:
        return method;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-4"></div>
        <div className="h-64 bg-muted animate-pulse rounded"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Rechnung nicht gefunden</h1>
        <p>Die angeforderte Rechnung konnte nicht gefunden werden.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/rechnungen")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Button>
      </div>
    );
  }

  // Zeige QR-Code nur für unbezahlte oder teilweise bezahlte Rechnungen
  const showQrCode =
    invoice.paymentStatus === "unpaid" ||
    invoice.paymentStatus === "partial" ||
    invoice.paymentStatus === "overdue";

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/rechnungen")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Rechnung: {invoice.id}</h1>
          <Badge
            variant={getPaymentStatusBadge(invoice.paymentStatus) as any}
            className="ml-2"
          >
            {getPaymentStatusText(invoice.paymentStatus)}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setActiveTab("pdf")}
            className="flex-1 sm:flex-auto"
          >
            <FileText className="mr-2 h-4 w-4" />
            PDF-Vorschau
          </Button>
          <Button
            variant="outline"
            onClick={handleSendEmail}
            className="flex-1 sm:flex-auto"
          >
            <Send className="mr-2 h-4 w-4" />
            E-Mail
          </Button>
          <Button
            variant="outline"
            onClick={handleOpenPaymentDialog}
            className="flex-1 sm:flex-auto"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Zahlung
          </Button>
          <Button
            variant="outline"
            onClick={handleEdit}
            className="flex-1 sm:flex-auto"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Bearbeiten
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="flex-1 sm:flex-auto text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Löschen
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full flex justify-start flex-wrap h-auto w-fit">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="items">Positionen</TabsTrigger>
          <TabsTrigger value="payment">Zahlung</TabsTrigger>
          <TabsTrigger value="history">Verlauf</TabsTrigger>
          <TabsTrigger value="pdf">PDF-Vorschau</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rechnungsinformationen</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <dt className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Rechnungsnummer
                  </dt>
                  <dd className="text-xs sm:text-sm">{invoice.id}</dd>

                  <dt className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Rechnungsdatum
                  </dt>
                  <dd className="text-xs sm:text-sm">
                    {format(invoice.date, "dd.MM.yyyy", { locale: de })}
                  </dd>

                  <dt className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Fälligkeitsdatum
                  </dt>
                  <dd className="text-xs sm:text-sm">
                    {format(invoice.paymentDueDate, "dd.MM.yyyy", {
                      locale: de,
                    })}
                  </dd>

                  <dt className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Zahlungsbedingungen
                  </dt>
                  <dd className="text-xs sm:text-sm">{invoice.paymentTerms}</dd>

                  {invoice.offerReference && (
                    <>
                      <dt className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Angebotsnummer
                      </dt>
                      <dd className="text-xs sm:text-sm">
                        {invoice.offerReference}
                      </dd>
                    </>
                  )}
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kundeninformationen</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-y-2">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Name
                  </dt>
                  <dd className="text-sm">{invoice.customer.name}</dd>

                  <dt className="text-sm font-medium text-muted-foreground">
                    Adresse
                  </dt>
                  <dd className="text-sm whitespace-pre-line">
                    {invoice.customer.address}
                  </dd>

                  <dt className="text-sm font-medium text-muted-foreground">
                    E-Mail
                  </dt>
                  <dd className="text-sm">{invoice.customer.email}</dd>

                  <dt className="text-sm font-medium text-muted-foreground">
                    Telefon
                  </dt>
                  <dd className="text-sm">{invoice.customer.phone}</dd>

                  {invoice.customer.taxId && (
                    <>
                      <dt className="text-sm font-medium text-muted-foreground">
                        UID-Nummer
                      </dt>
                      <dd className="text-sm">{invoice.customer.taxId}</dd>
                    </>
                  )}
                </dl>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Zusammenfassung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
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

            {invoice.notes && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Notizen</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{invoice.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items">
          <Card>
            <CardContent className="pt-6">
              <ArticleManagement
                items={invoice.items.map((item) => ({
                  id: item.id,
                  product: item.name,
                  name: item.name,
                  description: item.description || "",
                  quantity: item.quantity,
                  price: item.price,
                  unit: item.unit || "Stück",
                  total: item.quantity * item.price,
                }))}
                onItemsChange={() => {}} // Nur Anzeige, keine Änderungen
                products={[]}
                readOnly={true}
                showTax={true}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Zahlungsinformationen</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Status
                  </dt>
                  <dd className="text-sm">
                    <Badge
                      variant={
                        getPaymentStatusBadge(invoice.paymentStatus) as any
                      }
                    >
                      {getPaymentStatusText(invoice.paymentStatus)}
                    </Badge>
                  </dd>

                  <dt className="text-sm font-medium text-muted-foreground">
                    Zahlungsmethode
                  </dt>
                  <dd className="text-sm">
                    {getPaymentMethodText(invoice.paymentMethod)}
                  </dd>

                  <dt className="text-sm font-medium text-muted-foreground">
                    Fälligkeitsdatum
                  </dt>
                  <dd className="text-sm">
                    {format(invoice.paymentDueDate, "dd.MM.yyyy", {
                      locale: de,
                    })}
                  </dd>

                  {invoice.paymentDate && (
                    <>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Zahlungsdatum
                      </dt>
                      <dd className="text-sm">
                        {format(invoice.paymentDate, "dd.MM.yyyy", {
                          locale: de,
                        })}
                      </dd>
                    </>
                  )}

                  {invoice.paymentAmount > 0 && (
                    <>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Bezahlter Betrag
                      </dt>
                      <dd className="text-sm">
                        {invoice.paymentAmount.toFixed(2)} €
                      </dd>
                    </>
                  )}

                  {invoice.paymentReference && (
                    <>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Zahlungsreferenz
                      </dt>
                      <dd className="text-sm">{invoice.paymentReference}</dd>
                    </>
                  )}
                </dl>

                {invoice.paymentStatus === "partial" && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-amber-800">
                      <strong>Hinweis:</strong> Diese Rechnung wurde teilweise
                      bezahlt. Offener Betrag:{" "}
                      {(total - invoice.paymentAmount).toFixed(2)} €
                    </p>
                  </div>
                )}

                {invoice.paymentStatus === "overdue" && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-800">
                      <strong>Hinweis:</strong> Diese Rechnung ist überfällig
                      seit{" "}
                      {format(invoice.paymentDueDate, "dd.MM.yyyy", {
                        locale: de,
                      })}
                      .
                    </p>
                  </div>
                )}

                <Button
                  className="mt-4 w-full"
                  onClick={handleOpenPaymentDialog}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Zahlungsstatus aktualisieren
                </Button>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bankverbindung</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-y-2">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Empfänger
                    </dt>
                    <dd className="text-sm">KMW Business GmbH</dd>

                    <dt className="text-sm font-medium text-muted-foreground">
                      Bank
                    </dt>
                    <dd className="text-sm">Musterbank AG</dd>

                    <dt className="text-sm font-medium text-muted-foreground">
                      IBAN
                    </dt>
                    <dd className="text-sm">AT12 3456 7890 1234 5678</dd>

                    <dt className="text-sm font-medium text-muted-foreground">
                      BIC
                    </dt>
                    <dd className="text-sm">MUBAATWW</dd>

                    <dt className="text-sm font-medium text-muted-foreground">
                      Verwendungszweck
                    </dt>
                    <dd className="text-sm">{invoice.id}</dd>
                  </dl>
                </CardContent>
              </Card>

              {showQrCode && (
                <PaymentQrCode
                  recipient="KMW Business GmbH"
                  iban="AT12 3456 7890 1234 5678"
                  amount={
                    invoice.paymentStatus === "partial"
                      ? total - invoice.paymentAmount
                      : total
                  }
                  reference={invoice.id}
                  info="Rechnung"
                  bic="MUBAATWW"
                />
              )}
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Rechnungsverlauf</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.paymentDate && (
                  <div className="flex items-start gap-4">
                    <div className="min-w-[100px] text-sm text-muted-foreground">
                      {format(invoice.paymentDate, "dd.MM.yyyy", {
                        locale: de,
                      })}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Zahlung eingegangen</p>
                      <p className="text-sm text-muted-foreground">
                        Zahlungseingang von {invoice.paymentAmount.toFixed(2)} €
                        per {getPaymentMethodText(invoice.paymentMethod)}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className="min-w-[100px] text-sm text-muted-foreground">
                    {format(new Date(2023, 4, 2), "dd.MM.yyyy", { locale: de })}
                  </div>
                  <div>
                    <p className="text-sm font-medium">E-Mail gesendet</p>
                    <p className="text-sm text-muted-foreground">
                      Rechnung per E-Mail an {invoice.customer.email} gesendet
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="min-w-[100px] text-sm text-muted-foreground">
                    {format(new Date(2023, 4, 1), "dd.MM.yyyy", { locale: de })}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Rechnung erstellt</p>
                    <p className="text-sm text-muted-foreground">
                      Rechnung {invoice.id} wurde erstellt
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PDF Preview Tab */}
        <TabsContent value="pdf">
          <Card>
            <CardContent className="p-0">
              {invoice && (
                <PdfPreview
                  type="rechnung"
                  data={{
                    id: invoice.id,
                    date: format(invoice.date, "yyyy-MM-dd"),
                    customer: {
                      name: invoice.customer.name,
                      address: invoice.customer.address.split("\n")[0] || "",
                      city:
                        invoice.customer.address
                          .split("\n")[1]
                          ?.split(" ")[1] || "",
                      zip:
                        invoice.customer.address
                          .split("\n")[1]
                          ?.split(" ")[0] || "",
                      country:
                        invoice.customer.address.split("\n")[2] ||
                        "Deutschland",
                      email: invoice.customer.email,
                      taxId: invoice.customer.taxId,
                    },
                    items: invoice.items.map((item) => ({
                      id: Number(item.id),
                      product: item.name,
                      artNr: item.id,
                      quantity: item.quantity,
                      price: item.price,
                      total: item.quantity * item.price,
                    })),
                    subtotal: subtotal,
                    tax: taxAmount,
                    taxRate: 20,
                    total: total,
                    reference: invoice.offerReference,
                    processor: "System",
                    bankDetails: {
                      recipient: "KMW Business GmbH",
                      institute: "Musterbank AG",
                      iban: "AT12 3456 7890 1234 5678",
                      bic: "MUBAATWW",
                      reference: invoice.id,
                    },
                  }}
                  onClose={() => setActiveTab("details")}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isEmailDialogOpen && (
        <EmailDialog
          open={isEmailDialogOpen}
          onOpenChange={setIsEmailDialogOpen}
          type="rechnung"
          data={invoice}
          defaultTo={invoice.customer.email}
        />
      )}

      {isPaymentDialogOpen && (
        <PaymentStatusDialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          currentStatus={invoice.paymentStatus}
          onStatusChange={handlePaymentStatusChange}
          invoiceTotal={total}
          currentPaymentAmount={invoice.paymentAmount}
          currentPaymentMethod={invoice.paymentMethod}
          currentPaymentReference={invoice.paymentReference}
        />
      )}
    </div>
  );
}
