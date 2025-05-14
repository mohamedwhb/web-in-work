"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CreditCard,
  Truck,
  Calculator,
  Mail,
  BarChart,
  FolderOpen,
  ExternalLink,
  Check,
  AlertCircle,
  Clock,
  Settings,
  Key,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  type Integration,
  type IntegrationType,
  type IntegrationStatus,
  testIntegrationConnection,
} from "@/lib/integration-types"
import { toast } from "sonner"

interface IntegrationCardProps {
  integration: Integration
  onUpdate: (integration: Integration) => void
}

export function IntegrationCard({ integration, onUpdate }: IntegrationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState("credentials")
  const [updatedIntegration, setUpdatedIntegration] = useState<Integration>(integration)
  const [isTesting, setIsTesting] = useState(false)

  const handleToggleStatus = () => {
    const newStatus = updatedIntegration.status === "active" ? "inactive" : "configured"
    const updated = { ...updatedIntegration, status: newStatus as IntegrationStatus }
    setUpdatedIntegration(updated)
    onUpdate(updated)
  }

  const handleSave = () => {
    onUpdate(updatedIntegration)
    toast.success(`${updatedIntegration.name} Einstellungen gespeichert`)
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    try {
      const result = await testIntegrationConnection(integration.id)

      if (result.success) {
        toast.success(result.message)
        const updated = {
          ...updatedIntegration,
          status: "active" as IntegrationStatus,
          lastChecked: new Date().toISOString(),
        }
        setUpdatedIntegration(updated)
        onUpdate(updated)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Fehler beim Testen der Verbindung")
    } finally {
      setIsTesting(false)
    }
  }

  const handleCredentialChange = (key: string, value: string) => {
    const updatedCredentials = updatedIntegration.credentials.map((cred) =>
      cred.key === key ? { ...cred, value } : cred,
    )

    setUpdatedIntegration({
      ...updatedIntegration,
      credentials: updatedCredentials,
    })
  }

  const handleSettingChange = (key: string, value: string | boolean | number) => {
    const updatedSettings = updatedIntegration.settings.map((setting) =>
      setting.key === key ? { ...setting, value } : setting,
    )

    setUpdatedIntegration({
      ...updatedIntegration,
      settings: updatedSettings,
    })
  }

  const getTypeIcon = (type: IntegrationType) => {
    switch (type) {
      case "payment":
        return <CreditCard className="h-5 w-5" />
      case "shipping":
        return <Truck className="h-5 w-5" />
      case "accounting":
        return <Calculator className="h-5 w-5" />
      case "email":
        return <Mail className="h-5 w-5" />
      case "analytics":
        return <BarChart className="h-5 w-5" />
      case "storage":
        return <FolderOpen className="h-5 w-5" />
      default:
        return <Settings className="h-5 w-5" />
    }
  }

  const getStatusBadge = (status: IntegrationStatus) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <Check className="h-3 w-3 mr-1" /> Aktiv
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Inaktiv
          </Badge>
        )
      case "error":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" /> Fehler
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <Clock className="h-3 w-3 mr-1" /> Ausstehend
          </Badge>
        )
      case "configured":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <Settings className="h-3 w-3 mr-1" /> Konfiguriert
          </Badge>
        )
      default:
        return <Badge variant="outline">Unbekannt</Badge>
    }
  }

  const getTypeBadge = (type: IntegrationType) => {
    switch (type) {
      case "payment":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
            Zahlung
          </Badge>
        )
      case "shipping":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            Versand
          </Badge>
        )
      case "accounting":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
            Buchhaltung
          </Badge>
        )
      case "email":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            E-Mail
          </Badge>
        )
      case "analytics":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200">
            Analyse
          </Badge>
        )
      case "storage":
        return (
          <Badge variant="outline" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
            Speicher
          </Badge>
        )
      default:
        return <Badge variant="outline">Sonstige</Badge>
    }
  }

  const allRequiredCredentialsProvided = updatedIntegration.credentials
    .filter((cred) => cred.required)
    .every((cred) => cred.value && cred.value.length > 0)

  const canTestConnection = allRequiredCredentialsProvided && !isTesting

  return (
    <Card
      className={cn(
        "border transition-all duration-200",
        updatedIntegration.status === "active" ? "border-green-200" : "border-gray-200",
        isExpanded ? "shadow-md" : "",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div
            className={cn("p-2 rounded-md", updatedIntegration.status === "active" ? "bg-green-100" : "bg-primary/10")}
          >
            {getTypeIcon(updatedIntegration.type)}
          </div>
          <div>
            <CardTitle className="text-lg font-medium">{updatedIntegration.name}</CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              {getTypeBadge(updatedIntegration.type)}
              {getStatusBadge(updatedIntegration.status)}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={updatedIntegration.status === "active"}
            onCheckedChange={handleToggleStatus}
            disabled={updatedIntegration.status === "error" || updatedIntegration.status === "pending"}
            aria-label={`${updatedIntegration.name} aktivieren/deaktivieren`}
          />
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? "Einklappen" : "Konfigurieren"}
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
          <CardDescription className="mb-4">{updatedIntegration.description}</CardDescription>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="credentials">
                <Key className="h-4 w-4 mr-2" />
                Anmeldedaten
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Einstellungen
              </TabsTrigger>
            </TabsList>

            <TabsContent value="credentials" className="space-y-4">
              {updatedIntegration.credentials.map((credential) => (
                <div key={credential.key} className="space-y-2">
                  <Label htmlFor={`credential-${credential.key}`} className="flex items-center">
                    {credential.name}
                    {credential.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>

                  {credential.type === "password" ? (
                    <Input
                      id={`credential-${credential.key}`}
                      type="password"
                      value={credential.value}
                      onChange={(e) => handleCredentialChange(credential.key, e.target.value)}
                      placeholder={credential.placeholder}
                      className="max-w-md"
                    />
                  ) : credential.type === "select" ? (
                    <Select
                      value={credential.value}
                      onValueChange={(value) => handleCredentialChange(credential.key, value)}
                    >
                      <SelectTrigger className="max-w-md">
                        <SelectValue placeholder="Auswählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        {credential.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : credential.type === "textarea" ? (
                    <textarea
                      id={`credential-${credential.key}`}
                      value={credential.value}
                      onChange={(e) => handleCredentialChange(credential.key, e.target.value)}
                      placeholder={credential.placeholder}
                      className="w-full max-w-md h-24 px-3 py-2 border rounded-md"
                    />
                  ) : (
                    <Input
                      id={`credential-${credential.key}`}
                      type="text"
                      value={credential.value}
                      onChange={(e) => handleCredentialChange(credential.key, e.target.value)}
                      placeholder={credential.placeholder}
                      className="max-w-md"
                    />
                  )}

                  {credential.description && <p className="text-xs text-muted-foreground">{credential.description}</p>}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              {updatedIntegration.settings.map((setting) => (
                <div key={setting.key} className="space-y-2">
                  {setting.type === "boolean" ? (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`setting-${setting.key}`}
                        checked={setting.value as boolean}
                        onCheckedChange={(checked) => handleSettingChange(setting.key, checked === true)}
                      />
                      <Label htmlFor={`setting-${setting.key}`}>{setting.name}</Label>
                    </div>
                  ) : setting.type === "number" ? (
                    <div className="space-y-2">
                      <Label htmlFor={`setting-${setting.key}`}>{setting.name}</Label>
                      <Input
                        id={`setting-${setting.key}`}
                        type="number"
                        value={setting.value as number}
                        onChange={(e) => handleSettingChange(setting.key, Number(e.target.value))}
                        className="max-w-md"
                      />
                    </div>
                  ) : setting.type === "select" ? (
                    <div className="space-y-2">
                      <Label htmlFor={`setting-${setting.key}`}>{setting.name}</Label>
                      <Select
                        value={setting.value as string}
                        onValueChange={(value) => handleSettingChange(setting.key, value)}
                      >
                        <SelectTrigger className="max-w-md">
                          <SelectValue placeholder="Auswählen..." />
                        </SelectTrigger>
                        <SelectContent>
                          {setting.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor={`setting-${setting.key}`}>{setting.name}</Label>
                      <Input
                        id={`setting-${setting.key}`}
                        type="text"
                        value={setting.value as string}
                        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                        className="max-w-md"
                      />
                    </div>
                  )}

                  {setting.description && <p className="text-xs text-muted-foreground">{setting.description}</p>}
                </div>
              ))}
            </TabsContent>
          </Tabs>

          {updatedIntegration.lastChecked && (
            <div className="mt-4 text-xs text-muted-foreground">
              Zuletzt geprüft: {new Date(updatedIntegration.lastChecked).toLocaleString("de-DE")}
            </div>
          )}

          {updatedIntegration.version && (
            <div className="mt-1 text-xs text-muted-foreground">Version: {updatedIntegration.version}</div>
          )}
        </div>
      </CardContent>

      <CardFooter
        className={cn(
          "flex justify-between pt-2 transition-all duration-200",
          isExpanded ? "opacity-100" : "opacity-0 h-0 py-0 overflow-hidden",
        )}
      >
        <div>
          {updatedIntegration.documentationUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={updatedIntegration.documentationUrl} target="_blank" rel="noopener noreferrer">
                Dokumentation <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={!canTestConnection}
            size="sm"
            onClick={handleTestConnection}
            disabled={!canTestConnection}
          >
            <RefreshCw className={cn("mr-1 h-4 w-4", isTesting && "animate-spin")} />
            Verbindung testen
          </Button>
          <Button size="sm" onClick={handleSave}>
            Speichern
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
