"use client";

import { PageHeader } from "@/components/page-header";
import { SystemInfoCard } from "@/components/system-info-card";
import { SystemMaintenanceCard } from "@/components/system-maintenance-card";
import { SystemSettingsForm } from "@/components/system-settings-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type SystemInfo,
  type SystemSettings,
  getSystemInfo,
  getSystemSettings,
} from "@/lib/system-service";
import { useEffect, useState } from "react";

export default function SystemSettingsPage() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [infoData, settingsData] = await Promise.all([
          getSystemInfo(),
          getSystemSettings(),
        ]);
        setSystemInfo(infoData);
        setSystemSettings(settingsData);
      } catch (error) {
        console.error("Fehler beim Laden der Systemdaten:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        heading="Systemeinstellungen"
        description="Konfigurieren Sie grundlegende Systemeinstellungen und führen Sie Wartungsaufgaben durch"
      />

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="flex flex-wrap h-auto justify-center md:justify-start w-full mb-6">
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
          <TabsTrigger value="info">Systeminformationen</TabsTrigger>
          <TabsTrigger value="maintenance">Wartung</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          {systemSettings && (
            <SystemSettingsForm initialSettings={systemSettings} />
          )}
        </TabsContent>

        <TabsContent value="info" className="space-y-6">
          {systemInfo && <SystemInfoCard systemInfo={systemInfo} />}
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <SystemMaintenanceCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
