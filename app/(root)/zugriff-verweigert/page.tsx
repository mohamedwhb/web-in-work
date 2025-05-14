"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function ZugriffVerweigertPage() {
  const router = useRouter()
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Zugriff verweigert</CardTitle>
          <CardDescription>
            Sie haben nicht die erforderlichen Berechtigungen, um auf diese Seite zuzugreifen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Angemeldet als: <span className="font-medium">{user?.name}</span>
            </p>
            <p>
              Position: <span className="font-medium">{user?.position}</span>
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push("/dashboard")}>Zurück zum Dashboard</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
