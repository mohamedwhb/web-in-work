"use client";

import { DateRangePicker } from "@/components/date-range-picker";
import DeliveryNoteForm from "@/components/delivery-note-form";
import { ViewMode } from "@/components/delivery-note-toolbar";
import DeliveryStatusDialog from "@/components/delivery-status-dialog";
import DocumentPreview from "@/components/document-preview";
import PdfExportButton from "@/components/pdf-export-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useToast } from "@/hooks/use-toast";
import type { DocumentData } from "@/lib/pdf-generator";
import {
  ArrowUpDown,
  CheckCircle,
  Clock,
  Download,
  FileDown,
  FileText,
  Filter,
  Grid,
  Mail,
  MoreHorizontal,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Settings,
  SortAsc,
  SortDesc,
  Table,
  Trash2,
  Truck,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

// Define delivery note type
export type DeliveryNote = {
  id: string;
  date: string;
  deliveryDate: string;
  customer: {
    name: string;
    address: string;
    city: string;
    zip: string;
    country: string;
    customerNumber: string;
    vatId: string;
    taxId: string;
    email?: string;
  };
  items: Array<{
    id: number;
    product: string;
    artNr: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  processor: string;
  orderNumber: string;
  shippingMethod: string;
  trackingNumber: string;
  status: "prepared" | "shipped" | "delivered";
  notes?: string;
  reference?: string;
  lastUpdated?: string;
};

// Define filter state type
type FilterState = {
  status: string | null;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  } | null;
  search: string;
  sortBy: "date" | "deliveryDate" | "id" | "customer" | "total" | "lastUpdated";
  sortOrder: "asc" | "desc";
  shippingMethod: string | null;
  minTotal: number | null;
  maxTotal: number | null;
  processor: string | null;
};

// Sample data for demonstration
const documents: DeliveryNote[] = [
  {
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
    orderNumber: "ORD-2025-1234",
    shippingMethod: "standard",
    trackingNumber: "AT12345678",
    status: "shipped",
    lastUpdated: "06.02.2025",
  },
  {
    id: "LS-2025-10002",
    date: "06.02.2025",
    deliveryDate: "08.02.2025",
    customer: {
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
    items: [
      {
        id: 1,
        product: "Kartoffel",
        artNr: "34567",
        quantity: 5,
        price: 5.2,
        total: 26.0,
      },
    ],
    subtotal: 26.0,
    tax: 2.6,
    taxRate: 10,
    total: 28.6,
    processor: "Mohamed Wahba",
    orderNumber: "ORD-2025-1235",
    shippingMethod: "express",
    trackingNumber: "AT87654321",
    status: "delivered",
    lastUpdated: "09.02.2025",
  },
  {
    id: "LS-2025-10003",
    date: "07.02.2025",
    deliveryDate: "10.02.2025",
    customer: {
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
    items: [
      {
        id: 1,
        product: "Petersilie",
        artNr: "45678",
        quantity: 3,
        price: 2.8,
        total: 8.4,
      },
      {
        id: 2,
        product: "Tomate",
        artNr: "56789",
        quantity: 4,
        price: 8.9,
        total: 35.6,
      },
    ],
    subtotal: 44.0,
    tax: 4.4,
    taxRate: 10,
    total: 48.4,
    processor: "Mohamed Wahba",
    orderNumber: "ORD-2025-1236",
    shippingMethod: "pickup",
    trackingNumber: "",
    status: "prepared",
    lastUpdated: "07.02.2025",
  },
  {
    id: "LS-2025-10004",
    date: "08.02.2025",
    deliveryDate: "12.02.2025",
    customer: {
      name: "Muster AG",
      address: "Musterstraße 10",
      city: "Wien",
      zip: "1040",
      country: "Österreich",
      customerNumber: "456789",
      vatId: "ATU 456789",
      taxId: "DN456789",
      email: "office@muster-ag.at",
    },
    items: [
      {
        id: 1,
        product: "Zwiebeln",
        artNr: "67890",
        quantity: 10,
        price: 1.2,
        total: 12.0,
      },
      {
        id: 2,
        product: "Knoblauch",
        artNr: "78901",
        quantity: 2,
        price: 3.5,
        total: 7.0,
      },
    ],
    subtotal: 19.0,
    tax: 1.9,
    taxRate: 10,
    total: 20.9,
    processor: "Sarah Schmidt",
    orderNumber: "ORD-2025-1237",
    shippingMethod: "standard",
    trackingNumber: "AT23456789",
    status: "shipped",
    lastUpdated: "09.02.2025",
  },
  {
    id: "LS-2025-10005",
    date: "09.02.2025",
    deliveryDate: "11.02.2025",
    customer: {
      name: "Beispiel GmbH",
      address: "Beispielweg 5",
      city: "Wien",
      zip: "1050",
      country: "Österreich",
      customerNumber: "567890",
      vatId: "ATU 567890",
      taxId: "DN567890",
      email: "info@beispiel.at",
    },
    items: [
      {
        id: 1,
        product: "Äpfel",
        artNr: "89012",
        quantity: 8,
        price: 2.5,
        total: 20.0,
      },
      {
        id: 2,
        product: "Birnen",
        artNr: "90123",
        quantity: 5,
        price: 3.0,
        total: 15.0,
      },
    ],
    subtotal: 35.0,
    tax: 3.5,
    taxRate: 10,
    total: 38.5,
    processor: "Lisa Müller",
    orderNumber: "ORD-2025-1238",
    shippingMethod: "express",
    trackingNumber: "AT34567890",
    status: "delivered",
    lastUpdated: "10.02.2025",
  },
  {
    id: "LS-2025-10006",
    date: "10.02.2025",
    deliveryDate: "13.02.2025",
    customer: {
      name: "Technik GmbH",
      address: "Technikstraße 15",
      city: "Wien",
      zip: "1060",
      country: "Österreich",
      customerNumber: "678901",
      vatId: "ATU 678901",
      taxId: "DN678901",
      email: "info@technik.at",
    },
    items: [
      {
        id: 1,
        product: "Gurken",
        artNr: "01234",
        quantity: 6,
        price: 1.8,
        total: 10.8,
      },
      {
        id: 2,
        product: "Paprika",
        artNr: "12345",
        quantity: 4,
        price: 2.2,
        total: 8.8,
      },
    ],
    subtotal: 19.6,
    tax: 1.96,
    taxRate: 10,
    total: 21.56,
    processor: "Lisa Müller",
    orderNumber: "ORD-2025-1239",
    shippingMethod: "standard",
    trackingNumber: "AT45678901",
    status: "prepared",
    lastUpdated: "10.02.2025",
  },
];

export default function LieferscheinePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const tableRef = useRef<HTMLDivElement>(null);

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv" | "excel">(
    "pdf"
  );
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "id",
    "customer",
    "date",
    "deliveryDate",
    "status",
    "total",
  ]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    status: searchParams.get("status"),
    dateRange: null,
    search: searchParams.get("search") || "",
    sortBy: "date",
    sortOrder: "desc",
    shippingMethod: null,
    minTotal: null,
    maxTotal: null,
    processor: null,
  });

  // List of processors for filtering
  const processors = [...new Set(documents.map((doc) => doc.processor))];

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only apply shortcuts when not in a form field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Ctrl+N: New delivery note
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        setShowForm(true);
      }

      // Ctrl+F: Focus search
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[placeholder="Suche..."]'
        ) as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }

      // Delete: Delete selected items
      if (e.key === "Delete" && selectedItems.length > 0) {
        e.preventDefault();
        setShowDeleteDialog(true);
      }

      // Escape: Clear selection
      if (e.key === "Escape" && selectedItems.length > 0) {
        e.preventDefault();
        setSelectedItems([]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItems]);

  // Apply filters and sorting to documents
  const filteredDocuments = useMemo(() => {
    return documents
      .filter((doc) => {
        // Apply status filter if active
        if (filters.status && doc.status !== filters.status) return false;

        // Apply shipping method filter if active
        if (
          filters.shippingMethod &&
          doc.shippingMethod !== filters.shippingMethod
        )
          return false;

        // Apply processor filter if active
        if (filters.processor && doc.processor !== filters.processor)
          return false;

        // Apply total range filters if active
        if (filters.minTotal !== null && doc.total < filters.minTotal)
          return false;
        if (filters.maxTotal !== null && doc.total > filters.maxTotal)
          return false;

        // Apply date range filter if active
        if (filters.dateRange?.from || filters.dateRange?.to) {
          const docDate = parseDate(doc.date);

          if (filters.dateRange.from && docDate < filters.dateRange.from)
            return false;
          if (filters.dateRange.to) {
            const toDateEnd = new Date(filters.dateRange.to);
            toDateEnd.setHours(23, 59, 59, 999);
            if (docDate > toDateEnd) return false;
          }
        }

        // Apply search filter if there's a query
        if (filters.search) {
          const query = filters.search.toLowerCase();
          return (
            doc.id.toLowerCase().includes(query) ||
            doc.customer.name.toLowerCase().includes(query) ||
            doc.orderNumber.toLowerCase().includes(query) ||
            (doc.trackingNumber &&
              doc.trackingNumber.toLowerCase().includes(query)) ||
            doc.processor.toLowerCase().includes(query) ||
            doc.items.some(
              (item) =>
                item.product.toLowerCase().includes(query) ||
                item.artNr.toLowerCase().includes(query)
            )
          );
        }

        return true;
      })
      .sort((a, b) => {
        // Apply sorting
        let comparison = 0;

        switch (filters.sortBy) {
          case "date":
            comparison =
              parseDate(a.date).getTime() - parseDate(b.date).getTime();
            break;
          case "deliveryDate":
            comparison =
              parseDate(a.deliveryDate).getTime() -
              parseDate(b.deliveryDate).getTime();
            break;
          case "id":
            comparison = a.id.localeCompare(b.id);
            break;
          case "customer":
            comparison = a.customer.name.localeCompare(b.customer.name);
            break;
          case "total":
            comparison = a.total - b.total;
            break;
          case "lastUpdated":
            comparison =
              parseDate(a.lastUpdated || a.date).getTime() -
              parseDate(b.lastUpdated || b.date).getTime();
            break;
          default:
            comparison =
              parseDate(a.date).getTime() - parseDate(b.date).getTime();
        }

        return filters.sortOrder === "asc" ? comparison : -comparison;
      });
  }, [documents, filters]);

  // Helper function to parse German date format
  function parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split(".");
    return new Date(`${year}-${month}-${day}`);
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get selected document
  const getSelectedDocument = (): DocumentData | null => {
    if (selectedDocument === null) return null;
    return documents[selectedDocument];
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle sort change
  const handleSortChange = (column: FilterState["sortBy"]) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: column,
      sortOrder:
        prev.sortBy === column && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table when page changes
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number.parseInt(value));
    setCurrentPage(1);
  };

  // Handle item selection
  const toggleItemSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedItems.length === paginatedDocuments.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedDocuments.map((doc) => doc.id));
    }
  };

  // Handle batch delete
  const handleBatchDelete = () => {
    // In a real app, you would delete the selected items from the database
    toast({
      title: "Lieferscheine gelöscht",
      description: `${selectedItems.length} Lieferscheine wurden erfolgreich gelöscht.`,
    });
    setSelectedItems([]);
    setShowDeleteDialog(false);
  };

  // Handle batch export
  const handleBatchExport = () => {
    // In a real app, you would export the selected items
    toast({
      title: `Lieferscheine als ${exportFormat.toUpperCase()} exportiert`,
      description: `${selectedItems.length} Lieferscheine wurden erfolgreich exportiert.`,
    });
    setShowExportDialog(false);
  };

  // Handle batch print
  const handleBatchPrint = () => {
    // In a real app, you would print the selected items
    toast({
      title: "Druckauftrag gesendet",
      description: `${selectedItems.length} Lieferscheine wurden zum Drucker gesendet.`,
    });
  };

  // Handle batch status update
  const handleBatchStatusUpdate = (
    status: "prepared" | "shipped" | "delivered",
    trackingNumber: string,
    notes: string
  ) => {
    // In a real app, you would update the status of the selected items
    toast({
      title: "Status aktualisiert",
      description: `${selectedItems.length} Lieferscheine wurden auf "${
        status === "prepared"
          ? "Vorbereitet"
          : status === "shipped"
          ? "Versendet"
          : "Geliefert"
      }" gesetzt.`,
    });
    setShowStatusDialog(false);
  };

  // Handle batch email
  const handleBatchEmail = () => {
    // In a real app, you would send emails for the selected items
    toast({
      title: "E-Mails gesendet",
      description: `Benachrichtigungen für ${selectedItems.length} Lieferscheine wurden versendet.`,
    });
  };

  // Reset all filters
  const resetAllFilters = () => {
    setFilters({
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
    setCurrentPage(1);
  };

  // Toggle column visibility
  const toggleColumnVisibility = (column: string) => {
    setVisibleColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  // Render status badge
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

  // Render shipping method badge
  const getShippingMethodBadge = (method: string) => {
    switch (method) {
      case "standard":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            Standard
          </Badge>
        );
      case "express":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            Express
          </Badge>
        );
      case "pickup":
        return (
          <Badge
            variant="outline"
            className="bg-teal-50 text-teal-700 border-teal-200"
          >
            Selbstabholung
          </Badge>
        );
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageItems = [];
    const maxVisiblePages = 5;

    // Previous page
    pageItems.push(
      <PaginationItem key="prev">
        <Button asChild disabled={currentPage === 1}>
          <PaginationPrevious
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          />
        </Button>
      </PaginationItem>
    );

    // First page
    if (currentPage > 3) {
      pageItems.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 4) {
        pageItems.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    // Page numbers
    const startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageItems.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={i === currentPage}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Last page
    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) {
        pageItems.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      pageItems.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Next page
    pageItems.push(
      <PaginationItem key="next">
        <Button asChild disabled={currentPage === totalPages}>
          <PaginationNext
            onClick={() =>
              handlePageChange(Math.min(totalPages, currentPage + 1))
            }
          />
        </Button>
      </PaginationItem>
    );

    return (
      <Pagination>
        <PaginationContent>{pageItems}</PaginationContent>
      </Pagination>
    );
  };

  // Render loading skeleton
  const renderSkeleton = () => {
    return Array(3)
      .fill(0)
      .map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="p-4 flex-1">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="p-4 flex-1">
                <Skeleton className="h-4 w-36 mb-1" />
                <Skeleton className="h-4 w-28 mb-1" />
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="p-4 flex justify-end items-center gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-9" />
              </div>
            </div>
          </CardContent>
        </Card>
      ));
  };

  // Render list view
  const renderListView = () => {
    return (
      <div className="overflow-y-auto max-h-[calc(100dvh-16rem)]">
        {paginatedDocuments.map((document, index) => (
          <div
            key={document.id}
            className={`border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
              selectedItems.includes(document.id) ? "bg-primary/5" : ""
            }`}
          >
            <div className="flex flex-col md:flex-row">
              <div className="p-4 flex-1 flex items-start gap-3">
                <Checkbox
                  checked={selectedItems.includes(document.id)}
                  onCheckedChange={() => toggleItemSelection(document.id)}
                  aria-label={`Lieferschein ${document.id} auswählen`}
                />
                <div>
                  <div className="font-medium">Lieferschein {document.id}</div>
                  <div className="text-sm text-muted-foreground">
                    {document.customer.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Datum: {document.date}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Lieferdatum: {document.deliveryDate}
                  </div>
                </div>
              </div>
              <div className="p-4 flex-1">
                <div className="text-sm">
                  Bestellnummer: {document.orderNumber}
                </div>
                {document.trackingNumber && (
                  <div className="text-sm">
                    Sendungsnummer: {document.trackingNumber}
                  </div>
                )}
                <div className="text-sm">
                  Summe: €{document.total.toFixed(2)}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {getStatusBadge(document.status)}
                  {getShippingMethodBadge(document.shippingMethod)}
                </div>
              </div>
              <div className="p-4 flex justify-end items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDocument(index);
                          setShowPreview(true);
                        }}
                      >
                        Anzeigen
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Vorschau anzeigen</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <PdfExportButton type="lieferschein" data={document} />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/lieferscheine/${document.id}`)
                      }
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/lieferscheine/${document.id}/edit`)
                      }
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Bearbeiten
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedItems([document.id]);
                        setShowStatusDialog(true);
                      }}
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Status ändern
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedItems([document.id]);
                        handleBatchEmail();
                      }}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      E-Mail senden
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedItems([document.id]);
                        setShowDeleteDialog(true);
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render grid view
  const renderGridView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[calc(100dvh-16rem)] mt-1">
        {paginatedDocuments.map((document) => (
          <Card
            key={document.id}
            className={
              selectedItems.includes(document.id) ? "border-primary" : ""
            }
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium">{document.id}</h3>
                  <p className="text-sm text-muted-foreground">
                    {document.customer.name}
                  </p>
                </div>
                <Checkbox
                  checked={selectedItems.includes(document.id)}
                  onCheckedChange={() => toggleItemSelection(document.id)}
                  aria-label={`Lieferschein ${document.id} auswählen`}
                />
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Datum:</span>
                  <span>{document.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lieferdatum:</span>
                  <span>{document.deliveryDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bestellnummer:</span>
                  <span>{document.orderNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Summe:</span>
                  <span>€{document.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {getStatusBadge(document.status)}
                {getShippingMethodBadge(document.shippingMethod)}
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const index = documents.findIndex(
                      (doc) => doc.id === document.id
                    );
                    setSelectedDocument(index);
                    setShowPreview(true);
                  }}
                >
                  Anzeigen
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4 mr-1" />
                      Aktionen
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/lieferscheine/${document.id}`)
                      }
                    >
                      Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/lieferscheine/${document.id}/edit`)
                      }
                    >
                      Bearbeiten
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedItems([document.id]);
                        setShowStatusDialog(true);
                      }}
                    >
                      Status ändern
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedItems([document.id]);
                        setShowDeleteDialog(true);
                      }}
                      className="text-destructive"
                    >
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render compact view
  const renderCompactView = () => {
    return (
      <div className="overflow-x-auto">
        <table className="border-collapse w-full">
          <thead>
            <tr className="bg-muted">
              <th className="p-2 text-left">
                <Checkbox
                  checked={
                    selectedItems.length === paginatedDocuments.length &&
                    paginatedDocuments.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Alle auswählen"
                />
              </th>
              {visibleColumns.includes("id") && (
                <th className="p-2 text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-medium"
                    onClick={() => handleSortChange("id")}
                  >
                    Lieferschein-Nr.
                    {filters.sortBy === "id" &&
                      (filters.sortOrder === "asc" ? (
                        <SortAsc className="h-3 w-3 ml-1 inline" />
                      ) : (
                        <SortDesc className="h-3 w-3 ml-1 inline" />
                      ))}
                  </Button>
                </th>
              )}
              {visibleColumns.includes("customer") && (
                <th className="p-2 text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-medium"
                    onClick={() => handleSortChange("customer")}
                  >
                    Kunde
                    {filters.sortBy === "customer" &&
                      (filters.sortOrder === "asc" ? (
                        <SortAsc className="h-3 w-3 ml-1 inline" />
                      ) : (
                        <SortDesc className="h-3 w-3 ml-1 inline" />
                      ))}
                  </Button>
                </th>
              )}
              {visibleColumns.includes("date") && (
                <th className="p-2 text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-medium"
                    onClick={() => handleSortChange("date")}
                  >
                    Datum
                    {filters.sortBy === "date" &&
                      (filters.sortOrder === "asc" ? (
                        <SortAsc className="h-3 w-3 ml-1 inline" />
                      ) : (
                        <SortDesc className="h-3 w-3 ml-1 inline" />
                      ))}
                  </Button>
                </th>
              )}
              {visibleColumns.includes("deliveryDate") && (
                <th className="p-2 text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-medium"
                    onClick={() => handleSortChange("deliveryDate")}
                  >
                    Lieferdatum
                    {filters.sortBy === "deliveryDate" &&
                      (filters.sortOrder === "asc" ? (
                        <SortAsc className="h-3 w-3 ml-1 inline" />
                      ) : (
                        <SortDesc className="h-3 w-3 ml-1 inline" />
                      ))}
                  </Button>
                </th>
              )}
              {visibleColumns.includes("status") && (
                <th className="p-2 text-left">Status</th>
              )}
              {visibleColumns.includes("total") && (
                <th className="p-2 text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-medium"
                    onClick={() => handleSortChange("total")}
                  >
                    Summe
                    {filters.sortBy === "total" &&
                      (filters.sortOrder === "asc" ? (
                        <SortAsc className="h-3 w-3 ml-1 inline" />
                      ) : (
                        <SortDesc className="h-3 w-3 ml-1 inline" />
                      ))}
                  </Button>
                </th>
              )}
              {visibleColumns.includes("orderNumber") && (
                <th className="p-2 text-left">Bestellnummer</th>
              )}
              {visibleColumns.includes("processor") && (
                <th className="p-2 text-left">Bearbeiter</th>
              )}
              <th className="p-2 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDocuments.map((document) => (
              <tr
                key={document.id}
                className={`border-b hover:bg-muted/50 ${
                  selectedItems.includes(document.id) ? "bg-primary/5" : ""
                }`}
              >
                <td className="p-2">
                  <Checkbox
                    checked={selectedItems.includes(document.id)}
                    onCheckedChange={() => toggleItemSelection(document.id)}
                    aria-label={`Lieferschein ${document.id} auswählen`}
                  />
                </td>
                {visibleColumns.includes("id") && (
                  <td className="p-2 font-medium">{document.id}</td>
                )}
                {visibleColumns.includes("customer") && (
                  <td className="p-2">{document.customer.name}</td>
                )}
                {visibleColumns.includes("date") && (
                  <td className="p-2">{document.date}</td>
                )}
                {visibleColumns.includes("deliveryDate") && (
                  <td className="p-2">{document.deliveryDate}</td>
                )}
                {visibleColumns.includes("status") && (
                  <td className="p-2">{getStatusBadge(document.status)}</td>
                )}
                {visibleColumns.includes("total") && (
                  <td className="p-2">€{document.total.toFixed(2)}</td>
                )}
                {visibleColumns.includes("orderNumber") && (
                  <td className="p-2">{document.orderNumber}</td>
                )}
                {visibleColumns.includes("processor") && (
                  <td className="p-2">{document.processor}</td>
                )}
                <td className="p-2 text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const index = documents.findIndex(
                          (doc) => doc.id === document.id
                        );
                        setSelectedDocument(index);
                        setShowPreview(true);
                      }}
                    >
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">Anzeigen</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Aktionen</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/lieferscheine/${document.id}`)
                          }
                        >
                          Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/lieferscheine/${document.id}/edit`)
                          }
                        >
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedItems([document.id]);
                            setShowStatusDialog(true);
                          }}
                        >
                          Status ändern
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedItems([document.id]);
                            setShowDeleteDialog(true);
                          }}
                          className="text-destructive"
                        >
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Lieferscheine</h1>
        <div className="flex flex-wrap gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suche..."
              className="pl-8"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Neu
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Neuen Lieferschein erstellen (Strg+N)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      {showForm ? (
        <DeliveryNoteForm
          onCancel={() => setShowForm(false)}
          onSave={() => setShowForm(false)}
          onPreview={(data) => {
            // In a real app, you would save the data here
            setShowForm(false);
            setShowPreview(true);
            // For demo purposes, we'll just use the first document
            setSelectedDocument(0);
          }}
        />
      ) : showPreview && selectedDocument !== null ? (
        <DocumentPreview
          type="lieferschein"
          data={getSelectedDocument()!}
          onBack={() => {
            setShowPreview(false);
            setSelectedDocument(null);
          }}
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.status === null ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange("status", null)}
              >
                Alle
              </Button>
              <Button
                variant={filters.status === "prepared" ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange("status", "prepared")}
              >
                <Clock className="h-4 w-4 mr-2" />
                Vorbereitet
              </Button>
              <Button
                variant={filters.status === "shipped" ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange("status", "shipped")}
              >
                <Truck className="h-4 w-4 mr-2" />
                Versendet
              </Button>
              <Button
                variant={filters.status === "delivered" ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange("status", "delivered")}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Geliefert
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <DateRangePicker
                dateRange={filters.dateRange || undefined}
                onDateRangeChange={(range) =>
                  handleFilterChange("dateRange", range)
                }
              />

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Erweiterte Filter
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Erweiterte Filter</SheetTitle>
                    <SheetDescription>
                      Filtern Sie die Lieferscheine nach verschiedenen
                      Kriterien.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Versandart</h3>
                      <Select
                        value={filters.shippingMethod || "all"}
                        onValueChange={(value) =>
                          handleFilterChange(
                            "shippingMethod",
                            value === "all" ? null : value
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Alle Versandarten" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle Versandarten</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="express">Express</SelectItem>
                          <SelectItem value="pickup">Selbstabholung</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Bearbeiter</h3>
                      <Select
                        value={filters.processor || "all"}
                        onValueChange={(value) =>
                          handleFilterChange(
                            "processor",
                            value === "all" ? null : value
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Alle Bearbeiter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle Bearbeiter</SelectItem>
                          {processors.map((processor) => (
                            <SelectItem key={processor} value={processor}>
                              {processor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Preisbereich</h3>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            type="number"
                            placeholder="Min €"
                            value={
                              filters.minTotal !== null ? filters.minTotal : ""
                            }
                            onChange={(e) =>
                              handleFilterChange(
                                "minTotal",
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            type="number"
                            placeholder="Max €"
                            value={
                              filters.maxTotal !== null ? filters.maxTotal : ""
                            }
                            onChange={(e) =>
                              handleFilterChange(
                                "maxTotal",
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Spalten anzeigen</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="show-id"
                            checked={visibleColumns.includes("id")}
                            onCheckedChange={() => toggleColumnVisibility("id")}
                          />
                          <label htmlFor="show-id" className="text-sm">
                            Lieferschein-Nr.
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="show-customer"
                            checked={visibleColumns.includes("customer")}
                            onCheckedChange={() =>
                              toggleColumnVisibility("customer")
                            }
                          />
                          <label htmlFor="show-customer" className="text-sm">
                            Kunde
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="show-date"
                            checked={visibleColumns.includes("date")}
                            onCheckedChange={() =>
                              toggleColumnVisibility("date")
                            }
                          />
                          <label htmlFor="show-date" className="text-sm">
                            Datum
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="show-delivery-date"
                            checked={visibleColumns.includes("deliveryDate")}
                            onCheckedChange={() =>
                              toggleColumnVisibility("deliveryDate")
                            }
                          />
                          <label
                            htmlFor="show-delivery-date"
                            className="text-sm"
                          >
                            Lieferdatum
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="show-status"
                            checked={visibleColumns.includes("status")}
                            onCheckedChange={() =>
                              toggleColumnVisibility("status")
                            }
                          />
                          <label htmlFor="show-status" className="text-sm">
                            Status
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="show-total"
                            checked={visibleColumns.includes("total")}
                            onCheckedChange={() =>
                              toggleColumnVisibility("total")
                            }
                          />
                          <label htmlFor="show-total" className="text-sm">
                            Summe
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="show-order-number"
                            checked={visibleColumns.includes("orderNumber")}
                            onCheckedChange={() =>
                              toggleColumnVisibility("orderNumber")
                            }
                          />
                          <label
                            htmlFor="show-order-number"
                            className="text-sm"
                          >
                            Bestellnummer
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="show-processor"
                            checked={visibleColumns.includes("processor")}
                            onCheckedChange={() =>
                              toggleColumnVisibility("processor")
                            }
                          />
                          <label htmlFor="show-processor" className="text-sm">
                            Bearbeiter
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <SheetFooter>
                    <Button variant="outline" onClick={resetAllFilters}>
                      Filter zurücksetzen
                    </Button>
                    <SheetClose asChild>
                      <Button>Anwenden</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Sortieren
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSortChange("date")}>
                    Datum{" "}
                    {filters.sortBy === "date" &&
                      (filters.sortOrder === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSortChange("deliveryDate")}
                  >
                    Lieferdatum{" "}
                    {filters.sortBy === "deliveryDate" &&
                      (filters.sortOrder === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange("id")}>
                    Lieferschein-Nr.{" "}
                    {filters.sortBy === "id" &&
                      (filters.sortOrder === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSortChange("customer")}
                  >
                    Kunde{" "}
                    {filters.sortBy === "customer" &&
                      (filters.sortOrder === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange("total")}>
                    Betrag{" "}
                    {filters.sortBy === "total" &&
                      (filters.sortOrder === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSortChange("lastUpdated")}
                  >
                    Letzte Änderung{" "}
                    {filters.sortBy === "lastUpdated" &&
                      (filters.sortOrder === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {viewMode === "list" ? (
                      <Table className="h-4 w-4 mr-2" />
                    ) : viewMode === "grid" ? (
                      <Grid className="h-4 w-4 mr-2" />
                    ) : (
                      <Table className="h-4 w-4 mr-2" />
                    )}
                    Ansicht
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuRadioGroup
                    value={viewMode}
                    onValueChange={(value) => setViewMode(value as ViewMode)}
                  >
                    <DropdownMenuRadioItem value="list">
                      <Table className="h-4 w-4 mr-2" />
                      Liste
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="grid">
                      <Grid className="h-4 w-4 mr-2" />
                      Kacheln
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="compact">
                      <Table className="h-4 w-4 mr-2" />
                      Kompakt
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {selectedItems.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" size="sm">
                      Aktionen ({selectedItems.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowStatusDialog(true)}>
                      <Truck className="h-4 w-4 mr-2" />
                      Status ändern
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowExportDialog(true)}>
                      <FileDown className="h-4 w-4 mr-2" />
                      Exportieren
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleBatchPrint}>
                      <Printer className="h-4 w-4 mr-2" />
                      Drucken
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleBatchEmail}>
                      <Mail className="h-4 w-4 mr-2" />
                      E-Mail senden
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <div className="grid gap-4" ref={tableRef}>
            {isLoading ? (
              renderSkeleton()
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border shadow-sm">
                <div className="flex flex-col items-center">
                  <Truck className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Keine Lieferscheine gefunden
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Es wurden keine Lieferscheine gefunden, die den
                    Filterkriterien entsprechen.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resetAllFilters}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Filter zurücksetzen
                    </Button>
                    <Button onClick={() => setShowForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Neuer Lieferschein
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                  <div className="p-4 border-b flex items-center">
                    <Checkbox
                      checked={
                        selectedItems.length === paginatedDocuments.length &&
                        paginatedDocuments.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                      aria-label="Alle Lieferscheine auswählen"
                      className="mr-4"
                    />
                    <div className="text-sm font-medium">
                      {selectedItems.length > 0
                        ? `${selectedItems.length} von ${filteredDocuments.length} ausgewählt`
                        : `${filteredDocuments.length} Lieferscheine`}
                    </div>
                  </div>

                  <div className="max-h-[600px]">
                    {viewMode === "list" && renderListView()}
                    {viewMode === "grid" && renderGridView()}
                    {viewMode === "compact" && renderCompactView()}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Zeige {(currentPage - 1) * itemsPerPage + 1} bis{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredDocuments.length
                    )}{" "}
                    von {filteredDocuments.length} Lieferscheinen
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={handleItemsPerPageChange}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Einträge pro Seite" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 pro Seite</SelectItem>
                        <SelectItem value="10">10 pro Seite</SelectItem>
                        <SelectItem value="25">25 pro Seite</SelectItem>
                        <SelectItem value="50">50 pro Seite</SelectItem>
                      </SelectContent>
                    </Select>

                    {renderPagination()}
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lieferscheine löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie {selectedItems.length} Lieferscheine
              löschen möchten? Diese Aktion kann nicht rückgängig gemacht
              werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleBatchDelete}>
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status update dialog */}
      <DeliveryStatusDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        currentStatus="prepared"
        onStatusChange={handleBatchStatusUpdate}
      />

      {/* Export dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lieferscheine exportieren</DialogTitle>
            <DialogDescription>
              Wählen Sie das Format für den Export von {selectedItems.length}{" "}
              Lieferscheinen.
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
                    Exportiert die Lieferscheine als PDF-Dokumente. Ideal für
                    den Druck oder die Weitergabe an Kunden.
                  </p>
                </TabsContent>
                <TabsContent value="csv" className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Exportiert die Lieferscheindaten als CSV-Datei. Ideal für
                    die Weiterverarbeitung in Tabellenkalkulationen.
                  </p>
                </TabsContent>
                <TabsContent value="excel" className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Exportiert die Lieferscheindaten als Excel-Datei. Ideal für
                    die Weiterverarbeitung mit erweiterten Funktionen.
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
    </div>
  );
}
