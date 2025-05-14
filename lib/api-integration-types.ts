export type ApiAuthType = "api_key" | "oauth2" | "basic" | "bearer" | "none"

export type ApiMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

export type ApiContentType = "application/json" | "application/xml" | "multipart/form-data" | "text/plain" | "custom"

export interface ApiHeader {
  key: string
  value: string
  description?: string
  enabled: boolean
}

export interface ApiParameter {
  key: string
  value: string
  description?: string
  required: boolean
  type: "query" | "path" | "body" | "header"
  enabled: boolean
}

export interface ApiEndpoint {
  id: string
  name: string
  description?: string
  path: string
  method: ApiMethod
  contentType: ApiContentType
  customContentType?: string
  headers: ApiHeader[]
  parameters: ApiParameter[]
  requestBody?: string
  responseExample?: string
  lastTested?: string
  testResult?: {
    success: boolean
    statusCode?: number
    responseTime?: number
    response?: string
    error?: string
  }
}

export interface ApiCredential {
  type: ApiAuthType
  apiKey?: {
    key: string
    value: string
    in: "header" | "query"
    headerName?: string
    queryParamName?: string
  }
  oauth2?: {
    clientId: string
    clientSecret: string
    accessToken?: string
    refreshToken?: string
    tokenUrl?: string
    authUrl?: string
    scope?: string
    expiresAt?: string
  }
  basic?: {
    username: string
    password: string
  }
  bearer?: {
    token: string
  }
}

export interface ApiIntegration {
  id: string
  name: string
  description: string
  baseUrl: string
  credentials: ApiCredential
  endpoints: ApiEndpoint[]
  enabled: boolean
  createdAt: string
  updatedAt: string
  tags: string[]
  documentation?: string
  version?: string
}

// Mock data for API integrations
export const defaultApiIntegrations: ApiIntegration[] = [
  {
    id: "weather-api",
    name: "Wetter API",
    description: "Integration mit einem Wetterdienst für aktuelle Wetterdaten",
    baseUrl: "https://api.weatherservice.com/v1",
    credentials: {
      type: "api_key",
      apiKey: {
        key: "api_key",
        value: "",
        in: "query",
        queryParamName: "key",
      },
    },
    endpoints: [
      {
        id: "get-current-weather",
        name: "Aktuelles Wetter abrufen",
        description: "Ruft das aktuelle Wetter für einen bestimmten Standort ab",
        path: "/current",
        method: "GET",
        contentType: "application/json",
        headers: [
          {
            key: "Accept",
            value: "application/json",
            enabled: true,
          },
        ],
        parameters: [
          {
            key: "location",
            value: "",
            description: "Stadt oder Koordinaten",
            required: true,
            type: "query",
            enabled: true,
          },
          {
            key: "units",
            value: "metric",
            description: "Maßeinheiten (metric/imperial)",
            required: false,
            type: "query",
            enabled: true,
          },
        ],
      },
      {
        id: "get-forecast",
        name: "Wettervorhersage abrufen",
        description: "Ruft die Wettervorhersage für die nächsten Tage ab",
        path: "/forecast",
        method: "GET",
        contentType: "application/json",
        headers: [
          {
            key: "Accept",
            value: "application/json",
            enabled: true,
          },
        ],
        parameters: [
          {
            key: "location",
            value: "",
            description: "Stadt oder Koordinaten",
            required: true,
            type: "query",
            enabled: true,
          },
          {
            key: "days",
            value: "5",
            description: "Anzahl der Tage (1-10)",
            required: false,
            type: "query",
            enabled: true,
          },
        ],
      },
    ],
    enabled: false,
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2023-01-15T10:30:00Z",
    tags: ["wetter", "extern"],
    documentation: "https://weatherservice.com/docs",
    version: "1.0",
  },
  {
    id: "shipping-tracking-api",
    name: "Versandverfolgung API",
    description: "API zur Verfolgung von Sendungen und Paketen",
    baseUrl: "https://api.trackingservice.com/v2",
    credentials: {
      type: "bearer",
      bearer: {
        token: "",
      },
    },
    endpoints: [
      {
        id: "track-shipment",
        name: "Sendung verfolgen",
        description: "Verfolgt eine Sendung anhand der Sendungsnummer",
        path: "/shipments/{trackingNumber}",
        method: "GET",
        contentType: "application/json",
        headers: [
          {
            key: "Accept",
            value: "application/json",
            enabled: true,
          },
        ],
        parameters: [
          {
            key: "trackingNumber",
            value: "",
            description: "Sendungsnummer",
            required: true,
            type: "path",
            enabled: true,
          },
        ],
      },
      {
        id: "create-shipment",
        name: "Sendung erstellen",
        description: "Erstellt eine neue Sendung",
        path: "/shipments",
        method: "POST",
        contentType: "application/json",
        headers: [
          {
            key: "Content-Type",
            value: "application/json",
            enabled: true,
          },
          {
            key: "Accept",
            value: "application/json",
            enabled: true,
          },
        ],
        parameters: [],
        requestBody: JSON.stringify(
          {
            sender: {
              name: "Musterfirma GmbH",
              street: "Musterstraße 123",
              city: "Musterstadt",
              postalCode: "12345",
              country: "DE",
            },
            recipient: {
              name: "Max Mustermann",
              street: "Beispielweg 1",
              city: "Beispielstadt",
              postalCode: "54321",
              country: "DE",
            },
            package: {
              weight: 1.5,
              dimensions: {
                length: 30,
                width: 20,
                height: 15,
              },
            },
          },
          null,
          2,
        ),
      },
    ],
    enabled: false,
    createdAt: "2023-02-20T14:15:00Z",
    updatedAt: "2023-02-20T14:15:00Z",
    tags: ["versand", "logistik"],
    documentation: "https://trackingservice.com/api-docs",
    version: "2.0",
  },
  {
    id: "currency-exchange-api",
    name: "Währungsumrechnung API",
    description: "API für Wechselkurse und Währungsumrechnungen",
    baseUrl: "https://api.exchangerates.io/v1",
    credentials: {
      type: "api_key",
      apiKey: {
        key: "apikey",
        value: "",
        in: "header",
        headerName: "X-API-Key",
      },
    },
    endpoints: [
      {
        id: "get-latest-rates",
        name: "Aktuelle Wechselkurse",
        description: "Ruft die aktuellen Wechselkurse ab",
        path: "/latest",
        method: "GET",
        contentType: "application/json",
        headers: [
          {
            key: "Accept",
            value: "application/json",
            enabled: true,
          },
        ],
        parameters: [
          {
            key: "base",
            value: "EUR",
            description: "Basiswährung",
            required: false,
            type: "query",
            enabled: true,
          },
          {
            key: "symbols",
            value: "USD,GBP,CHF",
            description: "Kommagetrennte Liste der Zielwährungen",
            required: false,
            type: "query",
            enabled: true,
          },
        ],
      },
      {
        id: "convert-currency",
        name: "Währung umrechnen",
        description: "Rechnet einen Betrag von einer Währung in eine andere um",
        path: "/convert",
        method: "GET",
        contentType: "application/json",
        headers: [
          {
            key: "Accept",
            value: "application/json",
            enabled: true,
          },
        ],
        parameters: [
          {
            key: "from",
            value: "EUR",
            description: "Ausgangswährung",
            required: true,
            type: "query",
            enabled: true,
          },
          {
            key: "to",
            value: "USD",
            description: "Zielwährung",
            required: true,
            type: "query",
            enabled: true,
          },
          {
            key: "amount",
            value: "100",
            description: "Umzurechnender Betrag",
            required: true,
            type: "query",
            enabled: true,
          },
        ],
      },
    ],
    enabled: false,
    createdAt: "2023-03-10T09:45:00Z",
    updatedAt: "2023-03-10T09:45:00Z",
    tags: ["währung", "finanzen"],
    documentation: "https://exchangerates.io/documentation",
    version: "1.0",
  },
]

// Service functions for API integrations
export const getApiIntegrations = async (): Promise<ApiIntegration[]> => {
  // In a real app, this would fetch from an API or database
  return Promise.resolve([...defaultApiIntegrations])
}

export const getApiIntegrationById = async (id: string): Promise<ApiIntegration | undefined> => {
  // In a real app, this would fetch from an API or database
  return Promise.resolve(defaultApiIntegrations.find((integration) => integration.id === id))
}

export const updateApiIntegration = async (updatedIntegration: ApiIntegration): Promise<ApiIntegration> => {
  // In a real app, this would update the database
  return Promise.resolve(updatedIntegration)
}

export const createApiIntegration = async (
  newIntegration: Omit<ApiIntegration, "id" | "createdAt" | "updatedAt">,
): Promise<ApiIntegration> => {
  // In a real app, this would create a new record in the database
  const integration: ApiIntegration = {
    ...newIntegration,
    id: `api-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return Promise.resolve(integration)
}

export const deleteApiIntegration = async (id: string): Promise<boolean> => {
  // In a real app, this would delete from the database
  return Promise.resolve(true)
}

export const testApiEndpoint = async (
  integration: ApiIntegration,
  endpointId: string,
  testParams?: Record<string, string>,
): Promise<{
  success: boolean
  statusCode?: number
  responseTime?: number
  response?: string
  error?: string
}> => {
  // In a real app, this would actually make the API request
  // For demo purposes, we'll simulate a response

  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Randomly succeed or fail for demo purposes
  const success = Math.random() > 0.3

  if (success) {
    return {
      success: true,
      statusCode: 200,
      responseTime: Math.floor(Math.random() * 500) + 100, // 100-600ms
      response: JSON.stringify(
        {
          status: "success",
          data: {
            result: "Sample response data would appear here",
            timestamp: new Date().toISOString(),
          },
        },
        null,
        2,
      ),
    }
  } else {
    return {
      success: false,
      statusCode: [400, 401, 403, 404, 500][Math.floor(Math.random() * 5)],
      responseTime: Math.floor(Math.random() * 500) + 100,
      error: "Error connecting to API. Please check your credentials and parameters.",
    }
  }
}
