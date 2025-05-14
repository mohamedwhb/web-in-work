import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function Home() {
  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Suche..." className="pl-8" />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Angebote</CardTitle>
            <CardDescription>Offene Angebote</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                Alle anzeigen
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rechnungen</CardTitle>
            <CardDescription>Offene Rechnungen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                Alle anzeigen
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lieferscheine</CardTitle>
            <CardDescription>Offene Lieferscheine</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                Alle anzeigen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Neueste Kunden</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <li key={i} className="p-2 border-b last:border-0">
                  <div className="flex justify-between">
                    <span>Max Mustermann GmbH</span>
                    <Button variant="ghost" size="sm">
                      Details
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Neueste Bestellungen</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <li key={i} className="p-2 border-b last:border-0">
                  <div className="flex justify-between">
                    <span>Bestellung #{2025000 + i}</span>
                    <Button variant="ghost" size="sm">
                      Details
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
