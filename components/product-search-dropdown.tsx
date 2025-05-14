"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Product {
  id: number | string
  name: string
  artNr?: string
  price: number
  unit?: string
  group?: string
  stock?: number
}

interface ProductSearchDropdownProps {
  products: Product[]
  onSelectProduct: (product: Product) => void
  placeholder?: string
  className?: string
  selectedProduct?: string
}

export function ProductSearchDropdown({
  products,
  onSelectProduct,
  placeholder = "Produkt suchen...",
  className,
  selectedProduct,
}: ProductSearchDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  // Filter products based on search value
  const filteredProducts = React.useMemo(() => {
    if (!searchValue) return products

    const searchLower = searchValue.toLowerCase()
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchLower) ||
        (product.artNr && product.artNr.toLowerCase().includes(searchLower)),
    )
  }, [products, searchValue])

  // Handle product selection
  const handleSelect = (product: Product) => {
    onSelectProduct(product)
    setOpen(false)
    setSearchValue("")
  }

  // Find the currently selected product
  const selected = React.useMemo(() => {
    if (!selectedProduct) return null
    return products.find((product) => product.name === selectedProduct)
  }, [products, selectedProduct])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate">{selectedProduct || placeholder}</span>
          </div>
          {selectedProduct && (
            <X
              className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onSelectProduct({
                  id: 0,
                  name: "",
                  price: 0,
                })
              }}
            />
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder={placeholder} value={searchValue} onValueChange={setSearchValue} />
          <CommandList>
            <CommandEmpty>Kein Produkt gefunden.</CommandEmpty>
            <CommandGroup>
              {filteredProducts.map((product) => (
                <CommandItem
                  key={product.id}
                  value={`${product.name}-${product.artNr || ""}`}
                  onSelect={() => handleSelect(product)}
                >
                  <Check className={cn("mr-2 h-4 w-4", selected?.id === product.id ? "opacity-100" : "opacity-0")} />
                  <div className="flex flex-col">
                    <span>{product.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {product.artNr && `Art.Nr: ${product.artNr} | `}
                      {product.price.toFixed(2)} € / {product.unit || "Stück"}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
