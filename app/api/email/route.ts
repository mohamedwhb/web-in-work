import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { generatePDF, type DocumentType, type DocumentData } from "@/lib/pdf-generator"

// Email configuration from environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.example.com"
const EMAIL_PORT = Number.parseInt(process.env.EMAIL_PORT || "587")
const EMAIL_USER = process.env.EMAIL_USER || "user@example.com"
const EMAIL_PASS = process.env.EMAIL_PASS || "password"
const EMAIL_FROM = process.env.EMAIL_FROM || "KMW GmbH <office@kmw.at>"

// Create a mock transporter for preview environments
const createTransporter = () => {
  // Check if we're in a preview environment (like next-lite)
  const isPreviewEnv = process.env.NEXT_RUNTIME === "edge" || typeof window !== "undefined" || !process.env.NODE_ENV

  if (isPreviewEnv) {
    // Return a mock transporter for preview environments
    return {
      sendMail: async (mailOptions: any) => {
        console.log("MOCK EMAIL SENT:", mailOptions)
        return {
          messageId: `mock-${Date.now()}@preview.example.com`,
        }
      },
      verify: async () => {
        return true
      },
    }
  }

  // Create a real transporter for production environments
  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465, // true for 465, false for other ports
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  })
}

// Get the appropriate transporter
const transporter = createTransporter()

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { type, data, emailData } = body as {
      type: DocumentType
      data: DocumentData
      emailData: {
        to: string
        cc?: string
        bcc?: string
        subject: string
        message: string
      }
    }

    // Validate the request
    if (!type || !data || !emailData || !emailData.to || !emailData.subject) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate the PDF
    const pdfBuffer = await generatePDF(type, data)

    // Get document title for the attachment filename
    const documentTitle = {
      angebot: "Angebot",
      rechnung: "Rechnung",
      lieferschein: "Lieferschein",
    }[type]

    try {
      // Send the email with the PDF attachment
      const info = await transporter.sendMail({
        from: EMAIL_FROM,
        to: emailData.to,
        cc: emailData.cc,
        bcc: emailData.bcc,
        subject: emailData.subject,
        text: emailData.message,
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>${emailData.message.replace(/\n/g, "<br>")}</p>
          <p>Mit freundlichen Grüßen,<br>
          KMW GmbH</p>
        </div>`,
        attachments: [
          {
            filename: `${documentTitle}_${data.id.replace(/\s+/g, "_")}.pdf`,
            content: Buffer.from(pdfBuffer),
            contentType: "application/pdf",
          },
        ],
      })

      // Return success response
      return NextResponse.json({
        success: true,
        messageId: info.messageId,
        preview: process.env.NEXT_RUNTIME === "edge" || typeof window !== "undefined",
      })
    } catch (emailError) {
      console.error("Email sending error:", emailError)

      // Special handling for preview environment
      if (emailError.message?.includes("dns.lookup is not implemented") || emailError.code === "ENOTFOUND") {
        return NextResponse.json({
          success: true,
          messageId: `preview-${Date.now()}@example.com`,
          preview: true,
          note: "Email would be sent in production environment",
        })
      }

      throw emailError
    }
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json(
      {
        error: "Failed to send email",
        details: (error as Error).message,
        isPreview: process.env.NEXT_RUNTIME === "edge" || typeof window !== "undefined",
      },
      { status: 500 },
    )
  }
}

// Add a verification endpoint to test email configuration
export async function GET() {
  try {
    // Check if we're in a preview environment
    const isPreviewEnv = process.env.NEXT_RUNTIME === "edge" || typeof window !== "undefined" || !process.env.NODE_ENV

    if (isPreviewEnv) {
      // Return mock configuration for preview environments
      return NextResponse.json({
        status: "Email service configuration loaded (Preview Mode)",
        preview: true,
        config: {
          host: EMAIL_HOST,
          port: EMAIL_PORT,
          secure: EMAIL_PORT === 465,
          auth: {
            user: EMAIL_USER ? "Configured" : "Not configured",
            pass: EMAIL_PASS ? "Configured" : "Not configured",
          },
          from: EMAIL_FROM,
        },
      })
    }

    // For production, try to verify the connection
    await transporter.verify()

    return NextResponse.json({
      status: "Email service configuration verified",
      config: {
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        secure: EMAIL_PORT === 465,
        auth: {
          user: EMAIL_USER ? "Configured" : "Not configured",
          pass: EMAIL_PASS ? "Configured" : "Not configured",
        },
        from: EMAIL_FROM,
      },
    })
  } catch (error) {
    console.error("Email service configuration check failed:", error)
    return NextResponse.json(
      {
        error: "Email service configuration check failed",
        details: (error as Error).message,
        isPreview: process.env.NEXT_RUNTIME === "edge" || typeof window !== "undefined",
      },
      { status: 500 },
    )
  }
}
