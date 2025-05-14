"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/page-header"
import { getTermsAndConditions, getPrivacyPolicy, getLegalNotice } from "@/lib/legal-service"

export default function LegalPage() {
  const [termsAndConditions, setTermsAndConditions] = useState<{ title: string; content: string } | null>(null)
  const [privacyPolicy, setPrivacyPolicy] = useState<{ title: string; content: string } | null>(null)
  const [legalNotice, setLegalNotice] = useState<{ title: string; content: string } | null>(null)

  useEffect(() => {
    setTermsAndConditions(getTermsAndConditions())
    setPrivacyPolicy(getPrivacyPolicy())
    setLegalNotice(getLegalNotice())
  }, [])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader heading="Rechtliche Informationen" description="AGB, Datenschutz und Impressum" />

      <Tabs defaultValue="terms" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="terms">AGB</TabsTrigger>
          <TabsTrigger value="privacy">Datenschutz</TabsTrigger>
          <TabsTrigger value="legal">Impressum</TabsTrigger>
        </TabsList>

        <TabsContent value="terms">
          {termsAndConditions ? (
            <Card>
              <CardHeader>
                <CardTitle>{termsAndConditions.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap">{termsAndConditions.content}</div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Keine AGB definiert</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Es wurden keine allgemeinen Geschäftsbedingungen definiert oder diese sind deaktiviert.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="privacy">
          {privacyPolicy ? (
            <Card>
              <CardHeader>
                <CardTitle>{privacyPolicy.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap">{privacyPolicy.content}</div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Keine Datenschutzerklärung definiert</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Es wurde keine Datenschutzerklärung definiert oder diese ist deaktiviert.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="legal">
          {legalNotice ? (
            <Card>
              <CardHeader>
                <CardTitle>{legalNotice.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap">{legalNotice.content}</div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Kein Impressum definiert</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Es wurde kein Impressum definiert oder dieses ist deaktiviert.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
