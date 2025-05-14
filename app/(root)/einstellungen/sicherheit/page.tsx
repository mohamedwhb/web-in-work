"use client";

import AutosaveIndicator from "@/components/autosave-indicator";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { useAutosave } from "@/hooks/use-autosave";
import {
  Info,
  Lock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    passwordExpiration: number; // Tage
    preventReuse: number; // Anzahl der vorherigen Passwörter
  };
  twoFactorAuth: {
    enabled: boolean;
    required: boolean;
    methods: ("app" | "sms" | "email")[];
    graceperiod: number; // Tage
  };
  sessionManagement: {
    sessionTimeout: number; // Minuten
    maxConcurrentSessions: number;
    rememberMeEnabled: boolean;
    rememberMeDuration: number; // Tage
  };
  accessLogging: {
    enabled: boolean;
    retentionPeriod: number; // Tage
    logFailedAttempts: boolean;
    logSuccessfulLogins: boolean;
    alertOnSuspiciousActivity: boolean;
  };
  ipRestriction: {
    enabled: boolean;
    allowedIPs: string[];
    blockUnknownIPs: boolean;
  };
}

// Mock-Daten für die Sicherheitseinstellungen
const defaultSecuritySettings: SecuritySettings = {
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    passwordExpiration: 90,
    preventReuse: 5,
  },
  twoFactorAuth: {
    enabled: true,
    required: false,
    methods: ["app", "email"],
    graceperiod: 7,
  },
  sessionManagement: {
    sessionTimeout: 30,
    maxConcurrentSessions: 3,
    rememberMeEnabled: true,
    rememberMeDuration: 30,
  },
  accessLogging: {
    enabled: true,
    retentionPeriod: 90,
    logFailedAttempts: true,
    logSuccessfulLogins: true,
    alertOnSuspiciousActivity: true,
  },
  ipRestriction: {
    enabled: false,
    allowedIPs: [],
    blockUnknownIPs: false,
  },
};

export default function SecuritySettingsPage() {
  const [settings, setSettings] = useState<SecuritySettings>(
    defaultSecuritySettings
  );
  const [newIP, setNewIP] = useState("");
  const [activeTab, setActiveTab] = useState("password");

  // Autosave-Funktion
  const { isSaving, lastSaved } = useAutosave({
    data: settings,
    onSave: async (data) => {
      // Hier würde normalerweise ein API-Aufruf stehen
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast({
        title: "Einstellungen gespeichert",
        description:
          "Die Sicherheitseinstellungen wurden erfolgreich aktualisiert.",
      });
      return true;
    },
  });

  // Passwort-Stärke berechnen
  const passwordStrength = useMemo(() => {
    const {
      minLength,
      requireUppercase,
      requireLowercase,
      requireNumbers,
      requireSpecialChars,
    } = settings.passwordPolicy;
    let strength = 0;

    if (minLength >= 12) strength += 2;
    else if (minLength >= 8) strength += 1;

    if (requireUppercase) strength += 1;
    if (requireLowercase) strength += 1;
    if (requireNumbers) strength += 1;
    if (requireSpecialChars) strength += 2;

    if (strength >= 6) return { value: "Stark", color: "bg-green-500" };
    if (strength >= 4) return { value: "Mittel", color: "bg-yellow-500" };
    return { value: "Schwach", color: "bg-red-500" };
  }, [settings.passwordPolicy]);

  // IP-Adresse hinzufügen
  const addIP = useCallback(() => {
    if (!newIP) return;

    // Einfache IP-Validierung
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
    if (!ipRegex.test(newIP)) {
      toast({
        title: "Ungültige IP-Adresse",
        description:
          "Bitte geben Sie eine gültige IP-Adresse oder CIDR-Notation ein.",
        variant: "destructive",
      });
      return;
    }

    setSettings((prev) => ({
      ...prev,
      ipRestriction: {
        ...prev.ipRestriction,
        allowedIPs: [...prev.ipRestriction.allowedIPs, newIP],
      },
    }));
    setNewIP("");

    toast({
      title: "IP-Adresse hinzugefügt",
      description: `${newIP} wurde zur Liste der erlaubten IP-Adressen hinzugefügt.`,
    });
  }, [newIP]);

  // IP-Adresse entfernen
  const removeIP = useCallback((ip: string) => {
    setSettings((prev) => ({
      ...prev,
      ipRestriction: {
        ...prev.ipRestriction,
        allowedIPs: prev.ipRestriction.allowedIPs.filter((item) => item !== ip),
      },
    }));

    toast({
      title: "IP-Adresse entfernt",
      description: `${ip} wurde aus der Liste der erlaubten IP-Adressen entfernt.`,
    });
  }, []);

  // 2FA-Methode umschalten
  const toggle2FAMethod = useCallback((method: "app" | "sms" | "email") => {
    setSettings((prev) => {
      const methods = prev.twoFactorAuth.methods;
      const newMethods = methods.includes(method)
        ? methods.filter((m) => m !== method)
        : [...methods, method];

      // Mindestens eine Methode muss aktiviert bleiben
      if (newMethods.length === 0) {
        toast({
          title: "Mindestens eine 2FA-Methode erforderlich",
          description:
            "Es muss mindestens eine Zwei-Faktor-Authentifizierungsmethode aktiviert sein.",
          variant: "destructive",
        });
        return prev;
      }

      return {
        ...prev,
        twoFactorAuth: {
          ...prev.twoFactorAuth,
          methods: newMethods,
        },
      };
    });
  }, []);

  // Sicherheitstest durchführen
  const runSecurityTest = useCallback(() => {
    toast({
      title: "Sicherheitstest gestartet",
      description:
        "Der Sicherheitstest wird durchgeführt. Dies kann einige Minuten dauern.",
    });

    // Simuliere einen Sicherheitstest
    setTimeout(() => {
      toast({
        title: "Sicherheitstest abgeschlossen",
        description:
          "Der Sicherheitstest wurde erfolgreich abgeschlossen. Keine kritischen Probleme gefunden.",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Hier könnte ein detaillierter Bericht angezeigt werden
            }}
          >
            Bericht anzeigen
          </Button>
        ),
      });
    }, 3000);
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <PageHeader
          heading="Sicherheitseinstellungen"
          description="Konfigurieren Sie die Sicherheitseinstellungen für Ihr System"
          headerClassName="max-md:text-2xl"
        />
        <div className="flex items-center gap-2">
          <AutosaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
          <Button onClick={runSecurityTest} variant="outline">
            <Shield className="mr-2 h-4 w-4" />
            Sicherheitstest
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto justify-center md:justify-start w-fit mb-6">
          <TabsTrigger value="password">
            <Lock className="mr-2 h-4 w-4" />
            Passwort
          </TabsTrigger>
          <TabsTrigger value="2fa">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Zwei-Faktor
          </TabsTrigger>
          <TabsTrigger value="session">
            <UserCheck className="mr-2 h-4 w-4" />
            Sitzungen
          </TabsTrigger>
          <TabsTrigger value="logging">
            <Info className="mr-2 h-4 w-4" />
            Protokollierung
          </TabsTrigger>
          <TabsTrigger value="ip">
            <ShieldAlert className="mr-2 h-4 w-4" />
            IP-Beschränkung
          </TabsTrigger>
        </TabsList>

        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Passwortrichtlinien</span>
                <Badge className={passwordStrength.color}>
                  {passwordStrength.value}
                </Badge>
              </CardTitle>
              <CardDescription>
                Legen Sie die Anforderungen für Benutzerpasswörter fest
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="minLength">
                    Mindestlänge: {settings.passwordPolicy.minLength} Zeichen
                  </Label>
                </div>
                <Slider
                  id="minLength"
                  min={6}
                  max={16}
                  step={1}
                  value={[settings.passwordPolicy.minLength]}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      passwordPolicy: {
                        ...prev.passwordPolicy,
                        minLength: value[0],
                      },
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireUppercase"
                    checked={settings.passwordPolicy.requireUppercase}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          requireUppercase: checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="requireUppercase">
                    Großbuchstaben erforderlich
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireLowercase"
                    checked={settings.passwordPolicy.requireLowercase}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          requireLowercase: checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="requireLowercase">
                    Kleinbuchstaben erforderlich
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireNumbers"
                    checked={settings.passwordPolicy.requireNumbers}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          requireNumbers: checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="requireNumbers">Zahlen erforderlich</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireSpecialChars"
                    checked={settings.passwordPolicy.requireSpecialChars}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          requireSpecialChars: checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="requireSpecialChars">
                    Sonderzeichen erforderlich
                  </Label>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordExpiration">
                    Passwortablauf nach (Tage)
                  </Label>
                  <Select
                    value={settings.passwordPolicy.passwordExpiration.toString()}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          passwordExpiration: Number.parseInt(value),
                        },
                      }))
                    }
                  >
                    <SelectTrigger id="passwordExpiration">
                      <SelectValue placeholder="Wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 Tage</SelectItem>
                      <SelectItem value="60">60 Tage</SelectItem>
                      <SelectItem value="90">90 Tage</SelectItem>
                      <SelectItem value="180">180 Tage</SelectItem>
                      <SelectItem value="365">365 Tage</SelectItem>
                      <SelectItem value="0">Nie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preventReuse">
                    Wiederverwendung verhindern (letzte Passwörter)
                  </Label>
                  <Select
                    value={settings.passwordPolicy.preventReuse.toString()}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          preventReuse: Number.parseInt(value),
                        },
                      }))
                    }
                  >
                    <SelectTrigger id="preventReuse">
                      <SelectValue placeholder="Wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Keine Einschränkung</SelectItem>
                      <SelectItem value="3">3 Passwörter</SelectItem>
                      <SelectItem value="5">5 Passwörter</SelectItem>
                      <SelectItem value="10">10 Passwörter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="ml-auto"
                onClick={() => {
                  setSettings((prev) => ({
                    ...prev,
                    passwordPolicy: defaultSecuritySettings.passwordPolicy,
                  }));
                  toast({ title: "Passwortrichtlinien zurückgesetzt" });
                }}
              >
                Zurücksetzen
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="2fa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Zwei-Faktor-Authentifizierung</CardTitle>
              <CardDescription>
                Konfigurieren Sie die Zwei-Faktor-Authentifizierung für erhöhte
                Sicherheit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="2faEnabled"
                  checked={settings.twoFactorAuth.enabled}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      twoFactorAuth: {
                        ...prev.twoFactorAuth,
                        enabled: checked,
                      },
                    }))
                  }
                />
                <Label htmlFor="2faEnabled">
                  Zwei-Faktor-Authentifizierung aktivieren
                </Label>
              </div>

              {settings.twoFactorAuth.enabled && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="2faRequired"
                      checked={settings.twoFactorAuth.required}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          twoFactorAuth: {
                            ...prev.twoFactorAuth,
                            required: checked,
                          },
                        }))
                      }
                    />
                    <Label htmlFor="2faRequired">
                      Für alle Benutzer verpflichtend
                    </Label>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Verfügbare Methoden</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="2faApp"
                          checked={settings.twoFactorAuth.methods.includes(
                            "app"
                          )}
                          onCheckedChange={() => toggle2FAMethod("app")}
                        />
                        <Label htmlFor="2faApp">Authenticator App</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="2faSms"
                          checked={settings.twoFactorAuth.methods.includes(
                            "sms"
                          )}
                          onCheckedChange={() => toggle2FAMethod("sms")}
                        />
                        <Label htmlFor="2faSms">SMS</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="2faEmail"
                          checked={settings.twoFactorAuth.methods.includes(
                            "email"
                          )}
                          onCheckedChange={() => toggle2FAMethod("email")}
                        />
                        <Label htmlFor="2faEmail">E-Mail</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="graceperiod">
                      Karenzzeit für neue Benutzer (Tage)
                    </Label>
                    <Select
                      value={settings.twoFactorAuth.graceperiod.toString()}
                      onValueChange={(value) =>
                        setSettings((prev) => ({
                          ...prev,
                          twoFactorAuth: {
                            ...prev.twoFactorAuth,
                            graceperiod: Number.parseInt(value),
                          },
                        }))
                      }
                    >
                      <SelectTrigger id="graceperiod">
                        <SelectValue placeholder="Wählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Keine Karenzzeit</SelectItem>
                        <SelectItem value="3">3 Tage</SelectItem>
                        <SelectItem value="7">7 Tage</SelectItem>
                        <SelectItem value="14">14 Tage</SelectItem>
                        <SelectItem value="30">30 Tage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="ml-auto"
                onClick={() => {
                  setSettings((prev) => ({
                    ...prev,
                    twoFactorAuth: defaultSecuritySettings.twoFactorAuth,
                  }));
                  toast({ title: "2FA-Einstellungen zurückgesetzt" });
                }}
              >
                Zurücksetzen
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="session" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sitzungsverwaltung</CardTitle>
              <CardDescription>
                Konfigurieren Sie die Einstellungen für Benutzersitzungen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">
                  Sitzungs-Timeout (Minuten)
                </Label>
                <Select
                  value={settings.sessionManagement.sessionTimeout.toString()}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      sessionManagement: {
                        ...prev.sessionManagement,
                        sessionTimeout: Number.parseInt(value),
                      },
                    }))
                  }
                >
                  <SelectTrigger id="sessionTimeout">
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 Minuten</SelectItem>
                    <SelectItem value="30">30 Minuten</SelectItem>
                    <SelectItem value="60">1 Stunde</SelectItem>
                    <SelectItem value="120">2 Stunden</SelectItem>
                    <SelectItem value="240">4 Stunden</SelectItem>
                    <SelectItem value="480">8 Stunden</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxConcurrentSessions">
                  Maximale gleichzeitige Sitzungen
                </Label>
                <Select
                  value={settings.sessionManagement.maxConcurrentSessions.toString()}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      sessionManagement: {
                        ...prev.sessionManagement,
                        maxConcurrentSessions: Number.parseInt(value),
                      },
                    }))
                  }
                >
                  <SelectTrigger id="maxConcurrentSessions">
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Sitzung</SelectItem>
                    <SelectItem value="2">2 Sitzungen</SelectItem>
                    <SelectItem value="3">3 Sitzungen</SelectItem>
                    <SelectItem value="5">5 Sitzungen</SelectItem>
                    <SelectItem value="10">10 Sitzungen</SelectItem>
                    <SelectItem value="0">Unbegrenzt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="rememberMeEnabled"
                  checked={settings.sessionManagement.rememberMeEnabled}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      sessionManagement: {
                        ...prev.sessionManagement,
                        rememberMeEnabled: checked,
                      },
                    }))
                  }
                />
                <Label htmlFor="rememberMeEnabled">
                  "Angemeldet bleiben" Option aktivieren
                </Label>
              </div>

              {settings.sessionManagement.rememberMeEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="rememberMeDuration">
                    Dauer für "Angemeldet bleiben" (Tage)
                  </Label>
                  <Select
                    value={settings.sessionManagement.rememberMeDuration.toString()}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        sessionManagement: {
                          ...prev.sessionManagement,
                          rememberMeDuration: Number.parseInt(value),
                        },
                      }))
                    }
                  >
                    <SelectTrigger id="rememberMeDuration">
                      <SelectValue placeholder="Wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 Tage</SelectItem>
                      <SelectItem value="14">14 Tage</SelectItem>
                      <SelectItem value="30">30 Tage</SelectItem>
                      <SelectItem value="60">60 Tage</SelectItem>
                      <SelectItem value="90">90 Tage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="secondary"
                className="mr-auto"
                onClick={() => {
                  toast({
                    title: "Aktive Sitzungen beenden",
                    description:
                      "Möchten Sie alle aktiven Benutzersitzungen beenden?",
                    action: (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Sitzungen beendet",
                            description:
                              "Alle aktiven Benutzersitzungen wurden beendet.",
                          });
                        }}
                      >
                        Bestätigen
                      </Button>
                    ),
                  });
                }}
              >
                Alle Sitzungen beenden
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setSettings((prev) => ({
                    ...prev,
                    sessionManagement:
                      defaultSecuritySettings.sessionManagement,
                  }));
                  toast({ title: "Sitzungseinstellungen zurückgesetzt" });
                }}
              >
                Zurücksetzen
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="logging" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Zugriffsprotokollierung</CardTitle>
              <CardDescription>
                Konfigurieren Sie die Protokollierung von Benutzeraktivitäten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="loggingEnabled"
                  checked={settings.accessLogging.enabled}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      accessLogging: {
                        ...prev.accessLogging,
                        enabled: checked,
                      },
                    }))
                  }
                />
                <Label htmlFor="loggingEnabled">
                  Zugriffsprotokollierung aktivieren
                </Label>
              </div>

              {settings.accessLogging.enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="retentionPeriod">
                      Aufbewahrungszeitraum (Tage)
                    </Label>
                    <Select
                      value={settings.accessLogging.retentionPeriod.toString()}
                      onValueChange={(value) =>
                        setSettings((prev) => ({
                          ...prev,
                          accessLogging: {
                            ...prev.accessLogging,
                            retentionPeriod: Number.parseInt(value),
                          },
                        }))
                      }
                    >
                      <SelectTrigger id="retentionPeriod">
                        <SelectValue placeholder="Wählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 Tage</SelectItem>
                        <SelectItem value="60">60 Tage</SelectItem>
                        <SelectItem value="90">90 Tage</SelectItem>
                        <SelectItem value="180">180 Tage</SelectItem>
                        <SelectItem value="365">365 Tage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="logFailedAttempts"
                        checked={settings.accessLogging.logFailedAttempts}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            accessLogging: {
                              ...prev.accessLogging,
                              logFailedAttempts: checked,
                            },
                          }))
                        }
                      />
                      <Label htmlFor="logFailedAttempts">
                        Fehlgeschlagene Anmeldeversuche protokollieren
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="logSuccessfulLogins"
                        checked={settings.accessLogging.logSuccessfulLogins}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            accessLogging: {
                              ...prev.accessLogging,
                              logSuccessfulLogins: checked,
                            },
                          }))
                        }
                      />
                      <Label htmlFor="logSuccessfulLogins">
                        Erfolgreiche Anmeldungen protokollieren
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="alertOnSuspiciousActivity"
                      checked={settings.accessLogging.alertOnSuspiciousActivity}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          accessLogging: {
                            ...prev.accessLogging,
                            alertOnSuspiciousActivity: checked,
                          },
                        }))
                      }
                    />
                    <Label htmlFor="alertOnSuspiciousActivity">
                      Bei verdächtigen Aktivitäten benachrichtigen
                    </Label>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="secondary"
                onClick={() => {
                  toast({
                    title: "Protokolle exportieren",
                    description:
                      "Die Protokolle werden für den Export vorbereitet...",
                  });

                  // Simuliere Export
                  setTimeout(() => {
                    toast({
                      title: "Export abgeschlossen",
                      description:
                        "Die Protokolle wurden erfolgreich exportiert.",
                    });
                  }, 2000);
                }}
              >
                Protokolle exportieren
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setSettings((prev) => ({
                    ...prev,
                    accessLogging: defaultSecuritySettings.accessLogging,
                  }));
                  toast({
                    title: "Protokollierungseinstellungen zurückgesetzt",
                  });
                }}
              >
                Zurücksetzen
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="ip" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>IP-Beschränkung</CardTitle>
              <CardDescription>
                Beschränken Sie den Zugriff auf bestimmte IP-Adressen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="ipRestrictionEnabled"
                  checked={settings.ipRestriction.enabled}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      ipRestriction: {
                        ...prev.ipRestriction,
                        enabled: checked,
                      },
                    }))
                  }
                />
                <Label htmlFor="ipRestrictionEnabled">
                  IP-Beschränkung aktivieren
                </Label>
              </div>

              {settings.ipRestriction.enabled && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="blockUnknownIPs"
                      checked={settings.ipRestriction.blockUnknownIPs}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          ipRestriction: {
                            ...prev.ipRestriction,
                            blockUnknownIPs: checked,
                          },
                        }))
                      }
                    />
                    <Label htmlFor="blockUnknownIPs">
                      Unbekannte IP-Adressen blockieren
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Erlaubte IP-Adressen</Label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="z.B. 192.168.1.1 oder 10.0.0.0/24"
                        value={newIP}
                        onChange={(e) => setNewIP(e.target.value)}
                      />
                      <Button onClick={addIP}>Hinzufügen</Button>
                    </div>
                  </div>

                  <div className="border rounded-md">
                    <ScrollArea className="h-[200px] w-full">
                      {settings.ipRestriction.allowedIPs.length > 0 ? (
                        <div className="p-4 space-y-2">
                          {settings.ipRestriction.allowedIPs.map((ip) => (
                            <div
                              key={ip}
                              className="flex items-center justify-between p-2 bg-muted rounded-md"
                            >
                              <span>{ip}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeIP(ip)}
                              >
                                Entfernen
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-muted-foreground">
                          Keine IP-Adressen hinzugefügt
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="ml-auto"
                onClick={() => {
                  setSettings((prev) => ({
                    ...prev,
                    ipRestriction: defaultSecuritySettings.ipRestriction,
                  }));
                  toast({
                    title: "IP-Beschränkungseinstellungen zurückgesetzt",
                  });
                }}
              >
                Zurücksetzen
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
