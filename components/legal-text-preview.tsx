"use client";

import type { LegalText } from "@/components/legal-text-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLegalText } from "@/lib/legal-service";
import { useEffect, useState } from "react";

export function LegalTextPreview() {
  const [legalText, setLegalText] = useState<LegalText | null>(null);

  // Load legal text from localStorage on component mount
  useEffect(() => {
    setLegalText(getLegalText());
  }, []);

  if (!legalText) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vorschau</CardTitle>
          <CardDescription>
            Keine rechtlichen Texte gefunden. Bitte füllen Sie das Formular aus.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="-mx-8">
      <CardHeader>
        <CardTitle>Vorschau</CardTitle>
        <CardDescription>
          So werden Ihre rechtlichen Texte angezeigt.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="disclaimers" className="w-full">
          <TabsList className="mb-4 flex flex-wrap h-auto justify-center md:justify-start w-fit">
            <TabsTrigger value="disclaimers">Dokumenten-Hinweise</TabsTrigger>
            <TabsTrigger value="terms">AGB</TabsTrigger>
            <TabsTrigger value="privacy">Datenschutz</TabsTrigger>
            <TabsTrigger value="legal">Impressum</TabsTrigger>
          </TabsList>

          <TabsContent value="disclaimers">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Dokumenten-Hinweise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {legalText.invoiceDisclaimerEnabled &&
                  legalText.invoiceDisclaimer && (
                    <div className="border p-4 rounded-md">
                      <h3 className="text-sm font-medium mb-2">
                        Rechnungshinweis:
                      </h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {legalText.invoiceDisclaimer}
                      </p>
                    </div>
                  )}

                {legalText.offerDisclaimerEnabled &&
                  legalText.offerDisclaimer && (
                    <div className="border p-4 rounded-md">
                      <h3 className="text-sm font-medium mb-2">
                        Angebotshinweis:
                      </h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {legalText.offerDisclaimer}
                      </p>
                    </div>
                  )}

                {legalText.deliveryNoteDisclaimerEnabled &&
                  legalText.deliveryNoteDisclaimer && (
                    <div className="border p-4 rounded-md">
                      <h3 className="text-sm font-medium mb-2">
                        Lieferscheinhinweis:
                      </h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {legalText.deliveryNoteDisclaimer}
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="terms">
            {legalText.termsAndConditionsEnabled &&
            legalText.termsAndConditions ? (
              <Card>
                <CardHeader>
                  <CardTitle>{legalText.termsAndConditionsTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                    <div className="text-sm whitespace-pre-wrap">
                      {legalText.termsAndConditions}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Keine AGB definiert</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Sie haben keine allgemeinen Geschäftsbedingungen definiert
                    oder diese sind deaktiviert.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="privacy">
            {legalText.privacyPolicyEnabled && legalText.privacyPolicy ? (
              <Card>
                <CardHeader>
                  <CardTitle>{legalText.privacyPolicyTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                    <div className="text-sm whitespace-pre-wrap">
                      {legalText.privacyPolicy}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Keine Datenschutzerklärung definiert</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Sie haben keine Datenschutzerklärung definiert oder diese
                    ist deaktiviert.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="legal">
            {legalText.legalNoticeEnabled && legalText.legalNotice ? (
              <Card>
                <CardHeader>
                  <CardTitle>{legalText.legalNoticeTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                    <div className="text-sm whitespace-pre-wrap">
                      {legalText.legalNotice}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Kein Impressum definiert</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Sie haben kein Impressum definiert oder dieses ist
                    deaktiviert.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
