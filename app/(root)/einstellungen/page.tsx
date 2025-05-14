"use client";

import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bell,
  Building,
  Calculator,
  Clock,
  CreditCard,
  FileCheck,
  FileText,
  Globe,
  ImageIcon,
  Mail,
  Palette,
  PenTool,
  Printer,
  Scale,
  Settings,
  Shield,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        heading="Einstellungen"
        description="Verwalten Sie Ihre Systemeinstellungen"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Company Section */}
        <div className="col-span-full">
          <h2 className="text-xl font-semibold mb-4">Unternehmen</h2>
        </div>

        {/* Company Information */}
        <Link href="/einstellungen/firma">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                Firmendaten
              </CardTitle>
              <Building className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Verwalten Sie Ihre Firmeninformationen und Kontaktdaten.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* Company Logo */}
        <Link href="/einstellungen/firmenlogo">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                Firmenlogo
              </CardTitle>
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Laden Sie Ihr Firmenlogo hoch und passen Sie es an.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* Legal Texts */}
        <Link href="/einstellungen/rechtliches">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                Rechtliche Texte
              </CardTitle>
              <Scale className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Verwalten Sie AGB, Datenschutzerklärung und rechtliche Hinweise.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* Documents Section */}
        <div className="col-span-full mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Dokumente & Kommunikation
          </h2>
        </div>

        {/* Document Templates */}
        <Link href="/einstellungen/vorlagen">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                Dokumentenvorlagen
              </CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Passen Sie Ihre Dokumentenvorlagen für Angebote und Rechnungen
                an.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* Email Settings */}
        <Link href="/einstellungen/email">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                E-Mail-Einstellungen
              </CardTitle>
              <Mail className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Konfigurieren Sie Ihre E-Mail-Einstellungen und Vorlagen.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* Signatures */}
        <Link href="/einstellungen/unterschriften">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                Unterschriften
              </CardTitle>
              <PenTool className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Verwalten Sie Ihre digitalen Unterschriften für Dokumente.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* Print Settings */}
        <Link href="/einstellungen/druck">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                Druckeinstellungen
              </CardTitle>
              <Printer className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Konfigurieren Sie Druckoptionen für alle Dokumenttypen.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* Notifications */}
        <Link href="/einstellungen/benachrichtigungen">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                Benachrichtigungen
              </CardTitle>
              <Bell className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Stellen Sie ein, wann und wie Sie benachrichtigt werden möchten.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* Financial Section */}
        <div className="col-span-full mt-6">
          <h2 className="text-xl font-semibold mb-4">Finanzen & Zahlungen</h2>
        </div>

        {/* Payment Methods */}
        <Link href="/einstellungen/zahlungsarten">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                Zahlungsarten
              </CardTitle>
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Konfigurieren Sie die verfügbaren Zahlungsmethoden.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* Tax Settings */}
        <Link href="/einstellungen/steuern">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                Steuereinstellungen
              </CardTitle>
              <Calculator className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Verwalten Sie Steuersätze und Steuerregeln.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* Financial Reports */}
        <Link href="/einstellungen/berichte">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                Finanzberichte
              </CardTitle>
              <BarChart className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Konfigurieren Sie Ihre Finanzberichte und Dashboards.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* Inventory & Products Section */}
        <div className="col-span-full mt-6">
          <h2 className="text-xl font-semibold mb-4">Produkte & Lager</h2>
        </div>

        {/* Inventory Settings */}
        <Link href="/einstellungen/lager">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                Lagereinstellungen
              </CardTitle>
              <Truck className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Konfigurieren Sie Lagerbenachrichtigungen und Bestandsregeln.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* Product Display */}
        <Link href="/einstellungen/produktanzeige">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                Produktanzeige
              </CardTitle>
              <Palette className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Passen Sie an, wie Produkte im System angezeigt werden.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* System Section */}
        <div className="col-span-full mt-6">
          <h2 className="text-xl font-semibold mb-4">System & Sicherheit</h2>
        </div>

        {/* User Management */}
        <Link href="/einstellungen/benutzer">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                Benutzerverwaltung
              </CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Verwalten Sie Benutzer und Berechtigungen.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* Security Settings */}
        <Link href="/einstellungen/sicherheit">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                Sicherheitseinstellungen
              </CardTitle>
              <Shield className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Konfigurieren Sie Sicherheitsoptionen und Datenschutz.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* Regional Settings */}
        <Link href="/einstellungen/regional">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                Regionale Einstellungen
              </CardTitle>
              <Globe className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Stellen Sie Sprache, Währung und Datumsformate ein.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* System Settings */}
        <Link href="/einstellungen/system">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                Systemeinstellungen
              </CardTitle>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Allgemeine Systemeinstellungen und Konfigurationen.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* Backup & Restore */}
        <Link href="/einstellungen/backup">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                Backup & Wiederherstellung
              </CardTitle>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Sichern und wiederherstellen Sie Ihre Daten.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* Terms and Conditions */}
        <Link href="/rechtliches">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                Rechtliche Informationen
              </CardTitle>
              <FileCheck className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Zeigen Sie Ihre AGB, Datenschutzerklärung und Impressum an.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
