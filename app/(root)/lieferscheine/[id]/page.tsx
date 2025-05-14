"use client";

import DeliveryStatusDialog from "@/components/delivery-status-dialog";
import EmailDialog from "@/components/email-dialog";
import PdfExportButton from "@/components/pdf-export-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Mail,
  Pencil,
  Truck,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function DeliveryNoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  // Sample data for demonstration
  const document = {
    id: "LS-2025-10001",
    date: "05.02.2025",
    deliveryDate: "07.02.2025",
    customer: {
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
    items: [
      {
        id: 1,
        product: "Mango",
        artNr: "12345",
        quantity: 1,
        price: 15.9,
        total: 15.9,
      },
      {
        id: 2,
        product: "Avocado",
        artNr: "23456",
        quantity: 2,
        price: 12.5,
        total: 25.0,
      },
    ],
    subtotal: 40.9,
    tax: 4.09,
    taxRate: 10,
    total: 44.99,
    processor: "Mohamed Wahba",
    reference: "REF-2025-001",
    orderNumber: "ORD-2025-1234",
    shippingMethod: "standard",
    trackingNumber: "AT12345678",
    notes: "Bitte vor der Lieferung anrufen.",
    status: "shipped",
  };

  const handleStatusChange = (
    status: "prepared" | "shipped" | "delivered",
    trackingNumber: string,
    notes: string
  ) => {
    // In a real app, you would update the status in the database
    toast({
      title: "Status aktualisiert",
      description: `Der Status wurde auf "${
        status === "prepared"
          ? "Vorbereitet"
          : status === "shipped"
          ? "Versendet"
          : "Geliefert"
      }" geändert.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "prepared":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
          >
            <Clock className="h-3 w-3" />
            Vorbereitet
          </Badge>
        );
      case "shipped":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1"
          >
            <Truck className="h-3 w-3" />
            Versendet
          </Badge>
        );
      case "delivered":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            Geliefert
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col md:flex-row max-md:gap-2 md:justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Lieferschein {document.id}</h1>
          <div>{getStatusBadge(document.status)}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowStatusDialog(true)}>
            <Truck className="h-4 w-4 mr-2" />
            Status ändern
          </Button>
          <Button variant="outline" onClick={() => setShowEmailDialog(true)}>
            <Mail className="h-4 w-4 mr-2" />
            Per E-Mail senden
          </Button>
          <PdfExportButton type="lieferschein" data={document} />
          <Button
            onClick={() => router.push(`/lieferscheine/${params.id}/edit`)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Lieferscheindetails</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="allgemein">
            <TabsList className="mb-4">
              <TabsTrigger value="allgemein">Allgemein</TabsTrigger>
              <TabsTrigger value="artikel">Artikel</TabsTrigger>
              <TabsTrigger value="versand">Versand</TabsTrigger>
            </TabsList>

            <TabsContent value="allgemein" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Lieferschein-Nr.
                    </h3>
                    <p>{document.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Datum
                    </h3>
                    <p>{document.date}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Lieferdatum
                    </h3>
                    <p>{document.deliveryDate}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Referenz
                    </h3>
                    <p>{document.reference || "-"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Bestellnummer
                    </h3>
                    <p>{document.orderNumber || "-"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Bearbeiter
                    </h3>
                    <p>{document.processor}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Kunde
                    </h3>
                    <p>{document.customer.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Kunden-Nr.
                    </h3>
                    <p>{document.customer.customerNumber}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      E-Mail
                    </h3>
                    <p>{document.customer.email || "-"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Rechnungsadresse
                    </h3>
                    <p className="whitespace-pre-line">
                      {document.customer.name}
                      <br />
                      {document.customer.address}
                      <br />
                      {document.customer.zip} {document.customer.city}
                      <br />
                      {document.customer.country}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="artikel">
              <div className="space-y-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Pos.</TableHead>
                      <TableHead>Produkt</TableHead>
                      <TableHead>Art.-Nr.</TableHead>
                      <TableHead>Menge</TableHead>
                      <TableHead>Einzelpreis</TableHead>
                      <TableHead>Gesamtsumme</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {document.items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.product}</TableCell>
                        <TableCell>{item.artNr}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>€ {item.price.toFixed(2)}</TableCell>
                        <TableCell>€ {item.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="border-t pt-4 space-y-2 max-w-xs ml-auto">
                  <div className="flex justify-between">
                    <span>Zwischensumme:</span>
                    <span>€ {document.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>MwSt. ({document.taxRate}%):</span>
                    <span>€ {document.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Gesamtbetrag:</span>
                    <span>€ {document.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="versand" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Versandart
                    </h3>
                    <p>
                      {document.shippingMethod === "standard"
                        ? "Standard"
                        : document.shippingMethod === "express"
                        ? "Express"
                        : "Selbstabholung"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Sendungsnummer
                    </h3>
                    <p>{document.trackingNumber || "-"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Status
                    </h3>
                    <p>
                      {document.status === "prepared"
                        ? "Vorbereitet"
                        : document.status === "shipped"
                        ? "Versendet"
                        : "Geliefert"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Anmerkungen
                    </h3>
                    <p className="whitespace-pre-line">
                      {document.notes || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <EmailDialog
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        recipient={document.customer.email}
        subject={`Lieferschein ${document.id}`}
        documentType="lieferschein"
        documentData={document}
      />

      <DeliveryStatusDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        currentStatus={document.status as "prepared" | "shipped" | "delivered"}
        onStatusChange={handleStatusChange}
        trackingNumber={document.trackingNumber}
        notes={document.notes}
      />
    </div>
  );
}
