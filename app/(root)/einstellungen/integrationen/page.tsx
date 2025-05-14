"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { IntegrationCard } from "@/components/integration-card"
import { getIntegrations, updateIntegration, type Integration, type IntegrationType } from "@/lib/integration-types"
import { RefreshCw, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<IntegrationType[]>([])

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    setLoading(true)
    try {
      const data = await getIntegrations()
      setIntegrations(data)
    } catch (error) {
      toast.error("Fehler beim Laden der Integrationen")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateIntegration = async (updatedIntegration: Integration) => {
    try {
      await updateIntegration(updatedIntegration)
      setIntegrations(
        integrations.map((integration) =>
          integration.id === updatedIntegration.id ? updatedIntegration : integration,
        ),
      )
    } catch (error) {
      toast.error(`Fehler beim Aktualisieren von ${updatedIntegration.name}`)
      console.error(error)
    }
  }

  const toggleTypeFilter = (type: IntegrationType) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const filteredIntegrations = integrations.filter((integration) => {
    // Filter by tab
    if (activeTab === "active" && integration.status !== "active") return false
    if (activeTab === "inactive" && integration.status === "active") return false

    // Filter by search query
    if (
      searchQuery &&
      !integration.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !integration.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Filter by selected types
    if (selectedTypes.length > 0 && !selectedTypes.includes(integration.type)) {
      return false
    }

    return true
  })

  const availableTypes: { type: IntegrationType; label: string }[] = [
    { type: "payment", label: "Zahlung" },
    { type: "shipping", label: "Versand" },
    { type: "accounting", label: "Buchhaltung" },
    { type: "email", label: "E-Mail" },
    { type: "analytics", label: "Analyse" },
    { type: "storage", label: "Speicher" },
    { type: "crm", label: "CRM" },
    { type: "other", label: "Sonstige" },
  ]

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          heading="Integrationen"
          description="Verbinden Sie Ihr System mit externen Diensten und Anwendungen."
        />
        <Button variant="outline" size="icon" onClick={loadIntegrations} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative w-full sm:w-64">
          <Input
            placeholder="Integrationen durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-3"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filtern
              {selectedTypes.length > 0 && (
                <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
                  {selectedTypes.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {availableTypes.map((item) => (
              <DropdownMenuCheckboxItem
                key={item.type}
                checked={selectedTypes.includes(item.type)}
                onCheckedChange={() => toggleTypeFilter(item.type)}
              >
                {item.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
              <AlertDescription>
                {loading
                  ? "Integrationen werden geladen..."
                  : "Keine Integrationen gefunden. Passen Sie Ihre Filtereinstellungen an."}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4">
              {filteredIntegrations.map((integration) => (
                <IntegrationCard key={integration.id} integration={integration} onUpdate={handleUpdateIntegration} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
