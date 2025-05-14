"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Package, AlertTriangle, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { getAllCategories, getCategoryDescendants } from "@/lib/category-service"
import { CategoryBreadcrumb } from "@/components/category-breadcrumb"
import { CategoryTree } from "@/components/category-tree"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Category } from "@/types/category"

// Define product type
type Product = {
  id: number
  name: string
  price: number
  image: string
  unit?: string
  barcode: string
  stock: number
  minStock: number
  location: string
  categoryId: string
}

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "low" | "out">("all")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [includeSubcategories, setIncludeSubcategories] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategoryIds, setFilteredCategoryIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories()
        setCategories(data)
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Update filtered category IDs when category filter changes
  useEffect(() => {
    const updateFilteredCategories = async () => {
      if (!categoryFilter) {
        setFilteredCategoryIds([])
        return
      }

      try {
        if (includeSubcategories) {
          // Get all descendants of the selected category
          const descendants = await getCategoryDescendants(categoryFilter)
          setFilteredCategoryIds([categoryFilter, ...descendants.map((cat) => cat.id || cat.categoryId)])
        } else {
          setFilteredCategoryIds([categoryFilter])
        }
      } catch (error) {
        console.error("Error fetching category descendants:", error)
      }
    }

    updateFilteredCategories()
  }, [categoryFilter, includeSubcategories])

  // Product database with inventory information
  const products: Product[] = [
    {
      id: 1,
      name: "Petersilie",
      price: 1.2,
      unit: "Bund",
      image: "/assorted-fresh-herbs.png",
      barcode: "4001234567890",
      stock: 15,
      minStock: 10,
      location: "A1",
      categoryId: "cat-3", // Kräuter
    },
    {
      id: 2,
      name: "Tomaten",
      price: 2.5,
      unit: "kg",
      image: "/ripe-tomatoes.png",
      barcode: "4001234567891",
      stock: 25,
      minStock: 15,
      location: "A2",
      categoryId: "cat-2", // Gemüse
    },
    {
      id: 3,
      name: "Äpfel",
      price: 1.9,
      unit: "kg",
      image: "/ripe-apples.png",
      barcode: "4001234567892",
      stock: 30,
      minStock: 20,
      location: "B1",
      categoryId: "cat-5", // Kernobst
    },
    {
      id: 4,
      name: "Karotten",
      price: 1.5,
      unit: "kg",
      image: "/bunch-of-carrots.png",
      barcode: "4001234567893",
      stock: 18,
      minStock: 12,
      location: "A3",
      categoryId: "cat-6", // Wurzelgemüse
    },
    {
      id: 5,
      name: "Zwiebeln",
      price: 0.9,
      unit: "kg",
      image: "/placeholder.svg?key=vyaib",
      barcode: "4001234567894",
      stock: 40,
      minStock: 20,
      location: "A4",
      categoryId: "cat-6", // Wurzelgemüse
    },
    {
      id: 6,
      name: "Salat",
      price: 1.2,
      unit: "Stück",
      image: "/fresh-lettuce.png",
      barcode: "4001234567895",
      stock: 12,
      minStock: 10,
      location: "A5",
      categoryId: "cat-2", // Gemüse
    },
    {
      id: 7,
      name: "Gurke",
      price: 0.99,
      unit: "Stück",
      image: "/placeholder.svg?key=cucumber",
      barcode: "4001234567896",
      stock: 20,
      minStock: 15,
      location: "A6",
      categoryId: "cat-2", // Gemüse
    },
    {
      id: 8,
      name: "Paprika",
      price: 1.49,
      unit: "Stück",
      image: "/placeholder.svg?key=bellpepper",
      barcode: "4001234567897",
      stock: 15,
      minStock: 10,
      location: "A7",
      categoryId: "cat-2", // Gemüse
    },
    {
      id: 9,
      name: "Zitrone",
      price: 0.69,
      unit: "Stück",
      image: "/placeholder.svg?key=lemon",
      barcode: "4001234567898",
      stock: 25,
      minStock: 15,
      location: "B2",
      categoryId: "cat-4", // Zitrusfrüchte
    },
    {
      id: 10,
      name: "Knoblauch",
      price: 0.49,
      unit: "Stück",
      image: "/placeholder.svg?key=garlic",
      barcode: "4001234567899",
      stock: 30,
      minStock: 20,
      location: "A8",
      categoryId: "cat-2", // Gemüse
    },
    {
      id: 11,
      name: "Pilze",
      price: 2.29,
      unit: "250g",
      image: "/placeholder.svg?key=mushrooms",
      barcode: "4001234567900",
      stock: 10,
      minStock: 8,
      location: "A9",
      categoryId: "cat-2", // Gemüse
    },
    {
      id: 12,
      name: "Bio-Äpfel",
      price: 2.79,
      unit: "kg",
      image: "/placeholder.svg?key=organic-apples",
      barcode: "4001234567901",
      stock: 8,
      minStock: 10,
      location: "B3",
      categoryId: "cat-7", // Bio-Äpfel
    },
  ]

  // Filter products based on search term, category filter, and stock filter
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm) ||
      product.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = !categoryFilter || filteredCategoryIds.includes(product.categoryId)

    if (filter === "all") return matchesSearch && matchesCategory
    if (filter === "low")
      return matchesSearch && matchesCategory && product.stock <= product.minStock && product.stock > 0
    if (filter === "out") return matchesSearch && matchesCategory && product.stock === 0

    return matchesSearch && matchesCategory
  })

  // Calculate inventory statistics
  const totalProducts = products.length
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock && p.stock > 0).length
  const outOfStockProducts = products.filter((p) => p.stock === 0).length

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId || cat.categoryId === categoryId)
    return category ? category.name : "Unbekannt"
  }

  // Get category color by ID
  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId || cat.categoryId === categoryId)
    return category ? category.color : "#000000"
  }

  // Handle category selection
  const handleCategorySelect = (categoryId: string | null) => {
    setCategoryFilter(categoryId)
    setCategoryPopoverOpen(false)
  }

  // Get selected category
  const selectedCategory = categoryFilter ? categories.find((cat) => cat.id === categoryFilter) : null

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Lagerbestand</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gesamtbestand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalProducts}</div>
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Niedriger Bestand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{lowStockProducts}</div>
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Nicht verfügbar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{outOfStockProducts}</div>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex flex-wrap gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
            Alle
          </Button>
          <Button variant={filter === "low" ? "default" : "outline"} onClick={() => setFilter("low")}>
            Niedriger Bestand
          </Button>
          <Button variant={filter === "out" ? "default" : "outline"} onClick={() => setFilter("out")}>
            Nicht verfügbar
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[220px] justify-start">
                  {selectedCategory ? (
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedCategory.color }}></div>
                      <span className="truncate">{selectedCategory.name}</span>
                    </div>
                  ) : (
                    "Alle Kategorien"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start mb-2"
                    onClick={() => handleCategorySelect(null)}
                  >
                    Alle Kategorien
                  </Button>
                  <div className="max-h-[300px] overflow-y-auto">
                    <CategoryTree
                      categories={categories}
                      onSelectCategory={(category) => handleCategorySelect(category.id)}
                      selectedCategoryId={categoryFilter}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {selectedCategory && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="include-subcategories"
                checked={includeSubcategories}
                onCheckedChange={(checked) => setIncludeSubcategories(checked === true)}
              />
              <Label htmlFor="include-subcategories">Unterkategorien einschließen</Label>
            </div>
          )}

          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suche..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {selectedCategory && (
        <div className="mb-4">
          <CategoryBreadcrumb
            categoryId={selectedCategory.id}
            categories={categories}
            onCategoryClick={(category) => setCategoryFilter(category.id)}
          />
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produkt</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Lagerort</TableHead>
                <TableHead>Preis</TableHead>
                <TableHead>Bestand</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="font-mono text-xs">{product.barcode}</TableCell>
                  <TableCell>
                    <CategoryBreadcrumb
                      categoryId={product.categoryId}
                      categories={categories}
                      onCategoryClick={(category) => setCategoryFilter(category.id)}
                      compact
                    />
                  </TableCell>
                  <TableCell>{product.location}</TableCell>
                  <TableCell>
                    {product.price.toFixed(2)}€ {product.unit ? `/ ${product.unit}` : ""}
                  </TableCell>
                  <TableCell>
                    {product.stock} {product.unit ? product.unit : "Stück"}
                  </TableCell>
                  <TableCell>
                    {product.stock === 0 ? (
                      <Badge variant="destructive">Nicht verfügbar</Badge>
                    ) : product.stock <= product.minStock ? (
                      <Badge variant="secondary">Niedriger Bestand</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Verfügbar
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Keine Produkte gefunden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
