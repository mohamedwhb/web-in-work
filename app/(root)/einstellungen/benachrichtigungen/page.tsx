"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";

export default function NotificationSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [notificationEvents, setNotificationEvents] = useState({
    newOrder: true,
    paymentReceived: true,
    lowInventory: true,
    documentSigned: true,
    invoiceOverdue: true,
    taskAssigned: true,
    commentAdded: false,
    systemUpdates: true,
  });

  const handleToggleEvent = (event: string) => {
    setNotificationEvents({
      ...notificationEvents,
      [event]: !notificationEvents[event as keyof typeof notificationEvents],
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: "Einstellungen gespeichert",
      description:
        "Die Benachrichtigungseinstellungen wurden erfolgreich gespeichert.",
    });
  };

  return (
    <div className="max-w-7xl px-2 lg:px-0 mx-auto py-6 space-y-6">
      <PageHeader
        heading="Benachrichtigungseinstellungen"
        description="Konfigurieren Sie, wann und wie Sie benachrichtigt werden möchten"
        headerClassName="text-lg md:text-3xl"
      />

      <Tabs defaultValue="channels">
        <TabsList className="flex flex-wrap h-auto justify-center md:justify-start w-full">
          <TabsTrigger value="channels">Benachrichtigungskanäle</TabsTrigger>
          <TabsTrigger value="events">Ereignisse</TabsTrigger>
          <TabsTrigger value="schedule">Zeitplan</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="max-sm:text-xl">
                Benachrichtigungskanäle
              </CardTitle>
              <CardDescription>
                Wählen Sie aus, wie Sie benachrichtigt werden möchten.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">
                    E-Mail-Benachrichtigungen
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Erhalten Sie Benachrichtigungen per E-Mail
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              {emailNotifications && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="email-address">
                    E-Mail-Adresse für Benachrichtigungen
                  </Label>
                  <Input
                    id="email-address"
                    placeholder="ihre-email@beispiel.de"
                  />
                </div>
              )}

              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="browser-notifications">
                    Browser-Benachrichtigungen
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Erhalten Sie Benachrichtigungen im Browser
                  </p>
                </div>
                <Switch
                  id="browser-notifications"
                  checked={browserNotifications}
                  onCheckedChange={setBrowserNotifications}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">
                    SMS-Benachrichtigungen
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Erhalten Sie Benachrichtigungen per SMS
                  </p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>

              {smsNotifications && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="phone-number">Telefonnummer für SMS</Label>
                  <Input id="phone-number" placeholder="+49 123 4567890" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="max-sm:text-lg">
                Benachrichtigungsereignisse
              </CardTitle>
              <CardDescription>
                Wählen Sie aus, für welche Ereignisse Sie benachrichtigt werden
                möchten.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="new-order"
                    checked={notificationEvents.newOrder}
                    onCheckedChange={() => handleToggleEvent("newOrder")}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="new-order">Neue Bestellung</Label>
                    <p className="text-sm text-muted-foreground">
                      Wenn eine neue Bestellung eingeht
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="payment-received"
                    checked={notificationEvents.paymentReceived}
                    onCheckedChange={() => handleToggleEvent("paymentReceived")}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="payment-received">Zahlung erhalten</Label>
                    <p className="text-sm text-muted-foreground">
                      Wenn eine Zahlung eingegangen ist
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="low-inventory"
                    checked={notificationEvents.lowInventory}
                    onCheckedChange={() => handleToggleEvent("lowInventory")}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="low-inventory">
                      Niedriger Lagerbestand
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Wenn der Lagerbestand eines Produkts niedrig ist
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="document-signed"
                    checked={notificationEvents.documentSigned}
                    onCheckedChange={() => handleToggleEvent("documentSigned")}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="document-signed">
                      Dokument unterschrieben
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Wenn ein Dokument unterschrieben wurde
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="invoice-overdue"
                    checked={notificationEvents.invoiceOverdue}
                    onCheckedChange={() => handleToggleEvent("invoiceOverdue")}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="invoice-overdue">Rechnung überfällig</Label>
                    <p className="text-sm text-muted-foreground">
                      Wenn eine Rechnung überfällig ist
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="task-assigned"
                    checked={notificationEvents.taskAssigned}
                    onCheckedChange={() => handleToggleEvent("taskAssigned")}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="task-assigned">Aufgabe zugewiesen</Label>
                    <p className="text-sm text-muted-foreground">
                      Wenn Ihnen eine Aufgabe zugewiesen wurde
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="comment-added"
                    checked={notificationEvents.commentAdded}
                    onCheckedChange={() => handleToggleEvent("commentAdded")}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="comment-added">Kommentar hinzugefügt</Label>
                    <p className="text-sm text-muted-foreground">
                      Wenn ein Kommentar zu einem Dokument hinzugefügt wurde
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="system-updates"
                    checked={notificationEvents.systemUpdates}
                    onCheckedChange={() => handleToggleEvent("systemUpdates")}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="system-updates">Systemupdates</Label>
                    <p className="text-sm text-muted-foreground">
                      Über wichtige Systemupdates und Wartungen
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="max-md:text-xl">
                Benachrichtigungszeitplan
              </CardTitle>
              <CardDescription>
                Legen Sie fest, wann Sie Benachrichtigungen erhalten möchten.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="notification-frequency">
                  Benachrichtigungshäufigkeit
                </Label>
                <Select defaultValue="realtime">
                  <SelectTrigger id="notification-frequency">
                    <SelectValue placeholder="Wählen Sie eine Häufigkeit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Echtzeit</SelectItem>
                    <SelectItem value="hourly">Stündlich</SelectItem>
                    <SelectItem value="daily">Täglich</SelectItem>
                    <SelectItem value="weekly">Wöchentlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quiet-hours-start">Ruhezeit - Start</Label>
                <Input
                  id="quiet-hours-start"
                  type="time"
                  defaultValue="22:00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quiet-hours-end">Ruhezeit - Ende</Label>
                <Input id="quiet-hours-end" type="time" defaultValue="08:00" />
              </div>

              <div className="space-y-2">
                <Label>Benachrichtigungen an Wochentagen</Label>
                <div className="grid grid-cols-7 gap-2">
                  {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
                    <div key={day} className="flex flex-col items-center">
                      <Checkbox
                        id={`day-${day}`}
                        defaultChecked={day !== "Sa" && day !== "So"}
                      />
                      <Label htmlFor={`day-${day}`} className="mt-1 text-sm">
                        {day}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>Einstellungen speichern</Button>
      </div>
    </div>
  );
}
