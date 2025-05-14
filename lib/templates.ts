// Define template types and interfaces
export interface DocumentTemplate {
  id: string
  name: string
  description: string
  preview: string
  colors: {
    primary: string
    secondary: string
    accent: string
    text: string
  }
  fonts: {
    header: string
    body: string
  }
  layout: "standard" | "modern" | "compact" | "elegant"
  showLogo: boolean
  showSignature: boolean
  showFooter: boolean
  showWatermark: boolean
}

// Predefined templates
export const documentTemplates: DocumentTemplate[] = [
  {
    id: "standard",
    name: "Standard",
    description: "Klassisches Geschäftsdokument mit professionellem Layout",
    preview: "/placeholder.svg?height=100&width=150",
    colors: {
      primary: "#2980b9",
      secondary: "#3498db",
      accent: "#e74c3c",
      text: "#2c3e50",
    },
    fonts: {
      header: "helvetica",
      body: "helvetica",
    },
    layout: "standard",
    showLogo: true,
    showSignature: true,
    showFooter: true,
    showWatermark: false,
  },
  {
    id: "modern",
    name: "Modern",
    description: "Modernes Design mit klaren Linien und mehr Weißraum",
    preview: "/placeholder.svg?height=100&width=150",
    colors: {
      primary: "#3498db",
      secondary: "#2ecc71",
      accent: "#e74c3c",
      text: "#34495e",
    },
    fonts: {
      header: "helvetica",
      body: "helvetica",
    },
    layout: "modern",
    showLogo: true,
    showSignature: true,
    showFooter: true,
    showWatermark: false,
  },
  {
    id: "compact",
    name: "Kompakt",
    description: "Platzsparendes Layout für Dokumente mit vielen Positionen",
    preview: "/placeholder.svg?height=100&width=150",
    colors: {
      primary: "#16a085",
      secondary: "#1abc9c",
      accent: "#f39c12",
      text: "#2c3e50",
    },
    fonts: {
      header: "helvetica",
      body: "helvetica",
    },
    layout: "compact",
    showLogo: true,
    showSignature: true,
    showFooter: true,
    showWatermark: false,
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Elegantes Design für hochwertige Angebote und Rechnungen",
    preview: "/placeholder.svg?height=100&width=150",
    colors: {
      primary: "#8e44ad",
      secondary: "#9b59b6",
      accent: "#f1c40f",
      text: "#2c3e50",
    },
    fonts: {
      header: "helvetica",
      body: "helvetica",
    },
    layout: "elegant",
    showLogo: true,
    showSignature: true,
    showFooter: true,
    showWatermark: false,
  },
]

// Get template by ID
export function getTemplateById(id: string): DocumentTemplate {
  return documentTemplates.find((template) => template.id === id) || documentTemplates[0]
}

// Get default template
export function getDefaultTemplate(): DocumentTemplate {
  return documentTemplates[0]
}
