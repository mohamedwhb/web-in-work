"use client"

import { useRouter } from "next/navigation"
import DeliveryNoteForm from "@/components/delivery-note-form"
import type { DocumentData } from "@/lib/pdf-generator"

export default function EditDeliveryNotePage({ params }: { params: { id: string } }) {
  const router = useRouter()

  // Sample data for demonstration
  const initialData = {
    id: "LS-2025-10001",
    date: "2025-02-05",
    deliveryDate: "2025-02-07",
    reference: "REF-2025-001",
    orderNumber: "ORD-2025-1234",
    processor: "mohamed",
    customer: "1",
    customerNumber: "123456",
    vatId: "ATU 123456",
    taxId: "DN123456",
    email: "max@mustermann.at",
    billingAddress: `Max Mustermann GmbH
Max Straße 123
1010 Wien
Österreich`,
    shippingAddress: `Max Mustermann GmbH
Max Straße 123
1010 Wien
Österreich`,
    useSeparateShippingAddress: false,
    items: [
      { id: 1, product: "Mango", artNr: "12345", quantity: 1, price: 15.9, total: 15.9 },
      { id: 2, product: "Avocado", artNr: "23456", quantity: 2, price: 12.5, total: 25.0 },
    ],
    notes: "Bitte vor der Lieferung anrufen.",
    status: "shipped",
    shippingMethod: "standard",
    trackingNumber: "AT12345678",
  }

  return (
    <div className="p-6">
      <DeliveryNoteForm
        initialData={initialData}
        onCancel={() => router.back()}
        onSave={() => router.push(`/lieferscheine/${params.id}`)}
        onPreview={(data: DocumentData) => {
          // In a real app, you would save the data here
          router.push(`/lieferscheine/${params.id}`)
        }}
      />
    </div>
  )
}
