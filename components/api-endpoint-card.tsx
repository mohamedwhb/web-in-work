"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp, Play, Code, Settings, FileJson, RefreshCw, Check, X, Clock, Copy } from "lucide-react"
import {
  type ApiEndpoint,
  type ApiIntegration,
  type ApiMethod,
  type ApiContentType,
  type ApiHeader,
  type ApiParameter,
  testApiEndpoint,
} from "@/lib/api-integration-types"

interface ApiEndpointCardProps {
  endpoint: ApiEndpoint
  integration: ApiIntegration
  onUpdate: (updatedEndpoint: ApiEndpoint) => void
}

export function ApiEndpointCard({ endpoint, integration, onUpdate }: ApiEndpointCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState("params")
  const [updatedEndpoint, setUpdatedEndpoint] = useState<ApiEndpoint>(endpoint)
  const [isTesting, setIsTesting] = useState(false)

  const handleSave = () => {
    onUpdate(updatedEndpoint)
    toast.success(`Endpunkt "${updatedEndpoint.name}" gespeichert`)
  }

  const handleTestEndpoint = async () => {
    setIsTesting(true)
    try {
      const result = await testApiEndpoint(integration, endpoint.id)

      const updatedWithTest = {
        ...updatedEndpoint,
        lastTested: new Date().toISOString(),
        testResult: result,
      }

      setUpdatedEndpoint(updatedWithTest)
      onUpdate(updatedWithTest)

      if (result.success) {
        toast.success("API-Test erfolgreich")
      } else {
        toast.error(`API-Test fehlgeschlagen: ${result.error}`)
      }
    } catch (error) {
      toast.error("Fehler beim Testen des Endpunkts")
    } finally {
      setIsTesting(false)
    }
  }

  const handleNameChange = (name: string) => {
    setUpdatedEndpoint({ ...updatedEndpoint, name })
  }

  const handleDescriptionChange = (description: string) => {
    setUpdatedEndpoint({ ...updatedEndpoint, description })
  }

  const handlePathChange = (path: string) => {
    setUpdatedEndpoint({ ...updatedEndpoint, path })
  }

  const handleMethodChange = (method: ApiMethod) => {
    setUpdatedEndpoint({ ...updatedEndpoint, method })
  }

  const handleContentTypeChange = (contentType: ApiContentType) => {
    setUpdatedEndpoint({ ...updatedEndpoint, contentType })
  }

  const handleCustomContentTypeChange = (customContentType: string) => {
    setUpdatedEndpoint({ ...updatedEndpoint, customContentType })
  }

  const handleHeaderChange = (index: number, field: keyof ApiHeader, value: string | boolean) => {
    const updatedHeaders = [...updatedEndpoint.headers]
    updatedHeaders[index] = { ...updatedHeaders[index], [field]: value }
    setUpdatedEndpoint({ ...updatedEndpoint, headers: updatedHeaders })
  }

  const handleParameterChange = (index: number, field: keyof ApiParameter, value: string | boolean) => {
    const updatedParameters = [...updatedEndpoint.parameters]
    updatedParameters[index] = { ...updatedParameters[index], [field]: value }
    setUpdatedEndpoint({ ...updatedEndpoint, parameters: updatedParameters })
  }

  const handleRequestBodyChange = (requestBody: string) => {
    setUpdatedEndpoint({ ...updatedEndpoint, requestBody })
  }

  const addHeader = () => {
    const newHeader: ApiHeader = {
      key: "",
      value: "",
      enabled: true,
    }
    setUpdatedEndpoint({ ...updatedEndpoint, headers: [...updatedEndpoint.headers, newHeader] })
  }

  const removeHeader = (index: number) => {
    const updatedHeaders = [...updatedEndpoint.headers]
    updatedHeaders.splice(index, 1)
    setUpdatedEndpoint({ ...updatedEndpoint, headers: updatedHeaders })
  }

  const addParameter = () => {
    const newParameter: ApiParameter = {
      key: "",
      value: "",
      required: false,
      type: "query",
      enabled: true,
    }
    setUpdatedEndpoint({ ...updatedEndpoint, parameters: [...updatedEndpoint.parameters, newParameter] })
  }

  const removeParameter = (index: number) => {
    const updatedParameters = [...updatedEndpoint.parameters]
    updatedParameters.splice(index, 1)
    setUpdatedEndpoint({ ...updatedEndpoint, parameters: updatedParameters })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("In die Zwischenablage kopiert")
  }

  const getMethodBadge = (method: ApiMethod) => {
    switch (method) {
      case "GET":
        return <Badge className="bg-blue-500 hover:bg-blue-600">GET</Badge>
      case "POST":
        return <Badge className="bg-green-500 hover:bg-green-600">POST</Badge>
      case "PUT":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">PUT</Badge>
      case "DELETE":
        return <Badge className="bg-red-500 hover:bg-red-600">DELETE</Badge>
      case "PATCH":
        return <Badge className="bg-purple-500 hover:bg-purple-600">PATCH</Badge>
      default:
        return <Badge>UNKNOWN</Badge>
    }
  }

  const getTestResultBadge = () => {
    if (!updatedEndpoint.testResult) {
      return <Badge variant="outline">Nicht getestet</Badge>
    }

    if (updatedEndpoint.testResult.success) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <Check className="h-3 w-3 mr-1" /> Erfolgreich
        </Badge>
      )
    } else {
      return (
        <Badge variant="destructive">
          <X className="h-3 w-3 mr-1" /> Fehlgeschlagen
        </Badge>
      )
    }
  }

  const buildFullUrl = () => {
    let url = integration.baseUrl

    // Ensure baseUrl doesn't end with slash and path doesn't start with slash
    if (url.endsWith("/")) {
      url = url.slice(0, -1)
    }

    let path = updatedEndpoint.path
    if (!path.startsWith("/")) {
      path = "/" + path
    }

    return url + path
  }

  return (
    <Card className={cn("border transition-all duration-200", isExpanded ? "shadow-md" : "")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-md bg-primary/10">
            <Code className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-medium">{updatedEndpoint.name}</CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              {getMethodBadge(updatedEndpoint.method)}
              <span className="text-sm text-muted-foreground truncate max-w-[200px]">{updatedEndpoint.path}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Einklappen" : "Ausklappen"}
          >
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
          <CardDescription className="mb-4">{updatedEndpoint.description}</CardDescription>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor={`endpoint-name-${endpoint.id}`}>Name</Label>
              <Input
                id={`endpoint-name-${endpoint.id}`}
                value={updatedEndpoint.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`endpoint-path-${endpoint.id}`}>Pfad</Label>
              <Input
                id={`endpoint-path-${endpoint.id}`}
                value={updatedEndpoint.path}
                onChange={(e) => handlePathChange(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor={`endpoint-method-${endpoint.id}`}>Methode</Label>
              <Select value={updatedEndpoint.method} onValueChange={(value) => handleMethodChange(value as ApiMethod)}>
                <SelectTrigger id={`endpoint-method-${endpoint.id}`}>
                  <SelectValue placeholder="Methode wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`endpoint-content-type-${endpoint.id}`}>Content-Type</Label>
              <Select
                value={updatedEndpoint.contentType}
                onValueChange={(value) => handleContentTypeChange(value as ApiContentType)}
              >
                <SelectTrigger id={`endpoint-content-type-${endpoint.id}`}>
                  <SelectValue placeholder="Content-Type wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="application/json">application/json</SelectItem>
                  <SelectItem value="application/xml">application/xml</SelectItem>
                  <SelectItem value="multipart/form-data">multipart/form-data</SelectItem>
                  <SelectItem value="text/plain">text/plain</SelectItem>
                  <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {updatedEndpoint.contentType === "custom" && (
              <div className="space-y-2">
                <Label htmlFor={`endpoint-custom-content-type-${endpoint.id}`}>Benutzerdefinierter Content-Type</Label>
                <Input
                  id={`endpoint-custom-content-type-${endpoint.id}`}
                  value={updatedEndpoint.customContentType || ""}
                  onChange={(e) => handleCustomContentTypeChange(e.target.value)}
                  placeholder="z.B. application/vnd.api+json"
                />
              </div>
            )}
          </div>

          <div className="space-y-2 mb-4">
            <Label htmlFor={`endpoint-description-${endpoint.id}`}>Beschreibung</Label>
            <Textarea
              id={`endpoint-description-${endpoint.id}`}
              value={updatedEndpoint.description || ""}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Beschreibung des Endpunkts"
              rows={2}
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between">
              <Label>Vollständige URL</Label>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(buildFullUrl())} className="h-6 px-2">
                <Copy className="h-3 w-3 mr-1" /> Kopieren
              </Button>
            </div>
            <div className="mt-1 p-2 bg-muted rounded-md text-sm font-mono break-all">{buildFullUrl()}</div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="params">
                <Settings className="h-4 w-4 mr-2" />
                Parameter
              </TabsTrigger>
              <TabsTrigger value="headers">
                <Code className="h-4 w-4 mr-2" />
                Header
              </TabsTrigger>
              <TabsTrigger value="body">
                <FileJson className="h-4 w-4 mr-2" />
                Request Body
              </TabsTrigger>
              {updatedEndpoint.testResult && (
                <TabsTrigger value="response">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Antwort
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="params" className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Parameter</h4>
                <Button variant="outline" size="sm" onClick={addParameter}>
                  Parameter hinzufügen
                </Button>
              </div>

              {updatedEndpoint.parameters.length === 0 ? (
                <div className="text-sm text-muted-foreground">Keine Parameter konfiguriert</div>
              ) : (
                <div className="space-y-4">
                  {updatedEndpoint.parameters.map((param, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-3">
                        <Label htmlFor={`param-key-${index}`} className="sr-only">
                          Schlüssel
                        </Label>
                        <Input
                          id={`param-key-${index}`}
                          value={param.key}
                          onChange={(e) => handleParameterChange(index, "key", e.target.value)}
                          placeholder="Schlüssel"
                        />
                      </div>
                      <div className="col-span-3">
                        <Label htmlFor={`param-value-${index}`} className="sr-only">
                          Wert
                        </Label>
                        <Input
                          id={`param-value-${index}`}
                          value={param.value}
                          onChange={(e) => handleParameterChange(index, "value", e.target.value)}
                          placeholder="Wert"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor={`param-type-${index}`} className="sr-only">
                          Typ
                        </Label>
                        <Select
                          value={param.type}
                          onValueChange={(value) => handleParameterChange(index, "type", value as ApiParameter["type"])}
                        >
                          <SelectTrigger id={`param-type-${index}`}>
                            <SelectValue placeholder="Typ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="query">Query</SelectItem>
                            <SelectItem value="path">Path</SelectItem>
                            <SelectItem value="body">Body</SelectItem>
                            <SelectItem value="header">Header</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2 pt-2">
                          <Checkbox
                            id={`param-required-${index}`}
                            checked={param.required}
                            onCheckedChange={(checked) => handleParameterChange(index, "required", checked === true)}
                          />
                          <Label htmlFor={`param-required-${index}`} className="text-sm">
                            Erforderlich
                          </Label>
                        </div>
                      </div>
                      <div className="col-span-1">
                        <div className="flex items-center space-x-2 pt-2">
                          <Checkbox
                            id={`param-enabled-${index}`}
                            checked={param.enabled}
                            onCheckedChange={(checked) => handleParameterChange(index, "enabled", checked === true)}
                          />
                          <Label htmlFor={`param-enabled-${index}`} className="text-sm">
                            Aktiv
                          </Label>
                        </div>
                      </div>
                      <div className="col-span-1">
                        <Button variant="ghost" size="icon" onClick={() => removeParameter(index)} className="h-8 w-8">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="headers" className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Header</h4>
                <Button variant="outline" size="sm" onClick={addHeader}>
                  Header hinzufügen
                </Button>
              </div>

              {updatedEndpoint.headers.length === 0 ? (
                <div className="text-sm text-muted-foreground">Keine Header konfiguriert</div>
              ) : (
                <div className="space-y-4">
                  {updatedEndpoint.headers.map((header, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-5">
                        <Label htmlFor={`header-key-${index}`} className="sr-only">
                          Schlüssel
                        </Label>
                        <Input
                          id={`header-key-${index}`}
                          value={header.key}
                          onChange={(e) => handleHeaderChange(index, "key", e.target.value)}
                          placeholder="Schlüssel"
                        />
                      </div>
                      <div className="col-span-5">
                        <Label htmlFor={`header-value-${index}`} className="sr-only">
                          Wert
                        </Label>
                        <Input
                          id={`header-value-${index}`}
                          value={header.value}
                          onChange={(e) => handleHeaderChange(index, "value", e.target.value)}
                          placeholder="Wert"
                        />
                      </div>
                      <div className="col-span-1">
                        <div className="flex items-center space-x-2 pt-2">
                          <Checkbox
                            id={`header-enabled-${index}`}
                            checked={header.enabled}
                            onCheckedChange={(checked) => handleHeaderChange(index, "enabled", checked === true)}
                          />
                          <Label htmlFor={`header-enabled-${index}`} className="text-sm">
                            Aktiv
                          </Label>
                        </div>
                      </div>
                      <div className="col-span-1">
                        <Button variant="ghost" size="icon" onClick={() => removeHeader(index)} className="h-8 w-8">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="body" className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Request Body</h4>
                {["POST", "PUT", "PATCH"].includes(updatedEndpoint.method) && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleRequestBodyChange(
                          JSON.stringify(
                            {
                              example: "data",
                              nested: {
                                property: "value",
                              },
                            },
                            null,
                            2,
                          ),
                        )
                      }
                    >
                      Beispiel einfügen
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(updatedEndpoint.requestBody || "")}
                      className="h-8"
                    >
                      <Copy className="h-4 w-4 mr-1" /> Kopieren
                    </Button>
                  </div>
                )}
              </div>

              {!["POST", "PUT", "PATCH"].includes(updatedEndpoint.method) ? (
                <div className="text-sm text-muted-foreground">
                  Request Body wird für {updatedEndpoint.method}-Anfragen nicht verwendet
                </div>
              ) : (
                <Textarea
                  value={updatedEndpoint.requestBody || ""}
                  onChange={(e) => handleRequestBodyChange(e.target.value)}
                  placeholder="Request Body (JSON, XML, etc.)"
                  className="font-mono"
                  rows={10}
                />
              )}
            </TabsContent>

            {updatedEndpoint.testResult && (
              <TabsContent value="response" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">API-Antwort</h4>
                  <div className="flex items-center space-x-2">
                    <Badge variant={updatedEndpoint.testResult.success ? "default" : "destructive"} className="mr-2">
                      Status: {updatedEndpoint.testResult.statusCode || "N/A"}
                    </Badge>
                    {updatedEndpoint.testResult.responseTime && (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {updatedEndpoint.testResult.responseTime}ms
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(updatedEndpoint.testResult?.response || updatedEndpoint.testResult?.error || "")
                      }
                      className="h-8"
                    >
                      <Copy className="h-4 w-4 mr-1" /> Kopieren
                    </Button>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {updatedEndpoint.testResult.success
                      ? updatedEndpoint.testResult.response
                      : updatedEndpoint.testResult.error}
                  </pre>
                </div>

                {updatedEndpoint.lastTested && (
                  <div className="text-xs text-muted-foreground">
                    Zuletzt getestet: {new Date(updatedEndpoint.lastTested).toLocaleString("de-DE")}
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </CardContent>

      <CardFooter
        className={cn(
          "flex justify-between pt-2 transition-all duration-200",
          isExpanded ? "opacity-100" : "opacity-0 h-0 py-0 overflow-hidden",
        )}
      >
        <div className="flex items-center">{getTestResultBadge()}</div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleTestEndpoint} disabled={isTesting || !integration.enabled}>
            <Play className={cn("mr-1 h-4 w-4", isTesting && "animate-spin")} />
            Testen
          </Button>
          <Button size="sm" onClick={handleSave}>
            Speichern
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
