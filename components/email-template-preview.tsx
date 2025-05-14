"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DocumentType, DocumentData } from "@/lib/pdf-generator"

interface EmailTemplatePreviewProps {
  type: DocumentType
  data: DocumentData
  subject: string
  message: string
}

export default function EmailTemplatePreview({ type, data, subject, message }: EmailTemplatePreviewProps) {
  const [viewMode, setViewMode] = useState<"preview" | "html" | "text">("preview")

  // Replace placeholders in the template
  const processedSubject = replacePlaceholders(subject, type, data)
  const processedMessage = replacePlaceholders(message, type, data)

  // Convert plain text to HTML
  const htmlMessage = processedMessage.replace(/\n/g, "<br>")

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>E-Mail-Vorschau</CardTitle>
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="w-fit">
          <TabsList>
            <TabsTrigger value="preview">Vorschau</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {viewMode === "preview" && (
          <div className="border rounded-md p-4 space-y-4">
            <div className="border-b pb-2">
              <div className="text-sm text-muted-foreground">Von: KMW GmbH &lt;office@kmw.at&gt;</div>
              <div className="text-sm text-muted-foreground">
                An: {data.customer.name} &lt;{data.customer.email || "kunde@example.com"}&gt;
              </div>
              <div className="font-medium">{processedSubject}</div>
            </div>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: htmlMessage }} />
            <div className="border-t pt-2 text-sm text-muted-foreground">
              <p>-- </p>
              <p>
                KMW GmbH
                <br />
                Puchsbaumgasse 1, 1100 Wien
                <br />
                Tel: 0676123456789
                <br />
                E-Mail: office@kmw.at
              </p>
            </div>
          </div>
        )}

        {viewMode === "html" && (
          <pre className="border rounded-md p-4 overflow-auto text-xs bg-muted whitespace-pre-wrap">
            {`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${processedSubject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div>
    ${htmlMessage}
  </div>
  <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; color: #666; font-size: 12px;">
    <p>-- </p>
    <p>
      KMW GmbH<br>
      Puchsbaumgasse 1, 1100 Wien<br>
      Tel: 0676123456789<br>
      E-Mail: office@kmw.at
    </p>
  </div>
</body>
</html>`}
          </pre>
        )}

        {viewMode === "text" && (
          <pre className="border rounded-md p-4 overflow-auto text-xs bg-muted whitespace-pre-wrap">
            {`${processedSubject}

${processedMessage}

-- 
KMW GmbH
Puchsbaumgasse 1, 1100 Wien
Tel: 0676123456789
E-Mail: office@kmw.at`}
          </pre>
        )}
      </CardContent>
    </Card>
  )
}

// Helper function to replace placeholders in templates
function replacePlaceholders(template: string, type: DocumentType, data: DocumentData): string {
  const validUntil = new Date()
  validUntil.setDate(validUntil.getDate() + 30)
  const validUntilStr = validUntil.toLocaleDateString("de-DE")

  const customerName = data.customer.name.split(" ")[0] || "Kunde"

  return template
    .replace(/{id}/g, data.id)
    .replace(/{date}/g, data.date)
    .replace(/{customer_name}/g, customerName)
    .replace(/{valid_until}/g, validUntilStr)
    .replace(/{total}/g, `${data.total.toFixed(2)} €`)
}
