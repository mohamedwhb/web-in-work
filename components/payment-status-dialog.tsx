"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { PaymentMethod, PaymentStatus } from "@/lib/invoice-types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

interface PaymentStatusDialogProps {
  open: boolean;
  onOpenChange: () => boolean;
  invoiceId: string;
  currentStatus: PaymentStatus;
  currentAmount: number;
  totalAmount: number;
  onStatusChange: (data: {
    status: PaymentStatus;
    method: PaymentMethod;
    date: Date | null;
    amount: number;
    reference: string;
  }) => void;
}

export default function PaymentStatusDialog({
  open,
  onOpenChange,
  invoiceId,
  currentStatus,
  currentAmount,
  totalAmount,
  onStatusChange,
}: PaymentStatusDialogProps) {
  const [status, setStatus] = useState<PaymentStatus>(currentStatus);
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer");
  const [date, setDate] = useState<Date | null>(new Date());
  const [amount, setAmount] = useState(
    currentStatus === "unpaid" ? totalAmount : currentAmount
  );
  const [reference, setReference] = useState("");

  const handleSubmit = () => {
    onStatusChange({
      status,
      method,
      date,
      amount,
      reference,
    });
    onOpenChange();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Zahlungsstatus ändern</DialogTitle>
          <DialogDescription>
            Aktualisieren Sie den Zahlungsstatus für Rechnung {invoiceId}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <div className="col-span-3">
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as PaymentStatus)}
              >
                <SelectTrigger id="status">
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
          </div>

          {(status === "paid" || status === "partial") && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="method" className="text-right">
                  Methode
                </Label>
                <div className="col-span-3">
                  <Select
                    value={method}
                    onValueChange={(value) => setMethod(value as PaymentMethod)}
                  >
                    <SelectTrigger id="method">
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
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Datum
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? (
                          format(date, "PPP", { locale: de })
                        ) : (
                          <span>Datum wählen</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date || undefined}
                        onSelect={setDate}
                        required={true}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Betrag (€)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) =>
                    setAmount(Number.parseFloat(e.target.value) || 0)
                  }
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reference" className="text-right">
                  Referenz
                </Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="col-span-3"
                  placeholder="z.B. Transaktions-ID"
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onOpenChange}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit}>Speichern</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
