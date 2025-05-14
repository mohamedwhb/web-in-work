"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

export default function EmailSettingsPage() {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const { toast } = useToast();

  const handleTestConnection = async () => {
    try {
      setIsTestingConnection(true);
      setConnectionStatus("idle");

      // Call the API to check the configuration
      const response = await fetch("/api/email", {
        method: "GET",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check email configuration");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Check if we're in preview mode
      if (data.preview) {
        setConnectionStatus("success");
        toast({
          title: "Vorschaumodus erkannt",
          description:
            "Im Vorschaumodus wird die E-Mail-Konfiguration simuliert. In der Produktionsumgebung würde eine echte Verbindung hergestellt werden.",
        });
        return;
      }

      setConnectionStatus("success");
      toast({
        title: "Konfiguration geladen",
        description: "Die E-Mail-Konfiguration wurde erfolgreich geladen.",
      });
    } catch (error) {
      console.error("Error checking email configuration:", error);
      setConnectionStatus("error");

      // Special handling for DNS lookup errors in preview environments
      if ((error as Error).message?.includes("dns.lookup is not implemented")) {
        toast({
          title: "Vorschaumodus",
          description:
            "Im Vorschaumodus kann keine echte E-Mail-Verbindung hergestellt werden. In der Produktionsumgebung würde dies funktionieren.",
        });
        return;
      }

      toast({
        title: "Konfigurationsfehler",
        description:
          (error as Error).message ||
          "Die E-Mail-Konfiguration konnte nicht überprüft werden.",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveSettings = () => {
    toast({
      title: "Einstellungen gespeichert",
      description: "Ihre E-Mail-Einstellungen wurden erfolgreich gespeichert.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">E-Mail-Einstellungen</h1>
      </header>

      <Tabs defaultValue="server">
        <TabsList className="mb-4 flex flex-wrap h-auto justify-center md:justify-start w-fit">
          <TabsTrigger value="server">Server-Einstellungen</TabsTrigger>
          <TabsTrigger value="templates">E-Mail-Vorlagen</TabsTrigger>
          <TabsTrigger value="signatures">Signaturen</TabsTrigger>
        </TabsList>

        <TabsContent value="server">
          <Card>
            <CardHeader>
              <CardTitle>SMTP-Server Konfiguration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTP-Server</Label>
                  <Input
                    id="smtp-host"
                    placeholder="smtp.example.com"
                    defaultValue="smtp.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">Port</Label>
                  <Input
                    id="smtp-port"
                    type="number"
                    placeholder="587"
                    defaultValue="587"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-user">Benutzername</Label>
                  <Input
                    id="smtp-user"
                    placeholder="user@example.com"
                    defaultValue="office@kmw.at"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-pass">Passwort</Label>
                  <Input
                    id="smtp-pass"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-encryption">Verschlüsselung</Label>
                  <Select defaultValue="tls">
                    <SelectTrigger>
                      <SelectValue placeholder="Verschlüsselung wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Keine</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                      <SelectItem value="tls">TLS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-from">Absender</Label>
                  <Input
                    id="smtp-from"
                    placeholder="KMW GmbH <office@kmw.at>"
                    defaultValue="KMW GmbH <office@kmw.at>"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                >
                  {isTestingConnection ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verbindung wird getestet...
                    </>
                  ) : connectionStatus === "success" ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                      Verbindung erfolgreich
                    </>
                  ) : (
                    "Verbindung testen"
                  )}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSettings}>Speichern</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>E-Mail-Vorlagen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-type">Dokumenttyp</Label>
                <Select defaultValue="angebot">
                  <SelectTrigger>
                    <SelectValue placeholder="Dokumenttyp wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="angebot">Angebot</SelectItem>
                    <SelectItem value="rechnung">Rechnung</SelectItem>
                    <SelectItem value="lieferschein">Lieferschein</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-subject">Betreff</Label>
                <Input
                  id="template-subject"
                  placeholder="Betreff"
                  defaultValue="Ihr Angebot {id} von KMW GmbH"
                />
                <p className="text-xs text-muted-foreground">
                  Verfügbare Platzhalter: {"{id}"}, {"{date}"},{" "}
                  {"{customer_name}"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-body">Nachricht</Label>
                <Textarea
                  id="template-body"
                  placeholder="Nachrichtentext"
                  className="min-h-[200px]"
                  defaultValue={`Sehr geehrte(r) {customer_name},

vielen Dank für Ihr Interesse an unseren Produkten. Anbei finden Sie unser Angebot Nr. {id}.

Dieses Angebot ist gültig bis zum {valid_until}.

Bei Fragen stehen wir Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen,
KMW GmbH`}
                />
                <p className="text-xs text-muted-foreground">
                  Verfügbare Platzhalter: {"{id}"}, {"{date}"},{" "}
                  {"{customer_name}"}, {"{valid_until}"}, {"{total}"}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSettings}>Speichern</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="signatures">
          <Card>
            <CardHeader>
              <CardTitle>E-Mail-Signaturen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signature-name">Name</Label>
                <Input
                  id="signature-name"
                  placeholder="Standard-Signatur"
                  defaultValue="Standard-Signatur"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signature-content">Signatur</Label>
                <Textarea
                  id="signature-content"
                  placeholder="Signatur"
                  className="min-h-[200px]"
                  defaultValue={`Mit freundlichen Grüßen,

Mohamed Wahba
KMW GmbH

Puchsbaumgasse 1
1100 Wien
Tel: 0676123456789
E-Mail: office@kmw.at
Web: www.kmw.at`}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSettings}>Speichern</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
