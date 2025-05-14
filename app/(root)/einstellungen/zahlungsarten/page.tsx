"use client";

import { AddPaymentMethodDialog } from "@/components/add-payment-method-dialog";
import { PageHeader } from "@/components/page-header";
import { PaymentMethodCard } from "@/components/payment-method-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createPaymentMethod,
  deletePaymentMethod,
  getPaymentMethods,
  reorderPaymentMethods,
  updatePaymentMethod,
  type PaymentMethod,
} from "@/lib/payment-methods";
import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    setLoading(true);
    try {
      const methods = await getPaymentMethods();
      setPaymentMethods(methods.sort((a, b) => a.order - b.order));
    } catch (error) {
      toast.error("Fehler beim Laden der Zahlungsarten");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMethod = async (updatedMethod: PaymentMethod) => {
    try {
      // If this method is being set as default, unset any existing default
      if (updatedMethod.isDefault) {
        const updatedMethods = paymentMethods.map((method) => ({
          ...method,
          isDefault: method.id === updatedMethod.id,
        }));
        setPaymentMethods(updatedMethods);

        // Update all methods in the database
        for (const method of updatedMethods) {
          await updatePaymentMethod(method);
        }

        toast.success("Zahlungsart aktualisiert");
      } else {
        // Just update this single method
        await updatePaymentMethod(updatedMethod);
        setPaymentMethods(
          paymentMethods.map((method) =>
            method.id === updatedMethod.id ? updatedMethod : method
          )
        );
        toast.success("Zahlungsart aktualisiert");
      }
    } catch (error) {
      toast.error("Fehler beim Aktualisieren der Zahlungsart");
      console.error(error);
    }
  };

  const handleAddMethod = async (newMethod: Omit<PaymentMethod, "id">) => {
    try {
      // Set the order to be after the last method
      const order =
        paymentMethods.length > 0
          ? Math.max(...paymentMethods.map((m) => m.order)) + 1
          : 1;

      const methodWithOrder = { ...newMethod, order };

      // If this is the first method, make it default
      if (paymentMethods.length === 0) {
        methodWithOrder.isDefault = true;
      }

      const createdMethod = await createPaymentMethod(methodWithOrder);
      setPaymentMethods([...paymentMethods, createdMethod]);
      toast.success("Zahlungsart hinzugefügt");
    } catch (error) {
      toast.error("Fehler beim Hinzufügen der Zahlungsart");
      console.error(error);
    }
  };

  const handleDeleteMethod = async (id: string) => {
    try {
      // Check if this is the default method
      const methodToDelete = paymentMethods.find((m) => m.id === id);
      if (methodToDelete?.isDefault) {
        toast.error("Die Standard-Zahlungsart kann nicht gelöscht werden");
        return;
      }

      await deletePaymentMethod(id);
      setPaymentMethods(paymentMethods.filter((method) => method.id !== id));
      toast.success("Zahlungsart gelöscht");
    } catch (error) {
      toast.error("Fehler beim Löschen der Zahlungsart");
      console.error(error);
    }
  };

  const handleMoveUp = async (id: string) => {
    const index = paymentMethods.findIndex((method) => method.id === id);
    if (index <= 0) return;

    const newMethods = [...paymentMethods];
    const currentOrder = newMethods[index].order;
    newMethods[index].order = newMethods[index - 1].order;
    newMethods[index - 1].order = currentOrder;

    // Sort by order
    newMethods.sort((a, b) => a.order - b.order);

    setPaymentMethods(newMethods);
    await reorderPaymentMethods(newMethods);
  };

  const handleMoveDown = async (id: string) => {
    const index = paymentMethods.findIndex((method) => method.id === id);
    if (index >= paymentMethods.length - 1) return;

    const newMethods = [...paymentMethods];
    const currentOrder = newMethods[index].order;
    newMethods[index].order = newMethods[index + 1].order;
    newMethods[index + 1].order = currentOrder;

    // Sort by order
    newMethods.sort((a, b) => a.order - b.order);

    setPaymentMethods(newMethods);
    await reorderPaymentMethods(newMethods);
  };

  const filteredMethods =
    activeTab === "all"
      ? paymentMethods
      : activeTab === "enabled"
      ? paymentMethods.filter((m) => m.enabled)
      : paymentMethods.filter((m) => !m.enabled);

  return (
    <div className="max-w-7xl px-2 lg:px-0 mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          heading="Zahlungsarten"
          description="Verwalten Sie die verfügbaren Zahlungsmethoden für Ihre Kunden."
        />
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={loadPaymentMethods}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <AddPaymentMethodDialog onAdd={handleAddMethod} />
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="enabled">Aktiviert</TabsTrigger>
          <TabsTrigger value="disabled">Deaktiviert</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          {paymentMethods.length === 0 ? (
            <Alert>
              <AlertDescription>
                Keine Zahlungsarten vorhanden. Fügen Sie eine neue Zahlungsart
                hinzu.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4">
              {filteredMethods.map((method, index) => (
                <PaymentMethodCard
                  key={method.id}
                  method={method}
                  onUpdate={handleUpdateMethod}
                  onDelete={handleDeleteMethod}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  isFirst={index === 0}
                  isLast={index === filteredMethods.length - 1}
                />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="enabled" className="mt-6">
          {filteredMethods.length === 0 ? (
            <Alert>
              <AlertDescription>
                Keine aktivierten Zahlungsarten vorhanden.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4">
              {filteredMethods.map((method, index) => (
                <PaymentMethodCard
                  key={method.id}
                  method={method}
                  onUpdate={handleUpdateMethod}
                  onDelete={handleDeleteMethod}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  isFirst={index === 0}
                  isLast={index === filteredMethods.length - 1}
                />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="disabled" className="mt-6">
          {filteredMethods.length === 0 ? (
            <Alert>
              <AlertDescription>
                Keine deaktivierten Zahlungsarten vorhanden.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4">
              {filteredMethods.map((method, index) => (
                <PaymentMethodCard
                  key={method.id}
                  method={method}
                  onUpdate={handleUpdateMethod}
                  onDelete={handleDeleteMethod}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  isFirst={index === 0}
                  isLast={index === filteredMethods.length - 1}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
