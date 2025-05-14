/**
 * Dieses Modul generiert QR-Codes für Zahlungen nach dem EPC-QR-Code-Standard
 * (European Payments Council Quick Response Code)
 */

/**
 * Generiert einen EPC-QR-Code-String für SEPA-Überweisungen
 * Format basiert auf: https://en.wikipedia.org/wiki/EPC_QR_code
 */
export function generateEpcQrCodeData(params: {
  name: string
  iban: string
  amount: number
  reference: string
  info?: string
  bic?: string
}): string {
  const { name, iban, amount, reference, info, bic } = params

  // Formatiere den Betrag mit genau 2 Nachkommastellen und Punkt als Dezimaltrenner
  const formattedAmount = amount.toFixed(2)

  // Erstelle den QR-Code-Inhalt nach dem EPC-QR-Code-Standard
  const lines = [
    "BCD", // Service Tag (immer "BCD")
    "002", // Version (immer "002")
    "1", // Zeichenkodierung (1 = UTF-8)
    "SCT", // Identifikationscode (SCT = SEPA Credit Transfer)
    bic || "", // BIC (optional)
    name.substring(0, 70), // Name des Empfängers (max. 70 Zeichen)
    iban.replace(/\s/g, ""), // IBAN ohne Leerzeichen
    `EUR${formattedAmount}`, // Währung und Betrag
    "", // Zweck-Code (leer lassen)
    reference.substring(0, 35), // Referenz (max. 35 Zeichen)
    info ? info.substring(0, 70) : "", // Zusätzliche Informationen (max. 70 Zeichen)
  ]

  return lines.join("\n")
}

/**
 * Generiert einen QR-Code als Data-URL
 */
export async function generateQrCodeDataUrl(data: string): Promise<string> {
  // Dynamischer Import von qrcode, da es nur auf der Client-Seite benötigt wird
  const QRCode = (await import("qrcode")).default

  try {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 200,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
  } catch (error) {
    console.error("Fehler bei der QR-Code-Generierung:", error)
    throw new Error("QR-Code konnte nicht generiert werden")
  }
}

/**
 * Generiert einen Zahlungs-QR-Code als Data-URL für eine Rechnung
 */
export async function generatePaymentQrCode(params: {
  recipient: string
  iban: string
  amount: number
  reference: string
  info?: string
  bic?: string
}): Promise<string> {
  const qrData = generateEpcQrCodeData(params)
  return generateQrCodeDataUrl(qrData)
}
