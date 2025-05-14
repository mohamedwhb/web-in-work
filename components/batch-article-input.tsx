"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ListPlus } from "lucide-react"

interface Product {
  id: number | string
  name: string
  artNr?: string
  price: number
  unit?: string
}

interface BatchArticleInputProps {
  onAddItems: (items: any[]) => void
  getNextId: () => number | string
  products: Product[]
}

export function BatchArticleInput({ onAddItems, getNextId, products }: BatchArticleInputProps) {
  const [open, setOpen] = useState(false)
  const [batchText, setBatchText] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleAddBatch = () => {
    if (!batchText.trim()) {
      setError("Bitte geben Sie Artikel ein.")
      return
    }

    try {
      // Split by new lines
      const lines = batchText.split("\n").filter((line) => line.trim())

      // Parse each line
      const items = lines.map((line) => {
        // Try to match format: "quantity x product" or just "product"
        const match = line.match(/^(\d+(?:[.,]\d+)?)\s*[xX]\s*(.+)$/) || line.match(/^(.+)$/)

        if (!match) {
          throw new Error(`Konnte Zeile nicht verarbeiten: ${line}`)
        }

        let quantity = 1
        let productName = ""

        if (match[2]) {
          // Format is "quantity x product"
          quantity = Number.parseFloat(match[1].replace(",", "."))
          productName = match[2].trim()
        } else {
          // Format is just "product"
          productName = match[1].trim()
        }

        // Try to find product in the products list
        const matchedProduct = products.find(
          (p) =>
            p.name.toLowerCase() === productName.toLowerCase() ||
            (p.artNr && p.artNr.toLowerCase() === productName.toLowerCase()),
        )

        if (matchedProduct) {
          return {
            id: getNextId(),
            name: matchedProduct.name,
            quantity,
            price: matchedProduct.price,
            unit: matchedProduct.unit || "Stück",
          }
        }

        // If no product found, create a generic one
        return {
          id: getNextId(),
          name: productName,
          quantity,
          price: 0,
          unit: "Stück",
        }
      })

      onAddItems(items)
      setBatchText("")
      setError(null)
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Verarbeiten der Artikel")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ListPlus className="mr-2 h-4 w-4" />
          Mehrere Artikel einfügen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Mehrere Artikel einfügen</DialogTitle>
          <DialogDescription>
            Geben Sie jeden Artikel in einer neuen Zeile ein. Format: "Menge x Produkt" oder nur "Produkt"
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Textarea
              id="batch-input"
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder="2 x Mango&#10;1 x Avocado&#10;Kartoffel"
              className="min-h-[200px]"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Beispiele:</p>
            <ul className="list-disc pl-4">
              <li>2 x Mango</li>
              <li>1,5 x Kartoffel</li>
              <li>Avocado (Menge wird auf 1 gesetzt)</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddBatch} className="w-full">
            Artikel hinzufügen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
