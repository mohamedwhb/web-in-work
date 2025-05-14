"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Define the schema for legal texts
const legalTextSchema = z.object({
  // Invoice Disclaimer
  invoiceDisclaimer: z.string().optional(),
  invoiceDisclaimerEnabled: z.boolean().default(true),

  // Offer Disclaimer
  offerDisclaimer: z.string().optional(),
  offerDisclaimerEnabled: z.boolean().default(true),

  // Delivery Note Disclaimer
  deliveryNoteDisclaimer: z.string().optional(),
  deliveryNoteDisclaimerEnabled: z.boolean().default(true),

  // Terms and Conditions
  termsAndConditions: z.string().optional(),
  termsAndConditionsTitle: z
    .string()
    .default("Allgemeine Geschäftsbedingungen"),
  termsAndConditionsEnabled: z.boolean().default(true),

  // Privacy Policy
  privacyPolicy: z.string().optional(),
  privacyPolicyTitle: z.string().default("Datenschutzerklärung"),
  privacyPolicyEnabled: z.boolean().default(true),

  // Cancellation Policy
  cancellationPolicy: z.string().optional(),
  cancellationPolicyTitle: z.string().default("Widerrufsbelehrung"),
  cancellationPolicyEnabled: z.boolean().default(true),

  // Legal Notice
  legalNotice: z.string().optional(),
  legalNoticeTitle: z.string().default("Impressum"),
  legalNoticeEnabled: z.boolean().default(true),
});

// Define the type based on the schema
export type LegalText = z.infer<typeof legalTextSchema>;

// Default legal texts
const defaultLegalText: LegalText = {
  invoiceDisclaimer:
    "Zahlbar innerhalb von 14 Tagen ohne Abzug. Es gelten unsere allgemeinen Geschäftsbedingungen.",
  invoiceDisclaimerEnabled: true,

  offerDisclaimer:
    "Dieses Angebot ist freibleibend und unverbindlich. Gültig für 30 Tage ab Ausstellungsdatum.",
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

  legalNotice:
    "Verantwortlich für den Inhalt:\nKMW GmbH\nPuchsbaumgasse 1\n1100 Wien\nÖsterreich",
  legalNoticeTitle: "Impressum",
  legalNoticeEnabled: true,
};

interface LegalTextFormProps {
  onSave?: (data: LegalText) => void;
  initialData?: Partial<LegalText>;
}

export function LegalTextForm({ onSave, initialData }: LegalTextFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with default values or provided initial data
  const form = useForm<LegalText>({
    resolver: zodResolver(legalTextSchema),
    defaultValues: { ...defaultLegalText, ...initialData },
  });

  // Load saved legal texts from localStorage on component mount
  useEffect(() => {
    const savedLegalText = localStorage.getItem("legalText");
    if (savedLegalText) {
      try {
        const parsedText = JSON.parse(savedLegalText);
        form.reset({ ...defaultLegalText, ...parsedText });
      } catch (error) {
        console.error("Error parsing saved legal text:", error);
      }
    }
  }, [form]);

  // Handle form submission
  const onSubmit = async (data: LegalText) => {
    setIsSaving(true);

    try {
      // Save to localStorage
      localStorage.setItem("legalText", JSON.stringify(data));

      // Call the onSave callback if provided
      if (onSave) {
        onSave(data);
      }

      toast({
        title: "Rechtliche Texte gespeichert",
        description: "Ihre rechtlichen Texte wurden erfolgreich gespeichert.",
      });
    } catch (error) {
      console.error("Error saving legal text:", error);
      toast({
        title: "Fehler beim Speichern",
        description: "Ihre rechtlichen Texte konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="disclaimers" className="w-full">
          <TabsList className="mb-4 flex flex-wrap h-auto justify-center md:justify-start w-fit">
            <TabsTrigger value="disclaimers">Dokumenten-Hinweise</TabsTrigger>
            <TabsTrigger value="terms">AGB & Richtlinien</TabsTrigger>
            <TabsTrigger value="legal">Impressum</TabsTrigger>
          </TabsList>

          {/* Document Disclaimers Tab */}
          <TabsContent value="disclaimers">
            <Card>
              <CardHeader>
                <CardTitle>Rechtliche Hinweise für Dokumente</CardTitle>
                <CardDescription>
                  Definieren Sie rechtliche Hinweise, die auf Ihren Dokumenten
                  erscheinen sollen.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Invoice Disclaimer */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between">
                    <div className="font-medium">Rechnungshinweis</div>
                    <FormField
                      control={form.control}
                      name="invoiceDisclaimerEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="text-sm text-muted-foreground">
                            {field.value ? "Aktiviert" : "Deaktiviert"}
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="invoiceDisclaimer"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Geben Sie hier Ihren rechtlichen Hinweis für Rechnungen ein"
                            className="min-h-[100px]"
                            disabled={!form.watch("invoiceDisclaimerEnabled")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Offer Disclaimer */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between">
                    <div className="font-medium">Angebotshinweis</div>
                    <FormField
                      control={form.control}
                      name="offerDisclaimerEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="text-sm text-muted-foreground">
                            {field.value ? "Aktiviert" : "Deaktiviert"}
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="offerDisclaimer"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Geben Sie hier Ihren rechtlichen Hinweis für Angebote ein"
                            className="min-h-[100px]"
                            disabled={!form.watch("offerDisclaimerEnabled")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Delivery Note Disclaimer */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between">
                    <div className="font-medium">Lieferscheinhinweis</div>
                    <FormField
                      control={form.control}
                      name="deliveryNoteDisclaimerEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="text-sm text-muted-foreground">
                            {field.value ? "Aktiviert" : "Deaktiviert"}
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="deliveryNoteDisclaimer"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Geben Sie hier Ihren rechtlichen Hinweis für Lieferscheine ein"
                            className="min-h-[100px]"
                            disabled={
                              !form.watch("deliveryNoteDisclaimerEnabled")
                            }
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Terms and Policies Tab */}
          <TabsContent value="terms">
            <Card>
              <CardHeader>
                <CardTitle>AGB und Richtlinien</CardTitle>
                <CardDescription>
                  Verwalten Sie Ihre allgemeinen Geschäftsbedingungen und andere
                  Richtlinien.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Terms and Conditions */}
                <div className="space-y-2">
                  <div className="flex flex-col md:flex-row gap-2  items-center justify-between">
                    <FormField
                      control={form.control}
                      name="termsAndConditionsTitle"
                      render={({ field }) => (
                        <FormItem className="flex-1 mr-4">
                          <FormControl>
                            <Input
                              placeholder="Titel der AGB"
                              disabled={
                                !form.watch("termsAndConditionsEnabled")
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="termsAndConditionsEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="text-sm text-muted-foreground">
                            {field.value ? "Aktiviert" : "Deaktiviert"}
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="termsAndConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Geben Sie hier Ihre allgemeinen Geschäftsbedingungen ein"
                            className="min-h-[200px]"
                            disabled={!form.watch("termsAndConditionsEnabled")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Privacy Policy */}
                <div className="space-y-2">
                  <div className="flex flex-col md:flex-row gap-2  items-center justify-between">
                    <FormField
                      control={form.control}
                      name="privacyPolicyTitle"
                      render={({ field }) => (
                        <FormItem className="flex-1 mr-4">
                          <FormControl>
                            <Input
                              placeholder="Titel der Datenschutzerklärung"
                              disabled={!form.watch("privacyPolicyEnabled")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="privacyPolicyEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="text-sm text-muted-foreground">
                            {field.value ? "Aktiviert" : "Deaktiviert"}
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="privacyPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Geben Sie hier Ihre Datenschutzerklärung ein"
                            className="min-h-[200px]"
                            disabled={!form.watch("privacyPolicyEnabled")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Cancellation Policy */}
                <div className="space-y-2">
                  <div className="flex flex-col md:flex-row gap-2  items-center justify-between">
                    <FormField
                      control={form.control}
                      name="cancellationPolicyTitle"
                      render={({ field }) => (
                        <FormItem className="flex-1 mr-4">
                          <FormControl>
                            <Input
                              placeholder="Titel der Widerrufsbelehrung"
                              disabled={
                                !form.watch("cancellationPolicyEnabled")
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cancellationPolicyEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="text-sm text-muted-foreground">
                            {field.value ? "Aktiviert" : "Deaktiviert"}
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="cancellationPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Geben Sie hier Ihre Widerrufsbelehrung ein"
                            className="min-h-[200px]"
                            disabled={!form.watch("cancellationPolicyEnabled")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Legal Notice Tab */}
          <TabsContent value="legal">
            <Card>
              <CardHeader>
                <CardTitle>Impressum</CardTitle>
                <CardDescription>
                  Verwalten Sie Ihr Impressum und andere rechtliche
                  Informationen.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Legal Notice */}
                <div className="space-y-2">
                  <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
                    <FormField
                      control={form.control}
                      name="legalNoticeTitle"
                      render={({ field }) => (
                        <FormItem className="flex-1 mr-4">
                          <FormControl>
                            <Input
                              placeholder="Titel des Impressums"
                              disabled={!form.watch("legalNoticeEnabled")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="legalNoticeEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="text-sm text-muted-foreground">
                            {field.value ? "Aktiviert" : "Deaktiviert"}
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="legalNotice"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Geben Sie hier Ihr Impressum ein"
                            className="min-h-[200px]"
                            disabled={!form.watch("legalNoticeEnabled")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>Speichern...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Rechtliche Texte speichern
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
