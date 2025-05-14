"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { ApiEndpointCard } from "@/components/api-endpoint-card"
import {
  type ApiIntegration,
  type ApiEndpoint,
  type ApiAuthType,
  createApiIntegration,
  updateApiIntegration,
} from "@/lib/api-integration-types"
import { Key, Globe, Plus, Save, X } from "lucide-react"

interface ApiIntegrationFormProps {
  integration?: ApiIntegration
  onSave: (integration: ApiIntegration) => void
  onCancel: () => void
}

export function ApiIntegrationForm({ integration, onSave, onCancel }: ApiIntegrationFormProps) {
  const isEditing = !!integration

  const [formData, setFormData] = useState<Partial<ApiIntegration>>(
    integration || {
      name: "",
      description: "",
      baseUrl: "",
      credentials: {
        type: "none",
      },
      endpoints: [],
      enabled: false,
      tags: [],
    },
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (!formData.name || !formData.baseUrl) {
        toast.error("Bitte füllen Sie alle erforderlichen Felder aus")
        return
      }

      let savedIntegration: ApiIntegration

      if (isEditing && integration) {
        savedIntegration = await updateApiIntegration({
          ...integration,
          ...formData,
        } as ApiIntegration)
        toast.success(`API-Integration "${formData.name}" aktualisiert`)
      } else {
        savedIntegration = await createApiIntegration(
          formData as Omit<ApiIntegration, "id" | "createdAt" | "updatedAt">,
        )
        toast.success(`API-Integration "${formData.name}" erstellt`)
      }

      onSave(savedIntegration)
    } catch (error) {
      toast.error("Fehler beim Speichern der API-Integration")
      console.error(error)
    }
  }

  const handleInputChange = (field: keyof ApiIntegration, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleCredentialTypeChange = (type: ApiAuthType) => {
    setFormData({
      ...formData,
      credentials: {
        type,
        ...(type === "api_key" && { apiKey: { key: "", value: "", in: "header" } }),
        ...(type === "oauth2" && { oauth2: { clientId: "", clientSecret: "" } }),
        ...(type === "basic" && { basic: { username: "", password: "" } }),
        ...(type === "bearer" && { bearer: { token: "" } }),
      },
    })
  }

  const handleCredentialChange = (field: string, value: string) => {
    const credentials = { ...formData.credentials }

    if (credentials.type === "api_key" && credentials.apiKey) {
      if (field === "key" || field === "value") {
        credentials.apiKey = { ...credentials.apiKey, [field]: value }
      } else if (field === "in") {
        credentials.apiKey = { ...credentials.apiKey, in: value as "header" | "query" }
      } else if (field === "headerName") {
        credentials.apiKey = { ...credentials.apiKey, headerName: value }
      } else if (field === "queryParamName") {
        credentials.apiKey = { ...credentials.apiKey, queryParamName: value }
      }
    } else if (credentials.type === "oauth2" && credentials.oauth2) {
      credentials.oauth2 = { ...credentials.oauth2, [field]: value }
    } else if (credentials.type === "basic" && credentials.basic) {
      credentials.basic = { ...credentials.basic, [field]: value }
    } else if (credentials.type === "bearer" && credentials.bearer) {
      credentials.bearer = { ...credentials.bearer, [field]: value }
    }

    setFormData({ ...formData, credentials })
  }

  const handleAddEndpoint = () => {
    const newEndpoint: ApiEndpoint = {
      id: `endpoint-${Date.now()}`,
      name: "Neuer Endpunkt",
      path: "/",
      method: "GET",
      contentType: "application/json",
      headers: [
        {
          key: "Accept",
          value: "application/json",
          enabled: true,
        },
      ],
      parameters: [],
    }

    setFormData({
      ...formData,
      endpoints: [...(formData.endpoints || []), newEndpoint],
    })
  }

  const handleUpdateEndpoint = (updatedEndpoint: ApiEndpoint) => {
    const updatedEndpoints = formData.endpoints?.map((endpoint) =>
      endpoint.id === updatedEndpoint.id ? updatedEndpoint : endpoint,
    )

    setFormData({
      ...formData,
      endpoints: updatedEndpoints,
    })
  }

  const handleRemoveEndpoint = (endpointId: string) => {
    const updatedEndpoints = formData.endpoints?.filter((endpoint) => endpoint.id !== endpointId)

    setFormData({
      ...formData,
      endpoints: updatedEndpoints,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "API-Integration bearbeiten" : "Neue API-Integration"}</CardTitle>
          <CardDescription>
            {isEditing
              ? "Bearbeiten Sie die Einstellungen für diese API-Integration"
              : "Konfigurieren Sie eine neue API-Integration"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="api-name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="api-name"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="z.B. Wetter API"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-base-url">
                Basis-URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="api-base-url"
                value={formData.baseUrl || ""}
                onChange={(e) => handleInputChange("baseUrl", e.target.value)}
                placeholder="z.B. https://api.example.com/v1"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-description">Beschreibung</Label>
            <Textarea
              id="api-description"
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Beschreiben Sie den Zweck dieser API-Integration"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="api-documentation">Dokumentations-URL</Label>
              <Input
                id="api-documentation"
                value={formData.documentation || ""}
                onChange={(e) => handleInputChange("documentation", e.target.value)}
                placeholder="z.B. https://developer.example.com/docs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-version">API-Version</Label>
              <Input
                id="api-version"
                value={formData.version || ""}
                onChange={(e) => handleInputChange("version", e.target.value)}
                placeholder="z.B. v1.0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-tags">Tags (kommagetrennt)</Label>
            <Input
              id="api-tags"
              value={formData.tags?.join(", ") || ""}
              onChange={(e) =>
                handleInputChange(
                  "tags",
                  e.target.value.split(",").map((tag) => tag.trim()),
                )
              }
              placeholder="z.B. wetter, extern, daten"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="api-enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => handleInputChange("enabled", checked)}
            />
            <Label htmlFor="api-enabled">API-Integration aktivieren</Label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <Key className="h-5 w-5 mr-2" />
              <h3 className="text-lg font-medium">Authentifizierung</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auth-type">Authentifizierungstyp</Label>
                <Select
                  value={formData.credentials?.type || "none"}
                  onValueChange={(value) => handleCredentialTypeChange(value as ApiAuthType)}
                >
                  <SelectTrigger id="auth-type">
                    <SelectValue placeholder="Authentifizierungstyp wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Keine Authentifizierung</SelectItem>
                    <SelectItem value="api_key">API-Schlüssel</SelectItem>
                    <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.credentials?.type === "api_key" && formData.credentials.apiKey && (
                <div className="space-y-4 p-4 border rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="api-key-name">Schlüsselname</Label>
                      <Input
                        id="api-key-name"
                        value={formData.credentials.apiKey.key || ""}
                        onChange={(e) => handleCredentialChange("key", e.target.value)}
                        placeholder="z.B. api_key, x-api-key"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="api-key-value">Schlüsselwert</Label>
                      <Input
                        id="api-key-value"
                        type="password"
                        value={formData.credentials.apiKey.value || ""}
                        onChange={(e) => handleCredentialChange("value", e.target.value)}
                        placeholder="Ihr API-Schlüssel"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api-key-in">Übertragung in</Label>
                    <Select
                      value={formData.credentials.apiKey.in}
                      onValueChange={(value) => handleCredentialChange("in", value)}
                    >
                      <SelectTrigger id="api-key-in">
                        <SelectValue placeholder="Übertragungsart wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="header">Header</SelectItem>
                        <SelectItem value="query">Query-Parameter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.credentials.apiKey.in === "header" && (
                    <div className="space-y-2">
                      <Label htmlFor="api-key-header-name">Header-Name</Label>
                      <Input
                        id="api-key-header-name"
                        value={formData.credentials.apiKey.headerName || ""}
                        onChange={(e) => handleCredentialChange("headerName", e.target.value)}
                        placeholder="z.B. X-API-Key"
                      />
                    </div>
                  )}

                  {formData.credentials.apiKey.in === "query" && (
                    <div className="space-y-2">
                      <Label htmlFor="api-key-query-param">Query-Parameter-Name</Label>
                      <Input
                        id="api-key-query-param"
                        value={formData.credentials.apiKey.queryParamName || ""}
                        onChange={(e) => handleCredentialChange("queryParamName", e.target.value)}
                        placeholder="z.B. api_key"
                      />
                    </div>
                  )}
                </div>
              )}

              {formData.credentials?.type === "oauth2" && formData.credentials.oauth2 && (
                <div className="space-y-4 p-4 border rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="oauth-client-id">Client ID</Label>
                      <Input
                        id="oauth-client-id"
                        value={formData.credentials.oauth2.clientId || ""}
                        onChange={(e) => handleCredentialChange("clientId", e.target.value)}
                        placeholder="OAuth Client ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oauth-client-secret">Client Secret</Label>
                      <Input
                        id="oauth-client-secret"
                        type="password"
                        value={formData.credentials.oauth2.clientSecret || ""}
                        onChange={(e) => handleCredentialChange("clientSecret", e.target.value)}
                        placeholder="OAuth Client Secret"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="oauth-token-url">Token URL</Label>
                      <Input
                        id="oauth-token-url"
                        value={formData.credentials.oauth2.tokenUrl || ""}
                        onChange={(e) => handleCredentialChange("tokenUrl", e.target.value)}
                        placeholder="z.B. https://example.com/oauth/token"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oauth-auth-url">Auth URL</Label>
                      <Input
                        id="oauth-auth-url"
                        value={formData.credentials.oauth2.authUrl || ""}
                        onChange={(e) => handleCredentialChange("authUrl", e.target.value)}
                        placeholder="z.B. https://example.com/oauth/authorize"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="oauth-scope">Scope (durch Leerzeichen getrennt)</Label>
                    <Input
                      id="oauth-scope"
                      value={formData.credentials.oauth2.scope || ""}
                      onChange={(e) => handleCredentialChange("scope", e.target.value)}
                      placeholder="z.B. read write"
                    />
                  </div>
                </div>
              )}

              {formData.credentials?.type === "basic" && formData.credentials.basic && (
                <div className="space-y-4 p-4 border rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="basic-username">Benutzername</Label>
                      <Input
                        id="basic-username"
                        value={formData.credentials.basic.username || ""}
                        onChange={(e) => handleCredentialChange("username", e.target.value)}
                        placeholder="Benutzername"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="basic-password">Passwort</Label>
                      <Input
                        id="basic-password"
                        type="password"
                        value={formData.credentials.basic.password || ""}
                        onChange={(e) => handleCredentialChange("password", e.target.value)}
                        placeholder="Passwort"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.credentials?.type === "bearer" && formData.credentials.bearer && (
                <div className="space-y-4 p-4 border rounded-md">
                  <div className="space-y-2">
                    <Label htmlFor="bearer-token">Bearer Token</Label>
                    <Input
                      id="bearer-token"
                      type="password"
                      value={formData.credentials.bearer.token || ""}
                      onChange={(e) => handleCredentialChange("token", e.target.value)}
                      placeholder="Bearer Token"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                <h3 className="text-lg font-medium">Endpunkte</h3>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleAddEndpoint}>
                <Plus className="h-4 w-4 mr-1" /> Endpunkt hinzufügen
              </Button>
            </div>

            {formData.endpoints && formData.endpoints.length > 0 ? (
              <div className="space-y-4">
                {formData.endpoints.map((endpoint) => (
                  <div key={endpoint.id} className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 z-10"
                      onClick={() => handleRemoveEndpoint(endpoint.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <ApiEndpointCard
                      endpoint={endpoint}
                      integration={formData as ApiIntegration}
                      onUpdate={handleUpdateEndpoint}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed rounded-md">
                <p className="text-muted-foreground">Keine Endpunkte konfiguriert</p>
                <Button type="button" variant="outline" className="mt-2" onClick={handleAddEndpoint}>
                  <Plus className="h-4 w-4 mr-1" /> Endpunkt hinzufügen
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Abbrechen
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-1" />
            {isEditing ? "Aktualisieren" : "Erstellen"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
