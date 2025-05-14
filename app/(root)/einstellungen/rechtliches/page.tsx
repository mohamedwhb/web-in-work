"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LegalTextForm } from "@/components/legal-text-form"
import { LegalTextPreview } from "@/components/legal-text-preview"
import { PageHeader } from "@/components/page-header"

export default function LegalSettingsPage() {
  const [activeTab, setActiveTab] = useState("edit")

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        heading="Rechtliche Texte"
        description="Verwalten Sie rechtliche Hinweise, AGB und andere rechtliche Texte."
      />

      <Tabs defaultValue="edit" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="edit">Bearbeiten</TabsTrigger>
          <TabsTrigger value="preview">Vorschau</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <LegalTextForm />
        </TabsContent>

        <TabsContent value="preview">
          <LegalTextPreview />
        </TabsContent>
      </Tabs>
    </div>
  )
}
