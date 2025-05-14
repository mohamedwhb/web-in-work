"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaymentMethod, PaymentMethodType } from "@/lib/payment-methods";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

interface AddPaymentMethodDialogProps {
  onAdd: (method: Omit<PaymentMethod, "id">) => void;
}

export function AddPaymentMethodDialog({ onAdd }: AddPaymentMethodDialogProps) {
  const [open, setOpen] = useState(false);
  const [newMethod, setNewMethod] = useState<Omit<PaymentMethod, "id">>({
    type: "custom" as PaymentMethodType,
    name: "",
    description: "",
    enabled: true,
    isDefault: false,
    processingTime: "Sofort",
    fee: null,
    customFields: {},
    order: 999, // Will be adjusted when added
    icon: "credit-card",
  });

  const handleAdd = () => {
    onAdd(newMethod);
    setOpen(false);
    // Reset form
    setNewMethod({
      type: "custom" as PaymentMethodType,
      name: "",
      description: "",
      enabled: true,
      isDefault: false,
      processingTime: "Sofort",
      fee: null,
      customFields: {},
      order: 999,
      icon: "credit-card",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="sm:mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Zahlungsart hinzufügen</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Neue Zahlungsart hinzufügen</DialogTitle>
          <DialogDescription>
            Erstellen Sie eine neue Zahlungsmethode für Ihre Kunden.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-type" className="text-right">
              Typ
            </Label>
            <Select
              value={newMethod.type}
              onValueChange={(value) =>
                setNewMethod({ ...newMethod, type: value as PaymentMethodType })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Zahlungstyp wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Banküberweisung</SelectItem>
                <SelectItem value="cash">Barzahlung</SelectItem>
                <SelectItem value="credit_card">Kreditkarte</SelectItem>
                <SelectItem value="debit_card">EC-Karte</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="direct_debit">Lastschrift</SelectItem>
                <SelectItem value="invoice">Rechnung</SelectItem>
                <SelectItem value="check">Scheck</SelectItem>
                <SelectItem value="custom">Benutzerdefiniert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={newMethod.name}
              onChange={(e) =>
                setNewMethod({ ...newMethod, name: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Beschreibung
            </Label>
            <Input
              id="description"
              value={newMethod.description}
              onChange={(e) =>
                setNewMethod({ ...newMethod, description: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="processing-time" className="text-right">
              Bearbeitungszeit
            </Label>
            <Input
              id="processing-time"
              value={newMethod.processingTime}
              onChange={(e) =>
                setNewMethod({ ...newMethod, processingTime: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="icon" className="text-right">
              Symbol
            </Label>
            <Select
              value={newMethod.icon}
              onValueChange={(value) =>
                setNewMethod({ ...newMethod, icon: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Symbol wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit-card">Kreditkarte</SelectItem>
                <SelectItem value="bank">Bank</SelectItem>
                <SelectItem value="banknote">Bargeld</SelectItem>
                <SelectItem value="file-text">Dokument</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="landmark">Finanzinstitut</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleAdd} disabled={!newMethod.name}>
            Hinzufügen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
