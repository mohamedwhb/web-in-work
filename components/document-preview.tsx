"use client";
import { ConvertOfferDialog } from "@/components/convert-offer-dialog";
import LogoUpload from "@/components/logo-upload";
import PdfExportButton from "@/components/pdf-export-button";
import SignaturePad from "@/components/signature-pad";
import StatusChangeDialog from "@/components/status-change-dialog";
import TemplateSelector from "@/components/template-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DocumentData, DocumentType } from "@/lib/pdf-generator";
import { getDefaultTemplate } from "@/lib/templates";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Clock,
  FileText,
  ImageIcon,
  Palette,
  PenTool,
  Printer,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DocumentPreviewProps {
  type: DocumentType;
  data: DocumentData;
  onBack: () => void;
}

export default function DocumentPreview({
  type,
  data,
  onBack,
}: DocumentPreviewProps) {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [documentData, setDocumentData] = useState<DocumentData>(data);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);

  // Load company logo from localStorage on component mount
  useEffect(() => {
    const savedLogo = localStorage.getItem("companyLogo");
    if (savedLogo) {
      setDocumentData((prev) => ({
        ...prev,
        companyLogo: savedLogo,
      }));
    }
  }, []);

  const documentTitle = {
    angebot: "Angebot",
    rechnung: "Rechnung",
    lieferschein: "Lieferschein",
  }[type];

  const addressLabel =
    type === "lieferschein" ? "Lieferadresse" : "Rechnungsadresse";

  const handlePrint = () => {
    window.print();
  };

  const handleTemplateChange = (template: any) => {
    setDocumentData({
      ...documentData,
      template,
    });
  };

  const handleSignatureSave = (signatureData: string) => {
    setDocumentData({
      ...documentData,
      signature: signatureData,
    });
    setShowSignaturePad(false);
  };

  const handleLogoSave = (logoData: string) => {
    setDocumentData({
      ...documentData,
      companyLogo: logoData,
    });
    setShowLogoUpload(false);
  };

  const handleStatusChange = (
    status: "open" | "accepted" | "rejected",
    note: string
  ) => {
    setDocumentData({
      ...documentData,
      status,
      statusDate: new Date().toISOString().split("T")[0],
      statusNote: note || documentData.statusNote,
    });
  };

  return (
    <div className="space-y-6 print:p-0">
      <div className="flex flex-wrap max-md:gap-2 justify-between items-center print:hidden">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <div className="flex flex-wrap max-md:justify-center gap-2">
          <Dialog
            open={showTemplateSelector}
            onOpenChange={setShowTemplateSelector}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Palette className="h-4 w-4 mr-2" />
                Vorlage
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <TemplateSelector
                selectedTemplate={documentData.template || getDefaultTemplate()}
                onSelectTemplate={handleTemplateChange}
                onClose={() => setShowTemplateSelector(false)}
              />
            </DialogContent>
          </Dialog>

          {type === "angebot" && data.status === "accepted" && (
            <Button
              variant="outline"
              onClick={() => setIsConvertDialogOpen(true)}
            >
              <FileText className="mr-2 h-4 w-4" />
              In Rechnung umwandeln
            </Button>
          )}

          <Dialog open={showSignaturePad} onOpenChange={setShowSignaturePad}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <PenTool className="h-4 w-4 mr-2" />
                Unterschrift
              </Button>
            </DialogTrigger>
            <DialogContent>
              <SignaturePad
                onSave={handleSignatureSave}
                onCancel={() => setShowSignaturePad(false)}
                initialSignature={documentData.signature}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={showLogoUpload} onOpenChange={setShowLogoUpload}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ImageIcon className="h-4 w-4 mr-2" />
                Logo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <LogoUpload
                onSave={handleLogoSave}
                onCancel={() => setShowLogoUpload(false)}
                initialLogo={documentData.companyLogo}
              />
            </DialogContent>
          </Dialog>

          {type === "angebot" && (
            <Button variant="outline" onClick={() => setShowStatusDialog(true)}>
              <Clock className="h-4 w-4 mr-2" />
              Status ändern
            </Button>
          )}

          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Drucken
          </Button>
          <PdfExportButton type={type} data={documentData} />
        </div>
      </div>

      <Card className="print:shadow-none print:border-0">
        <CardHeader className="print:pb-0">
          <div className="flex justify-between">
            <div>
              <CardTitle className="text-xl">
                {documentTitle} {documentData.id}
              </CardTitle>
              {type === "angebot" && data.status && (
                <div className="flex items-center mt-1">
                  <div
                    className={cn(
                      "px-2 py-0.5 text-xs rounded-full",
                      data.status === "open"
                        ? "bg-blue-100 text-blue-800"
                        : data.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    )}
                  >
                    {data.status === "open"
                      ? "Offen"
                      : data.status === "accepted"
                      ? "Angenommen"
                      : "Abgelehnt"}
                  </div>
                  {data.statusDate && (
                    <span className="text-xs text-muted-foreground ml-2">
                      seit{" "}
                      {new Date(data.statusDate).toLocaleDateString("de-DE")}
                    </span>
                  )}
                </div>
              )}
              <div className="text-sm text-muted-foreground mt-1">
                Datum: {documentData.date}
              </div>
              {documentData.reference && (
                <div className="text-sm text-muted-foreground">
                  Referenz: {documentData.reference}
                </div>
              )}
              {documentData.period && (
                <div className="text-sm text-muted-foreground">
                  Leistungszeitraum: {documentData.period}
                </div>
              )}
              {documentData.processor && (
                <div className="text-sm text-muted-foreground">
                  Bearbeiter: {documentData.processor}
                </div>
              )}
            </div>
            <div className="text-right">
              {documentData.companyLogo ? (
                <div className="mb-2">
                  <img
                    src={documentData.companyLogo || "/placeholder.svg"}
                    alt="Firmenlogo"
                    className="max-h-16 max-w-[200px] ml-auto"
                  />
                </div>
              ) : null}
              <div className="font-bold">KMW GmbH</div>
              <div className="text-sm">Puchsbaumgasse 1</div>
              <div className="text-sm">1100 Wien</div>
              <div className="text-sm">0676123456789</div>
              <div className="text-sm">office@kmw.at</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 print:pt-4">
          <div className="flex flex-col md:flex-row gap-6 md:gap-12">
            <div>
              <h3 className="font-medium text-sm mb-2">{addressLabel}:</h3>
              <div>{documentData.customer.name}</div>
              <div>{documentData.customer.address}</div>
              <div>
                {documentData.customer.zip} {documentData.customer.city}
              </div>
              <div>{documentData.customer.country}</div>
            </div>
            <div>
              <h3 className="font-medium text-sm mb-2">Kundeninfo</h3>
              {documentData.customer.customerNumber && (
                <div>Kunden-Nr.: {documentData.customer.customerNumber}</div>
              )}
              {documentData.customer.vatId && (
                <div>UID-Nr.: {documentData.customer.vatId}</div>
              )}
              {documentData.customer.taxId && (
                <div>Steuer-Nr.: {documentData.customer.taxId}</div>
              )}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Pos.</TableHead>
                <TableHead>Produkt</TableHead>
                <TableHead className="text-right">Menge</TableHead>
                <TableHead className="text-right">Einzelpreis</TableHead>
                <TableHead className="text-right">Gesamtsumme</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentData.items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <div>
                      <div>{item.product}</div>
                      <div className="text-xs text-muted-foreground">
                        Art.-Nr.: {item.artNr}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    € {item.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    € {item.total.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col items-end space-y-2">
            <div className="flex justify-between w-48">
              <span>Zwischensumme:</span>
              <span>€ {documentData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-48">
              <span>MwSt. ({documentData.taxRate}%):</span>
              <span>€ {documentData.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-48 font-bold">
              <span>Gesamtbetrag:</span>
              <span>€ {documentData.total.toFixed(2)}</span>
            </div>
          </div>

          {type === "rechnung" && (
            <div className="border-t pt-4">
              <p className="mb-4">
                Bitte überweisen Sie den Rechnungsbetrag innerhalb von 14 Tagen
                auf das unten angegebene Konto.
              </p>
              {documentData.bankDetails && (
                <>
                  <h3 className="font-medium mb-2">Bankverbindung</h3>
                  <p className="text-sm">
                    Empfänger: {documentData.bankDetails.recipient} - Institut:{" "}
                    {documentData.bankDetails.institute} - Referenz:{" "}
                    {documentData.bankDetails.reference}
                    <br />
                    IBAN: {documentData.bankDetails.iban} - BIC:{" "}
                    {documentData.bankDetails.bic}
                  </p>
                </>
              )}
              <p className="mt-4 font-medium">Vielen Dank!</p>
            </div>
          )}

          {documentData.bankDetails && type !== "rechnung" && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Bankverbindung</h3>
              <p className="text-sm">
                Empfänger: {documentData.bankDetails.recipient} - Institut:{" "}
                {documentData.bankDetails.institute} - Referenz:{" "}
                {documentData.bankDetails.reference}
                <br />
                IBAN: {documentData.bankDetails.iban} - BIC:{" "}
                {documentData.bankDetails.bic}
              </p>
            </div>
          )}

          {documentData.signature && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Unterschrift</h3>
              <div className="flex justify-between items-end">
                <div className="max-w-[200px]">
                  <img
                    src={documentData.signature || "/placeholder.svg"}
                    alt="Unterschrift"
                    className="max-h-20"
                  />
                </div>
                <div className="border-t border-gray-300 w-40 text-center">
                  <p className="text-xs text-muted-foreground mt-1">
                    Datum, Unterschrift
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {isConvertDialogOpen && (
        <ConvertOfferDialog
          open={isConvertDialogOpen}
          onClose={() => setIsConvertDialogOpen(false)}
          offerId={data.id}
        />
      )}
      {type === "angebot" && (
        <StatusChangeDialog
          open={showStatusDialog}
          onOpenChange={setShowStatusDialog}
          currentStatus={
            (documentData.status as "open" | "accepted" | "rejected") || "open"
          }
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
