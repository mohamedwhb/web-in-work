"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Globe, Key, ExternalLink, ChevronDown, ChevronUp, Edit, Trash2, Check } from "lucide-react"
import {
  type ApiIntegration,
  type ApiAuthType,
  updateApiIntegration,
  deleteApiIntegration,
} from "@/lib/api-integration-types"

interface ApiIntegrationCardProps {
  integration: ApiIntegration
  onEdit: (integration: ApiIntegration) => void
  onDelete: (id: string) => void
  onUpdate: (integration: ApiIntegration) => void
}

export function ApiIntegrationCard({ integration, onEdit, onDelete, onUpdate }: ApiIntegrationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggleStatus = async () => {
    try {
      const updatedIntegration = await updateApiIntegration({
        ...integration,
        enabled: !integration.enabled,
        updatedAt: new Date().toISOString(),
      })

      onUpdate(updatedIntegration)
      toast.success(`API-Integration "${integration.name}" ${integration.enabled ? "deaktiviert" : "aktiviert"}`)
    } catch (error) {
      toast.error("Fehler beim Aktualisieren des Status")
    }
  }

  const handleDelete = async () => {
    if (isDeleting) return

    setIsDeleting(true)
    try {
      const success = await deleteApiIntegration(integration.id)
      if (success) {
        onDelete(integration.id)
        toast.success(`API-Integration "${integration.name}" gelöscht`)
      } else {
        toast.error("Fehler beim Löschen der API-Integration")
      }
    } catch (error) {
      toast.error("Fehler beim Löschen der API-Integration")
    } finally {
      setIsDeleting(false)
    }
  }

  const getAuthTypeBadge = (type: ApiAuthType) => {
    switch (type) {
      case "api_key":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            API-Schlüssel
          </Badge>
        )
      case "oauth2":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
            OAuth 2.0
          </Badge>
        )
      case "basic":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            Basic Auth
          </Badge>
        )
      case "bearer":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
            Bearer Token
          </Badge>
        )
      case "none":
        return <Badge variant="outline">Keine Authentifizierung</Badge>
      default:
        return <Badge variant="outline">Unbekannt</Badge>
    }
  }

  return (
    <Card className={cn("border transition-all duration-200", isExpanded ? "shadow-md" : "")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div className={cn("p-2 rounded-md", integration.enabled ? "bg-green-100" : "bg-primary/10")}>
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-medium">{integration.name}</CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              {getAuthTypeBadge(integration.credentials.type)}
              <Badge variant={integration.enabled ? "default" : "outline"}>
                {integration.enabled ? (
                  <>
                    <Check className="h-3 w-3 mr-1" /> Aktiv
                  </>
                ) : (
                  "Inaktiv"
                )}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={integration.enabled}
            onCheckedChange={handleToggleStatus}
            aria-label={`${integration.name} aktivieren/deaktivieren`}
          />
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent
        className={cn(
          "grid gap-4 transition-all duration-200 overflow-hidden",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div
          className={cn(
            "min-h-0 overflow-hidden transition-all duration-200",
            isExpanded ? "opacity-100" : "opacity-0",
          )}
        >
          <CardDescription className="mb-4">{integration.description}</CardDescription>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Basis-URL</h4>
                <p className="text-sm text-muted-foreground break-all">{integration.baseUrl}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Authentifizierung</h4>
                <div className="flex items-center">
                  <Key className="h-4 w-4 mr-1 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {integration.credentials.type === "none"
                      ? "Keine Authentifizierung"
                      : integration.credentials.type === "api_key"
                        ? "API-Schlüssel"
                        : integration.credentials.type === "oauth2"
                          ? "OAuth 2.0"
                          : integration.credentials.type === "basic"
                            ? "Basic Auth"
                            : "Bearer Token"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Endpunkte</h4>
              <p className="text-sm text-muted-foreground">{integration.endpoints.length} Endpunkt(e) konfiguriert</p>
              <ul className="mt-2 space-y-1">
                {integration.endpoints.slice(0, 3).map((endpoint) => (
                  <li key={endpoint.id} className="text-sm">
                    <Badge variant="outline" className="mr-1 font-mono">
                      {endpoint.method}
                    </Badge>
                    <span className="font-mono text-xs">{endpoint.path}</span>
                  </li>
                ))}
                {integration.endpoints.length > 3 && (
                  <li className="text-sm text-muted-foreground">... und {integration.endpoints.length - 3} weitere</li>
                )}
              </ul>
            </div>

            {integration.tags && integration.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {integration.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">
                  Erstellt am: {new Date(integration.createdAt).toLocaleString("de-DE")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">
                  Zuletzt aktualisiert: {new Date(integration.updatedAt).toLocaleString("de-DE")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter
        className={cn(
          "flex justify-between pt-2 transition-all duration-200",
          isExpanded ? "opacity-100" : "opacity-0 h-0 py-0 overflow-hidden",
        )}
      >
        <div>
          {integration.documentation && (
            <Button variant="outline" size="sm" asChild>
              <a href={integration.documentation} target="_blank" rel="noopener noreferrer">
                Dokumentation <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="text-red-500" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="mr-1 h-4 w-4" />
            Löschen
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(integration)}>
            <Edit className="mr-1 h-4 w-4" />
            Bearbeiten
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
