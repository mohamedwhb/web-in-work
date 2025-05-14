import type { LegalText } from "@/components/legal-text-form"

// Default legal texts
const defaultLegalText: LegalText = {
  invoiceDisclaimer: "Zahlbar innerhalb von 14 Tagen ohne Abzug. Es gelten unsere allgemeinen Geschäftsbedingungen.",
  invoiceDisclaimerEnabled: true,

  offerDisclaimer: "Dieses Angebot ist freibleibend und unverbindlich. Gültig für 30 Tage ab Ausstellungsdatum.",
  offerDisclaimerEnabled: true,

  deliveryNoteDisclaimer:
    "Bitte überprüfen Sie die Ware auf Vollständigkeit und Unversehrtheit. Reklamationen innerhalb von 7 Tagen.",
  deliveryNoteDisclaimerEnabled: true,

  termsAndConditions:
    "1. Allgemeines\n\nDiese Allgemeinen Geschäftsbedingungen gelten für alle Verträge zwischen uns und unseren Kunden.\n\n2. Vertragsschluss\n\nUnsere Angebote sind freibleibend und unverbindlich.",
  termsAndConditionsTitle: "Allgemeine Geschäftsbedingungen",
  termsAndConditionsEnabled: true,

  privacyPolicy:
    "Wir verarbeiten Ihre personenbezogenen Daten gemäß der DSGVO. Weitere Informationen finden Sie in unserer vollständigen Datenschutzerklärung.",
  privacyPolicyTitle: "Datenschutzerklärung",
  privacyPolicyEnabled: true,

  cancellationPolicy:
    "Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.",
  cancellationPolicyTitle: "Widerrufsbelehrung",
  cancellationPolicyEnabled: true,

  legalNotice: "Verantwortlich für den Inhalt:\nKMW GmbH\nPuchsbaumgasse 1\n1100 Wien\nÖsterreich",
  legalNoticeTitle: "Impressum",
  legalNoticeEnabled: true,
}

// Get legal text
export function getLegalText(): LegalText {
  if (typeof window === "undefined") {
    return defaultLegalText
  }

  const savedLegalText = localStorage.getItem("legalText")
  if (!savedLegalText) {
    return defaultLegalText
  }

  try {
    return { ...defaultLegalText, ...JSON.parse(savedLegalText) }
  } catch (error) {
    console.error("Error parsing saved legal text:", error)
    return defaultLegalText
  }
}

// Save legal text
export function saveLegalText(legalText: LegalText): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem("legalText", JSON.stringify(legalText))
}

// Get disclaimer for document type
export function getDisclaimerForDocument(type: "invoice" | "offer" | "deliveryNote"): string | null {
  const legalText = getLegalText()

  switch (type) {
    case "invoice":
      return legalText.invoiceDisclaimerEnabled ? legalText.invoiceDisclaimer : null
    case "offer":
      return legalText.offerDisclaimerEnabled ? legalText.offerDisclaimer : null
    case "deliveryNote":
      return legalText.deliveryNoteDisclaimerEnabled ? legalText.deliveryNoteDisclaimer : null
    default:
      return null
  }
}

// Get terms and conditions
export function getTermsAndConditions(): { title: string; content: string } | null {
  const legalText = getLegalText()

  if (legalText.termsAndConditionsEnabled && legalText.termsAndConditions) {
    return {
      title: legalText.termsAndConditionsTitle,
      content: legalText.termsAndConditions,
    }
  }

  return null
}

// Get privacy policy
export function getPrivacyPolicy(): { title: string; content: string } | null {
  const legalText = getLegalText()

  if (legalText.privacyPolicyEnabled && legalText.privacyPolicy) {
    return {
      title: legalText.privacyPolicyTitle,
      content: legalText.privacyPolicy,
    }
  }

  return null
}

// Get legal notice
export function getLegalNotice(): { title: string; content: string } | null {
  const legalText = getLegalText()

  if (legalText.legalNoticeEnabled && legalText.legalNotice) {
    return {
      title: legalText.legalNoticeTitle,
      content: legalText.legalNotice,
    }
  }

  return null
}
