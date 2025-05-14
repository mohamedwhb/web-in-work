"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { SystemInfo } from "@/lib/system-service"
import { Database, HardDrive, Cpu, Server } from "lucide-react"

interface SystemInfoCardProps {
  systemInfo: SystemInfo
}

export function SystemInfoCard({ systemInfo }: SystemInfoCardProps) {
  const storagePercentage = (systemInfo.storageUsed / systemInfo.storageTotal) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Server className="h-5 w-5" />
          Systeminformationen
        </CardTitle>
        <CardDescription>Aktuelle Informationen über Ihr System</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Version:</span>
              <span className="font-medium">{systemInfo.version}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Letztes Update:</span>
              <span className="font-medium">{systemInfo.lastUpdate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Umgebung:</span>
              <span className="font-medium">{systemInfo.environment}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Node Version:</span>
              <span className="font-medium">{systemInfo.nodeVersion}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Datenbank:</span>
              <span className="font-medium">{systemInfo.databaseType}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <HardDrive className="h-4 w-4" />
                  Speichernutzung:
                </span>
                <span className="font-medium">
                  {systemInfo.storageUsed} GB / {systemInfo.storageTotal} GB
                </span>
              </div>
              <Progress value={storagePercentage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Cpu className="h-4 w-4" />
                  CPU-Auslastung:
                </span>
                <span className="font-medium">{systemInfo.cpuUsage}%</span>
              </div>
              <Progress value={systemInfo.cpuUsage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Database className="h-4 w-4" />
                  Arbeitsspeicher:
                </span>
                <span className="font-medium">{systemInfo.memoryUsage}%</span>
              </div>
              <Progress value={systemInfo.memoryUsage} className="h-2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
