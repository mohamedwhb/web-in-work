"use client";

import DeliveryNoteToolbar, {
  ViewMode,
} from "@/components/delivery-note-toolbar";
import EmailDialog from "@/components/email-dialog";
import StatusChangeDialog from "@/components/status-change-dialog";
import {
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import type { PaymentStatus } from "@/lib/invoice-types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@radix-ui/react-alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  Clock,
  Download,
  FileDown,
  FileText,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

// Mock invoice data for demonstration
const mockInvoices = [
  {
    id: "RE-230501-001",
    date: new Date(2023, 4, 1),
    customer: {
      name: "Musterfirma GmbH",
    },
    total: 599.94,
    paymentStatus: "paid" as PaymentStatus,
    paymentDueDate: new Date(2023, 4, 15),
  },
  {
    id: "RE-230510-002",
    date: new Date(2023, 4, 10),
    customer: {
      name: "Max Mustermann",
    },
    total: 249.95,
    paymentStatus: "unpaid" as PaymentStatus,
    paymentDueDate: new Date(2023, 4, 24),
  },
  {
    id: "RE-230515-003",
    date: new Date(2023, 4, 15),
    customer: {
      name: "Beispiel AG",
    },
    total: 1299.99,
    paymentStatus: "partial" as PaymentStatus,
    paymentDueDate: new Date(2023, 5, 15),
  },
  {
    id: "RE-230520-004",
    date: new Date(2023, 4, 20),
    customer: {
      name: "Test GmbH",
    },
    total: 499.5,
    paymentStatus: "overdue" as PaymentStatus,
    paymentDueDate: new Date(2023, 5, 3),
  },
];

export default function InvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Toolbar and filter state
  const [filters, setFilters] = useState({
    status: null,
    dateRange: null,
    search: "",
    sortBy: "date",
    sortOrder: "desc",
    shippingMethod: null,
    minTotal: null,
    maxTotal: null,
    processor: null,
  });
  const [visibleColumns, setVisibleColumns] = useState([
    "date",
    "customer",
    "total",
    "status",
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // Invoice state
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const [exportFormat, setExportFormat] = useState<"pdf" | "csv" | "excel">(
    "pdf"
  );

  // View and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const [statusFilter, setStatusFilter] = useState<"all" | PaymentStatus>(
    "all"
  );

  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);

  // Filter invoices based on search term and active tab
  const filteredInvoices = useMemo(() => {
    return mockInvoices.filter((inv) => {
      const matchesSearch =
        inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
      return (
        (activeTab === "all" || inv.paymentStatus === activeTab) &&
        matchesSearch
      );
    });
  }, [searchTerm, activeTab]);

  // Sort handler
  const handleSortChange = (field: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  // Sorted invoices
  const sortedInvoices = useMemo(() => {
    const sorted = [...filteredInvoices].sort((a, b) => {
      const { sortBy, sortOrder } = filters;
      let aVal: any = a[sortBy as keyof typeof a];
      let bVal: any = b[sortBy as keyof typeof b];
      if (aVal instanceof Date && bVal instanceof Date)
        (aVal = aVal.getTime()), (bVal = bVal.getTime());
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredInvoices, filters]);

  // Pagination
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedInvoices.slice(start, start + itemsPerPage);
  }, [sortedInvoices, currentPage, itemsPerPage]);

  // Get status badge color
  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Bezahlt</Badge>;
      case "partial":
        return <Badge className="bg-amber-500">Teilweise bezahlt</Badge>;
      case "unpaid":
        return <Badge className="bg-blue-500">Unbezahlt</Badge>;
      case "overdue":
        return <Badge className="bg-red-500">Überfällig</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-500">Storniert</Badge>;
      default:
        return <Badge>Unbekannt</Badge>;
    }
  };

  // Selection toggle
  const toggleItemSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Batch handlers
  const handleBatchPrint = () => {
    console.log("Print", selectedItems);
  };
  const handleBatchEmail = () => {
    console.log("Email", selectedItems);
  };

  const handleBatchStatusUpdate = (status: PaymentStatus) => {
    // In a real app, you would update the status of the selected items
    toast({
      title: "Status aktualisiert",
      description: `${selectedItems.length} Rechnungen wurden auf "${
        status === "paid"
          ? "Bezahlt"
          : status === "unpaid"
          ? "Unbezahlt"
          : status === "overdue"
          ? "Überfällig"
          : status === "partial"
          ? "Teilweise bezahlt"
          : "Storniert"
      }" gesetzt.`,
    });
    setShowStatusDialog(false);
  };

  // Handle batch export
  const handleBatchExport = () => {
    // In a real app, you would export the selected items
    toast({
      title: `Rechnungen als ${exportFormat.toUpperCase()} exportiert`,
      description: `${selectedItems.length} Rechnungen wurden erfolgreich exportiert.`,
    });
    setShowExportDialog(false);
  };

  // Handle document deletion
  const handleDeleteDocument = (docId: string) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== docId));

      toast({
        title: "Angebot gelöscht",
        description: `Angebot ${docId} wurde erfolgreich gelöscht.`,
      });

      setIsLoading(false);
      setShowDeleteDialog(false);
      setDocumentToDelete(null);
    }, 500);
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === paginatedInvoices.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedInvoices.map((doc) => doc.id));
    }
  };

  // Toolbar columns
  const DeliveryNoteToolbarItems = [
    { id: "show-customer", column: "customer", label: "Kunde" },
    { id: "show-date", column: "date", label: "Datum" },
    { id: "show-status", column: "status", label: "Status" },
    { id: "show-total", column: "total", label: "Summe" },
  ];

  const renderListView = () => {
    return (
      <div className="overflow-y-auto max-h-[calc(100dvh-16rem)]">
        {paginatedInvoices.map((invoice) => (
          <div
            key={invoice.id}
            className={`border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
              selectedItems.includes(invoice.id) ? "bg-primary/5" : ""
            }`}
          >
            <div className="flex flex-col md:flex-row">
              <div className="p-4 flex-1 flex items-start gap-3">
                <Checkbox
                  checked={selectedItems.includes(invoice.id)}
                  onCheckedChange={() => toggleItemSelection(invoice.id)}
                  aria-label={`Rechnung ${invoice.id} auswählen`}
                />
                <div>
                  <div className="font-medium">Rechnung {invoice.id}</div>
                  <div className="text-sm text-muted-foreground">
                    {invoice.customer.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Datum: {format(invoice.date, "dd.MM.yyyy", { locale: de })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Summe: €{invoice.total.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="p-4 flex flex-col justify-center items-end gap-2">
                <div className="flex flex-wrap gap-2">
                  {getStatusBadge(invoice.paymentStatus)}
                </div>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/rechnungen/${invoice.id}`)
                          }
                        >
                          Anzeigen
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Vorschau anzeigen</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {/* Place for additional menu actions */}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderGridView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-1">
        {paginatedInvoices.map((invoice) => (
          <Card
            key={invoice.id}
            className={
              selectedItems.includes(invoice.id) ? "border-primary" : ""
            }
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium">Rechnung {invoice.id}</h3>
                  <p className="text-sm text-muted-foreground">
                    {invoice.customer.name}
                  </p>
                </div>
                <Checkbox
                  checked={selectedItems.includes(invoice.id)}
                  onCheckedChange={() => toggleItemSelection(invoice.id)}
                />
              </div>

              <div className="space-y-2 mb-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Datum:</span>
                  <span>
                    {format(invoice.date, "dd.MM.yyyy", { locale: de })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Summe:</span>
                  <span>€{invoice.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {getStatusBadge(invoice.paymentStatus)}
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/rechnungen/${invoice.id}`)}
                >
                  Anzeigen
                </Button>
                {/* Place for additional menu actions */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderCompactView = () => {
    return (
      <div className="overflow-x-auto">
        <table className="border-collapse w-full">
          <thead>
            <tr className="bg-muted">
              <th className="p-2 text-left">
                <Checkbox
                  checked={
                    selectedItems.length === paginatedInvoices.length &&
                    paginatedInvoices.length > 0
                  }
                  onCheckedChange={() => {
                    const allIds = paginatedInvoices.map((i) => i.id);
                    setSelectedItems((prev) =>
                      prev.length === allIds.length ? [] : allIds
                    );
                  }}
                />
              </th>
              {visibleColumns.includes("customer") && (
                <th className="p-2 text-left">Kunde</th>
              )}
              {visibleColumns.includes("date") && (
                <th className="p-2 text-left">Datum</th>
              )}
              {visibleColumns.includes("status") && (
                <th className="p-2 text-left">Status</th>
              )}
              {visibleColumns.includes("total") && (
                <th className="p-2 text-left">Summe</th>
              )}
              <th className="p-2 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInvoices.map((invoice) => (
              <tr
                key={invoice.id}
                className={`border-b hover:bg-muted/50 ${
                  selectedItems.includes(invoice.id) ? "bg-primary/5" : ""
                }`}
              >
                <td className="p-2">
                  <Checkbox
                    checked={selectedItems.includes(invoice.id)}
                    onCheckedChange={() => toggleItemSelection(invoice.id)}
                  />
                </td>
                {visibleColumns.includes("customer") && (
                  <td className="p-2">{invoice.customer.name}</td>
                )}
                {visibleColumns.includes("date") && (
                  <td className="p-2">
                    {format(invoice.date, "dd.MM.yyyy", { locale: de })}
                  </td>
                )}
                {visibleColumns.includes("status") && (
                  <td className="p-2">
                    {getStatusBadge(invoice.paymentStatus)}
                  </td>
                )}
                {visibleColumns.includes("total") && (
                  <td className="p-2">€{invoice.total.toFixed(2)}</td>
                )}
                <td className="p-2 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/rechnungen/${invoice.id}`)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  {/* Place for additional menu actions */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Rechnungen</h1>
        <Link href="/rechnungen/neu">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Neue Rechnung
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Suche nach Rechnungsnummer oder Kunde..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setStatusFilter("all");
            setCurrentPage(1);
          }}
        >
          Alle
        </Button>
        <Button
          variant={statusFilter === "unpaid" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setStatusFilter("unpaid");
            setCurrentPage(1);
          }}
          className={statusFilter === "unpaid" ? "" : "text-blue-600"}
        >
          <Clock className="h-4 w-4 mr-1" /> Unbezahlt
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExportDialog(true)}
          >
            <FileDown className="h-4 w-4 mr-2" /> Exportieren
          </Button>
        </div>
      </div>

      <DeliveryNoteToolbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        setCurrentPage={setCurrentPage}
        handleSortChange={handleSortChange}
        documents={filteredInvoices}
        setVisibleColumns={setVisibleColumns}
        visibleColumns={visibleColumns}
        selectedItems={selectedItems}
        setShowStatusDialog={setShowStatusDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        setShowExportDialog={setShowExportDialog}
        handleBatchPrint={handleBatchPrint}
        handleBatchEmail={handleBatchEmail}
        DeliveryNoteToolbarItems={DeliveryNoteToolbarItems}
        filters={filters}
        setFilters={setFilters}
        searchParams={searchParams}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap justify-start h-auto">
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="unpaid">Unbezahlt</TabsTrigger>
          <TabsTrigger value="partial">Teilweise bezahlt</TabsTrigger>
          <TabsTrigger value="paid">Bezahlt</TabsTrigger>
          <TabsTrigger value="overdue">Überfällig</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-medium text-muted-foreground">
                Keine Rechnungen gefunden
              </p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b flex items-center">
                <Checkbox
                  checked={
                    selectedItems.length === paginatedInvoices.length &&
                    paginatedInvoices.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Alle Rechnungen auswählen"
                  className="mr-4"
                />
                <div className="text-sm font-medium">
                  {selectedItems.length > 0
                    ? `${selectedItems.length} von ${filteredInvoices.length} ausgewählt`
                    : `${filteredInvoices.length} Rechnungen`}
                </div>
              </div>

              {viewMode === "grid" && renderGridView()}
              {viewMode === "list" && renderListView()}
              {viewMode === "compact" && renderCompactView()}
            </>
          )}

          <StatusChangeDialog
            open={showStatusDialog}
            onOpenChange={setShowStatusDialog}
            currentStatus="open"
            onStatusChange={handleBatchStatusUpdate}
          />

          {/* Export dialog */}
          {/* Fixme */}
          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rechnungen exportieren</DialogTitle>
                <DialogDescription>
                  Wählen Sie das Format für den Export von{" "}
                  {selectedItems.length} Rechnungenn.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Exportformat</h3>
                  <Tabs
                    value={exportFormat}
                    onValueChange={(value) => setExportFormat(value as any)}
                  >
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="pdf">PDF</TabsTrigger>
                      <TabsTrigger value="csv">CSV</TabsTrigger>
                      <TabsTrigger value="excel">Excel</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pdf" className="pt-4">
                      <p className="text-sm text-muted-foreground">
                        Exportiert die Rechnungen als PDF-Dokumente. Ideal für
                        den Druck oder die Weitergabe an Kunden.
                      </p>
                    </TabsContent>
                    <TabsContent value="csv" className="pt-4">
                      <p className="text-sm text-muted-foreground">
                        Exportiert die Lieferscheindaten als CSV-Datei. Ideal
                        für die Weiterverarbeitung in Tabellenkalkulationen.
                      </p>
                    </TabsContent>
                    <TabsContent value="excel" className="pt-4">
                      <p className="text-sm text-muted-foreground">
                        Exportiert die Lieferscheindaten als Excel-Datei. Ideal
                        für die Weiterverarbeitung mit erweiterten Funktionen.
                      </p>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowExportDialog(false)}
                >
                  Abbrechen
                </Button>
                <Button onClick={handleBatchExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportieren
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Angebot löschen</AlertDialogTitle>
                <AlertDialogDescription>
                  Sind Sie sicher, dass Sie dieses Angebot löschen möchten?
                  Diese Aktion kann nicht rückgängig gemacht werden.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    documentToDelete && handleDeleteDocument(documentToDelete)
                  }
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Löschen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Email Dialog */}
          {selectedDocument && (
            <EmailDialog
              open={showEmailDialog}
              onOpenChange={setShowEmailDialog}
              documentType="angebot"
              documentData={selectedDocument}
              defaultTo={selectedDocument.customer?.email || ""}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
