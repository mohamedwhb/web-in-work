"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import type { PaymentMethod, PaymentMethodFee } from "@/lib/payment-methods";
import { cn } from "@/lib/utils";
import {
  Banknote,
  CreditCard,
  FileText,
  Landmark,
  MoveDown,
  MoveUp,
  ShoppingCartIcon as Paypal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";

interface PaymentMethodCardProps {
  method: PaymentMethod;
  onUpdate: (method: PaymentMethod) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
}

export function PaymentMethodCard({
  method,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: PaymentMethodCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMethod, setEditedMethod] = useState<PaymentMethod>(method);
  const [feeType, setFeeType] = useState<"none" | "fixed" | "percentage">(
    method.fee === null ? "none" : method.fee.type
  );

  const handleToggleEnabled = () => {
    const updated = { ...method, enabled: !method.enabled };
    onUpdate(updated);
  };

  const handleToggleDefault = () => {
    if (!method.isDefault) {
      const updated = { ...method, isDefault: true };
      onUpdate(updated);
    }
  };

  const handleSave = () => {
    // Update fee based on feeType
    let updatedFee: PaymentMethodFee | null = null;

    if (feeType === "fixed") {
      updatedFee = {
        type: "fixed",
        value: Number.parseFloat(editedMethod.fee?.value.toString() || "0"),
      };
    } else if (feeType === "percentage") {
      updatedFee = {
        type: "percentage",
        value: Number.parseFloat(editedMethod.fee?.value.toString() || "0"),
      };
    }

    const updatedMethod = { ...editedMethod, fee: updatedFee };
    onUpdate(updatedMethod);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedMethod(method);
    setFeeType(method.fee === null ? "none" : method.fee.type);
    setIsEditing(false);
  };

  const getIcon = () => {
    switch (method.icon) {
      case "credit-card":
        return <CreditCard className="h-5 w-5" />;
      case "bank":
        return <Landmark className="h-5 w-5" />;
      case "banknote":
        return <Banknote className="h-5 w-5" />;
      case "file-text":
        return <FileText className="h-5 w-5" />;
      case "paypal":
        return <Paypal className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  return (
    <Card
      className={cn(
        "border",
        method.enabled ? "border-gray-200" : "border-gray-200 bg-gray-50"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div className="bg-primary/10 p-2 rounded-md">{getIcon()}</div>
          {isEditing ? (
            <Input
              value={editedMethod.name}
              onChange={(e) =>
                setEditedMethod({ ...editedMethod, name: e.target.value })
              }
              className="w-48"
            />
          ) : (
            <CardTitle className="text-base font-medium">
              {method.name}
            </CardTitle>
          )}
          {method.isDefault && (
            <Badge variant="outline" className="ml-2 w-fit">
              Standard
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={method.enabled}
            onCheckedChange={handleToggleEnabled}
            aria-label={`${method.name} aktivieren/deaktivieren`}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`description-${method.id}`}>Beschreibung</Label>
              <Input
                id={`description-${method.id}`}
                value={editedMethod.description}
                onChange={(e) =>
                  setEditedMethod({
                    ...editedMethod,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor={`processing-time-${method.id}`}>
                Bearbeitungszeit
              </Label>
              <Input
                id={`processing-time-${method.id}`}
                value={editedMethod.processingTime}
                onChange={(e) =>
                  setEditedMethod({
                    ...editedMethod,
                    processingTime: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Gebühren</Label>
              <RadioGroup
                value={feeType}
                onValueChange={(value) =>
                  setFeeType(value as "none" | "fixed" | "percentage")
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id={`fee-none-${method.id}`} />
                  <Label htmlFor={`fee-none-${method.id}`}>
                    Keine Gebühren
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id={`fee-fixed-${method.id}`} />
                  <Label htmlFor={`fee-fixed-${method.id}`}>
                    Feste Gebühr (€)
                  </Label>
                  {feeType === "fixed" && (
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editedMethod.fee?.value || 0}
                      onChange={(e) =>
                        setEditedMethod({
                          ...editedMethod,
                          fee: {
                            type: "fixed",
                            value: Number.parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-24 ml-2"
                    />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="percentage"
                    id={`fee-percentage-${method.id}`}
                  />
                  <Label htmlFor={`fee-percentage-${method.id}`}>
                    Prozentuale Gebühr (%)
                  </Label>
                  {feeType === "percentage" && (
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editedMethod.fee?.value || 0}
                      onChange={(e) =>
                        setEditedMethod({
                          ...editedMethod,
                          fee: {
                            type: "percentage",
                            value: Number.parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-24 ml-2"
                    />
                  )}
                </div>
              </RadioGroup>
            </div>

            {/* Custom fields based on payment method type */}
            {method.type === "bank_transfer" && (
              <div className="space-y-2">
                <Label>Bankdaten</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label
                      htmlFor={`bank-name-${method.id}`}
                      className="text-xs"
                    >
                      Bank
                    </Label>
                    <Input
                      id={`bank-name-${method.id}`}
                      value={editedMethod.customFields.bankName || ""}
                      onChange={(e) =>
                        setEditedMethod({
                          ...editedMethod,
                          customFields: {
                            ...editedMethod.customFields,
                            bankName: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor={`account-holder-${method.id}`}
                      className="text-xs"
                    >
                      Kontoinhaber
                    </Label>
                    <Input
                      id={`account-holder-${method.id}`}
                      value={editedMethod.customFields.accountHolder || ""}
                      onChange={(e) =>
                        setEditedMethod({
                          ...editedMethod,
                          customFields: {
                            ...editedMethod.customFields,
                            accountHolder: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`iban-${method.id}`} className="text-xs">
                      IBAN
                    </Label>
                    <Input
                      id={`iban-${method.id}`}
                      value={editedMethod.customFields.iban || ""}
                      onChange={(e) =>
                        setEditedMethod({
                          ...editedMethod,
                          customFields: {
                            ...editedMethod.customFields,
                            iban: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`bic-${method.id}`} className="text-xs">
                      BIC
                    </Label>
                    <Input
                      id={`bic-${method.id}`}
                      value={editedMethod.customFields.bic || ""}
                      onChange={(e) =>
                        setEditedMethod({
                          ...editedMethod,
                          customFields: {
                            ...editedMethod.customFields,
                            bic: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {method.type === "paypal" && (
              <div>
                <Label htmlFor={`paypal-email-${method.id}`}>
                  PayPal E-Mail
                </Label>
                <Input
                  id={`paypal-email-${method.id}`}
                  value={editedMethod.customFields.paypalEmail || ""}
                  onChange={(e) =>
                    setEditedMethod({
                      ...editedMethod,
                      customFields: {
                        ...editedMethod.customFields,
                        paypalEmail: e.target.value,
                      },
                    })
                  }
                />
              </div>
            )}

            {method.type === "direct_debit" && (
              <div className="space-y-2">
                <div>
                  <Label htmlFor={`creditor-id-${method.id}`}>
                    Gläubiger-ID
                  </Label>
                  <Input
                    id={`creditor-id-${method.id}`}
                    value={editedMethod.customFields.creditorId || ""}
                    onChange={(e) =>
                      setEditedMethod({
                        ...editedMethod,
                        customFields: {
                          ...editedMethod.customFields,
                          creditorId: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor={`mandate-info-${method.id}`}>
                    Mandatsinformationen
                  </Label>
                  <Input
                    id={`mandate-info-${method.id}`}
                    value={editedMethod.customFields.mandateInfo || ""}
                    onChange={(e) =>
                      setEditedMethod({
                        ...editedMethod,
                        customFields: {
                          ...editedMethod.customFields,
                          mandateInfo: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            )}

            {method.type === "invoice" && (
              <div>
                <Label htmlFor={`payment-terms-${method.id}`}>
                  Zahlungsbedingungen
                </Label>
                <Input
                  id={`payment-terms-${method.id}`}
                  value={editedMethod.customFields.paymentTerms || ""}
                  onChange={(e) =>
                    setEditedMethod({
                      ...editedMethod,
                      customFields: {
                        ...editedMethod.customFields,
                        paymentTerms: e.target.value,
                      },
                    })
                  }
                />
              </div>
            )}
          </div>
        ) : (
          <>
            <CardDescription>{method.description}</CardDescription>

            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bearbeitungszeit:</span>
                <span>{method.processingTime}</span>
              </div>

              {method.fee && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gebühr:</span>
                  <span>
                    {method.fee.type === "fixed"
                      ? `${method.fee.value.toFixed(2)} €`
                      : `${method.fee.value.toFixed(2)} %`}
                  </span>
                </div>
              )}

              {/* Display custom fields based on payment method type */}
              {method.type === "bank_transfer" && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div className="text-muted-foreground">Bank:</div>
                    <div>{method.customFields.bankName}</div>
                    <div className="text-muted-foreground">Kontoinhaber:</div>
                    <div>{method.customFields.accountHolder}</div>
                    <div className="text-muted-foreground">IBAN:</div>
                    <div>{method.customFields.iban}</div>
                    <div className="text-muted-foreground">BIC:</div>
                    <div>{method.customFields.bic}</div>
                  </div>
                </div>
              )}

              {method.type === "paypal" && method.customFields.paypalEmail && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PayPal:</span>
                  <span>{method.customFields.paypalEmail}</span>
                </div>
              )}

              {method.type === "direct_debit" && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div className="text-muted-foreground">Gläubiger-ID:</div>
                    <div>{method.customFields.creditorId}</div>
                    <div className="text-muted-foreground">Info:</div>
                    <div>{method.customFields.mandateInfo}</div>
                  </div>
                </div>
              )}

              {method.type === "invoice" &&
                method.customFields.paymentTerms && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Zahlungsbedingungen:
                    </span>
                    <span>{method.customFields.paymentTerms}</span>
                  </div>
                )}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-1 justify-between pt-2">
        <div>
          {!method.isDefault && (
            <Button variant="outline" size="sm" onClick={handleToggleDefault}>
              Als Standard festlegen
            </Button>
          )}
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Abbrechen
              </Button>
              <Button size="sm" onClick={handleSave}>
                Speichern
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onMoveUp(method.id)}
                disabled={isFirst}
                className="h-8 w-8"
              >
                <MoveUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onMoveDown(method.id)}
                disabled={isLast}
                className="h-8 w-8"
              >
                <MoveDown className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onDelete(method.id)}
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                disabled={method.isDefault}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
