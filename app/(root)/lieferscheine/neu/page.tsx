"use client"

import { useRouter } from "next/navigation"
import DeliveryNoteForm from "@/components/delivery-note-form"
import type { DocumentData } from "@/lib/pdf-generator"

export default function NewDeliveryNotePage() {
  const router = useRouter()

  return (
    <div className="p-6">
      <DeliveryNoteForm
        onCancel={() => router.push("/lieferscheine")}
        onSave={() => router.push("/lieferscheine")}
        onPreview={(data: DocumentData) => {
          // In a real app, you would save the data here
          router.push("/lieferscheine")
        }}
      />
    </div>
  )
}
