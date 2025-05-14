export type IntegrationType =
  | "payment"
  | "shipping"
  | "accounting"
  | "crm"
  | "email"
  | "storage"
  | "analytics"
  | "other"

export type IntegrationStatus = "active" | "inactive" | "error" | "pending" | "configured"

export interface IntegrationCredential {
  key: string
  name: string
  value: string
  type: "text" | "password" | "select" | "textarea"
  required: boolean
  options?: string[]
  placeholder?: string
  description?: string
}

export interface IntegrationSetting {
  key: string
  name: string
  value: string | boolean | number
  type: "text" | "boolean" | "number" | "select"
  options?: string[]
  description?: string
}

export interface Integration {
  id: string
  name: string
  description: string
  type: IntegrationType
  logo: string
  status: IntegrationStatus
  credentials: IntegrationCredential[]
  settings: IntegrationSetting[]
  lastChecked?: string
  documentationUrl?: string
  version?: string
}

// Mock data for integrations
export const defaultIntegrations: Integration[] = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Online-Zahlungsabwicklung für Kreditkarten und mehr",
    type: "payment",
    logo: "stripe-logo",
    status: "inactive",
    credentials: [
      {
        key: "api_key",
        name: "API-Schlüssel",
        value: "",
        type: "password",
        required: true,
        placeholder: "sk_test_...",
        description: "Ihr Stripe API-Schlüssel (beginnt mit 'sk_')",
      },
      {
        key: "publishable_key",
        name: "Öffentlicher Schlüssel",
        value: "",
        type: "text",
        required: true,
        placeholder: "pk_test_...",
        description: "Ihr öffentlicher Stripe-Schlüssel (beginnt mit 'pk_')",
      },
    ],
    settings: [
      {
        key: "test_mode",
        name: "Testmodus",
        value: true,
        type: "boolean",
        description: "Im Testmodus werden keine echten Zahlungen verarbeitet",
      },
      {
        key: "currency",
        name: "Währung",
        value: "EUR",
        type: "select",
        options: ["EUR", "USD", "GBP", "CHF"],
        description: "Standardwährung für Transaktionen",
      },
    ],
    documentationUrl: "https://stripe.com/docs",
    version: "2023-10-16",
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Online-Zahlungssystem für Transaktionen im Internet",
    type: "payment",
    logo: "paypal-logo",
    status: "inactive",
    credentials: [
      {
        key: "client_id",
        name: "Client ID",
        value: "",
        type: "text",
        required: true,
        placeholder: "AaBbCcDd...",
        description: "Ihre PayPal Client ID",
      },
      {
        key: "client_secret",
        name: "Client Secret",
        value: "",
        type: "password",
        required: true,
        placeholder: "XxYyZz...",
        description: "Ihr PayPal Client Secret",
      },
    ],
    settings: [
      {
        key: "sandbox_mode",
        name: "Sandbox-Modus",
        value: true,
        type: "boolean",
        description: "Im Sandbox-Modus werden keine echten Zahlungen verarbeitet",
      },
    ],
    documentationUrl: "https://developer.paypal.com/docs",
    version: "v2",
  },
  {
    id: "dhl",
    name: "DHL",
    description: "Versand- und Logistikdienstleistungen",
    type: "shipping",
    logo: "dhl-logo",
    status: "inactive",
    credentials: [
      {
        key: "api_key",
        name: "API-Schlüssel",
        value: "",
        type: "password",
        required: true,
        placeholder: "DHL-API-KEY",
        description: "Ihr DHL API-Schlüssel",
      },
      {
        key: "user_id",
        name: "Benutzer-ID",
        value: "",
        type: "text",
        required: true,
        placeholder: "DHL-USER-ID",
        description: "Ihre DHL Benutzer-ID",
      },
    ],
    settings: [
      {
        key: "test_mode",
        name: "Testmodus",
        value: true,
        type: "boolean",
        description: "Im Testmodus werden keine echten Versandaufträge erstellt",
      },
      {
        key: "default_product",
        name: "Standard-Produkt",
        value: "PAKET",
        type: "select",
        options: ["PAKET", "PÄCKCHEN", "EXPRESS", "EUROPAKET"],
        description: "Standard-Versandprodukt",
      },
    ],
    documentationUrl: "https://developer.dhl.com",
    version: "3.0",
  },
  {
    id: "lexoffice",
    name: "lexoffice",
    description: "Online-Buchhaltungssoftware für Selbstständige und kleine Unternehmen",
    type: "accounting",
    logo: "lexoffice-logo",
    status: "inactive",
    credentials: [
      {
        key: "api_key",
        name: "API-Schlüssel",
        value: "",
        type: "password",
        required: true,
        placeholder: "lexoffice-api-key",
        description: "Ihr lexoffice API-Schlüssel",
      },
    ],
    settings: [
      {
        key: "auto_sync",
        name: "Automatische Synchronisierung",
        value: true,
        type: "boolean",
        description: "Automatische Synchronisierung von Rechnungen und Belegen",
      },
      {
        key: "sync_interval",
        name: "Synchronisierungsintervall (Minuten)",
        value: 60,
        type: "number",
        description: "Zeitintervall für die automatische Synchronisierung",
      },
    ],
    documentationUrl: "https://developers.lexoffice.io/docs",
    version: "v1",
  },
  {
    id: "sevdesk",
    name: "sevDesk",
    description: "Cloud-basierte Buchhaltungssoftware",
    type: "accounting",
    logo: "sevdesk-logo",
    status: "inactive",
    credentials: [
      {
        key: "api_token",
        name: "API-Token",
        value: "",
        type: "password",
        required: true,
        placeholder: "sevdesk-api-token",
        description: "Ihr sevDesk API-Token",
      },
    ],
    settings: [
      {
        key: "auto_sync",
        name: "Automatische Synchronisierung",
        value: true,
        type: "boolean",
        description: "Automatische Synchronisierung von Rechnungen und Belegen",
      },
    ],
    documentationUrl: "https://api.sevdesk.de",
    version: "v2",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "E-Mail-Marketing-Plattform",
    type: "email",
    logo: "mailchimp-logo",
    status: "inactive",
    credentials: [
      {
        key: "api_key",
        name: "API-Schlüssel",
        value: "",
        type: "password",
        required: true,
        placeholder: "mailchimp-api-key",
        description: "Ihr Mailchimp API-Schlüssel",
      },
    ],
    settings: [
      {
        key: "default_list_id",
        name: "Standard-Listennummer",
        value: "",
        type: "text",
        description: "ID der Standard-Mailingliste für neue Abonnenten",
      },
      {
        key: "double_opt_in",
        name: "Double Opt-in",
        value: true,
        type: "boolean",
        description: "Erfordert Bestätigung der E-Mail-Adresse durch den Abonnenten",
      },
    ],
    documentationUrl: "https://mailchimp.com/developer",
    version: "3.0",
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Web-Analyse-Tool von Google",
    type: "analytics",
    logo: "google-analytics-logo",
    status: "inactive",
    credentials: [
      {
        key: "tracking_id",
        name: "Tracking-ID",
        value: "",
        type: "text",
        required: true,
        placeholder: "UA-XXXXXXXXX-X",
        description: "Ihre Google Analytics Tracking-ID",
      },
    ],
    settings: [
      {
        key: "anonymize_ip",
        name: "IP-Anonymisierung",
        value: true,
        type: "boolean",
        description: "Anonymisiert die IP-Adressen der Besucher (erforderlich für DSGVO)",
      },
    ],
    documentationUrl: "https://developers.google.com/analytics",
    version: "GA4",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Cloud-Speicherdienst für Dateien",
    type: "storage",
    logo: "dropbox-logo",
    status: "inactive",
    credentials: [
      {
        key: "access_token",
        name: "Zugriffstoken",
        value: "",
        type: "password",
        required: true,
        placeholder: "dropbox-access-token",
        description: "Ihr Dropbox Zugriffstoken",
      },
      {
        key: "refresh_token",
        name: "Refresh-Token",
        value: "",
        type: "password",
        required: true,
        placeholder: "dropbox-refresh-token",
        description: "Ihr Dropbox Refresh-Token",
      },
    ],
    settings: [
      {
        key: "backup_folder",
        name: "Backup-Ordner",
        value: "/KMW-Backups",
        type: "text",
        description: "Pfad zum Ordner für automatische Backups",
      },
      {
        key: "auto_backup",
        name: "Automatisches Backup",
        value: true,
        type: "boolean",
        description: "Automatisches Backup von Dokumenten und Einstellungen",
      },
    ],
    documentationUrl: "https://www.dropbox.com/developers",
    version: "2.0",
  },
]

// Service functions for integrations
export const getIntegrations = async (): Promise<Integration[]> => {
  // In a real app, this would fetch from an API or database
  return Promise.resolve([...defaultIntegrations])
}

export const getIntegrationById = async (id: string): Promise<Integration | undefined> => {
  // In a real app, this would fetch from an API or database
  return Promise.resolve(defaultIntegrations.find((integration) => integration.id === id))
}

export const updateIntegration = async (updatedIntegration: Integration): Promise<Integration> => {
  // In a real app, this would update the database
  return Promise.resolve(updatedIntegration)
}

export const testIntegrationConnection = async (id: string): Promise<{ success: boolean; message: string }> => {
  // In a real app, this would actually test the connection
  // For demo purposes, we'll simulate a successful connection for configured integrations
  const integration = defaultIntegrations.find((i) => i.id === id)

  if (!integration) {
    return { success: false, message: "Integration nicht gefunden" }
  }

  const allCredentialsProvided = integration.credentials
    .filter((cred) => cred.required)
    .every((cred) => cred.value && cred.value.length > 0)

  if (!allCredentialsProvided) {
    return { success: false, message: "Nicht alle erforderlichen Anmeldedaten wurden angegeben" }
  }

  // Simulate a delay for the connection test
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Randomly succeed or fail for demo purposes
  const success = Math.random() > 0.3

  return {
    success,
    message: success
      ? "Verbindung erfolgreich hergestellt"
      : "Verbindung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.",
  }
}
