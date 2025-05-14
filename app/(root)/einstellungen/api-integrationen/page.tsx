"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { ApiIntegrationCard } from "@/components/api-integration-card"
import { ApiIntegrationForm } from "@/components/api-integration-form"
import { getApiIntegrations, type ApiIntegration } from "@/lib/api-integration-types"
import { RefreshCw, Plus, Search, AlertCircle } from "lucide-react"

export default function ApiIntegrationsPage() {
  const [integrations, setIntegrations] = useState<ApiIntegration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingIntegration, setEditingIntegration] = useState<ApiIntegration | undefined>(undefined)

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    setLoading(true)
    try {
      const data = await getApiIntegrations()
      setIntegrations(data)
    } catch (error) {
      toast.error("Fehler beim Laden der API-Integrationen")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateIntegration = (updatedIntegration: ApiIntegration) => {
    setIntegrations(
      integrations.map((integration) => (integration.id === updatedIntegration.id ? updatedIntegration : integration)),
    )
  }

  const handleDeleteIntegration = (id: string) => {
    setIntegrations(integrations.filter((integration) => integration.id !== id))
  }

  const handleEditIntegration = (integration: ApiIntegration) => {
    setEditingIntegration(integration)
    setShowForm(true)
  }

  const handleSaveIntegration = (integration: ApiIntegration) => {
    if (editingIntegration) {
      // Update existing integration
      setIntegrations(integrations.map((item) => (item.id === integration.id ? integration : item)))
    } else {
      // Add new integration
      setIntegrations([...integrations, integration])
    }
    setShowForm(false)
    setEditingIntegration(undefined)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingIntegration(undefined)
  }

  const filteredIntegrations = integrations.filter((integration) => {
    // Filter by tab
    if (activeTab === "active" && !integration.enabled) return false
    if (activeTab === "inactive" && integration.enabled) return false

    // Filter by search query
    if (
      searchQuery &&
      !integration.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !integration.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !integration.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false
    }

    return true
  })

  if (showForm) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <PageHeader
          heading={editingIntegration ? "API-Integration bearbeiten" : "Neue API-Integration"}
          description={
            editingIntegration
              ? "Bearbeiten Sie die Einstellungen für diese API-Integration"
              : "Konfigurieren Sie eine neue API-Integration"
          }
        />
        <ApiIntegrationForm
          integration={editingIntegration}
          onSave={handleSaveIntegration}
          onCancel={handleCancelForm}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader heading="API-Integrationen" description="Verwalten Sie Verbindungen zu externen API-Diensten." />
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={loadIntegrations} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Neue API-Integration
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="API-Integrationen durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="active">Aktiv</TabsTrigger>
          <TabsTrigger value="inactive">Inaktiv</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-6">
          {filteredIntegrations.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {loading
                  ? "API-Integrationen werden geladen..."
                  : searchQuery
                    ? "Keine API-Integrationen gefunden, die Ihren Suchkriterien entsprechen."
                    : "Keine API-Integrationen vorhanden. Klicken Sie auf 'Neue API-Integration', um eine hinzuzufügen."}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4">
              {filteredIntegrations.map((integration) => (
                <ApiIntegrationCard
                  key={integration.id}
                  integration={integration}
                  onEdit={handleEditIntegration}
                  onDelete={handleDeleteIntegration}
                  onUpdate={handleUpdateIntegration}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
