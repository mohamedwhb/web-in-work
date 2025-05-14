"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BatchArticleInput } from "@/components/batch-article-input"

// Produktdaten-Typ
type Product = {
  id: number
  name: string
  artNr: string
  price: number
  unit?: string
  group?: string
  stock?: number
}

// Artikel-Typ für die Formulare
type ArticleItem = {
  id: number
  product?: string
  artNr?: string
  quantity: number
  price: number
  total: number
  name?: string // Für InvoiceForm
  description?: string // Für InvoiceForm
  unit?: string // Für InvoiceForm
}

interface ProductSearchProps {
  products: Product[]
  onSelectProduct: (product: Product) => void
  onAddBatchItems: (items: ArticleItem[]) => void
  getNextId: () => number
  placeholder?: string
  className?: string
}

export function ProductSearch({
  products,
  onSelectProduct,
  onAddBatchItems,
  getNextId,
  placeholder = "Produkt suchen...",
  className = "",
}: ProductSearchProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Filtern der Produkte basierend auf der Suche
  useEffect(() => {
    if (search.trim() === "") {
      setFilteredProducts(products)
    } else {
      const searchLower = search.toLowerCase()
      setFilteredProducts(
        products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchLower) ||
            product.artNr.toLowerCase().includes(searchLower) ||
            (product.group && product.group.toLowerCase().includes(searchLower)),
        ),
      )
    }
  }, [search, products])

  // Produkt auswählen
  const handleSelectProduct = (product: Product) => {
    onSelectProduct(product)
    setOpen(false)
    setSearch("")
  }

  // Suche zurücksetzen
  const handleClearSearch = () => {
    setSearch("")
    inputRef.current?.focus()
  }

  return (
    <div className={`relative ${className}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={() => setOpen(true)}
              className="pl-8 pr-8"
            />
            {search && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-0"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Suche löschen</span>
              </Button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[300px]" align="start">
          <Command>
            <CommandInput placeholder={placeholder} value={search} onValueChange={setSearch} className="h-9" />
            <CommandList>
              <CommandEmpty>Keine Produkte gefunden</CommandEmpty>
              <CommandGroup heading="Produkte">
                <ScrollArea className="h-[200px]">
                  {filteredProducts.map((product) => (
                    <CommandItem key={product.id} value={product.name} onSelect={() => handleSelectProduct(product)}>
                      <div className="flex flex-col">
                        <span>{product.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Art.-Nr.: {product.artNr} | {product.price.toFixed(2)} €/{product.unit || "Stück"}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="mt-2">
        <BatchArticleInput products={products} onAddItems={onAddBatchItems} getNextId={getNextId} />
      </div>
    </div>
  )
}
