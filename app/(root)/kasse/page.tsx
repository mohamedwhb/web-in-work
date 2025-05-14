"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, ShoppingCart, Trash2, Plus, Minus, Printer, Barcode } from "lucide-react"
import { PaymentDialog } from "@/components/payment-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { BarcodeScannerDialog } from "@/components/barcode-scanner-dialog"
import { getProductByBarcode, updateInventory } from "@/lib/inventory"

// Define product and cart item types
type Product = {
  id: number
  name: string
  price: number
  image: string
  unit?: string
  barcode: string
  stock: number
}

type CartItem = {
  id: number
  name: string
  price: number
  quantity: number
  total: number
  barcode: string
}

export default function KassePage() {
  const { toast } = useToast()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [barcodeInput, setBarcodeInput] = useState("")
  const [discountPercent, setDiscountPercent] = useState(0)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const barcodeInputRef = useRef<HTMLInputElement>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

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
    },
    {
      id: 2,
      name: "Tomaten",
      price: 2.5,
      unit: "kg",
      image: "/ripe-tomatoes.png",
      barcode: "4001234567891",
      stock: 25,
    },
    { id: 3, name: "Äpfel", price: 1.9, unit: "kg", image: "/ripe-apples.png", barcode: "4001234567892", stock: 30 },
    {
      id: 4,
      name: "Karotten",
      price: 1.5,
      unit: "kg",
      image: "/bunch-of-carrots.png",
      barcode: "4001234567893",
      stock: 18,
    },
    {
      id: 5,
      name: "Zwiebeln",
      price: 0.9,
      unit: "kg",
      image: "/placeholder.svg?key=vyaib",
      barcode: "4001234567894",
      stock: 40,
    },
    {
      id: 6,
      name: "Salat",
      price: 1.2,
      unit: "Stück",
      image: "/fresh-lettuce.png",
      barcode: "4001234567895",
      stock: 12,
    },
    {
      id: 7,
      name: "Gurke",
      price: 0.99,
      unit: "Stück",
      image: "/placeholder.svg?key=cucumber",
      barcode: "4001234567896",
      stock: 20,
    },
    {
      id: 8,
      name: "Paprika",
      price: 1.49,
      unit: "Stück",
      image: "/placeholder.svg?key=bellpepper",
      barcode: "4001234567897",
      stock: 15,
    },
    {
      id: 9,
      name: "Zitrone",
      price: 0.69,
      unit: "Stück",
      image: "/placeholder.svg?key=lemon",
      barcode: "4001234567898",
      stock: 25,
    },
    {
      id: 10,
      name: "Knoblauch",
      price: 0.49,
      unit: "Stück",
      image: "/placeholder.svg?key=garlic",
      barcode: "4001234567899",
      stock: 30,
    },
    {
      id: 11,
      name: "Pilze",
      price: 2.29,
      unit: "250g",
      image: "/placeholder.svg?key=mushrooms",
      barcode: "4001234567900",
      stock: 10,
    },
    {
      id: 12,
      name: "Brokkoli",
      price: 1.79,
      unit: "Stück",
      image: "/placeholder.svg?key=broccoli",
      barcode: "4001234567901",
      stock: 8,
    },
  ]

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.barcode.includes(searchTerm),
  )

  // Focus on barcode input when component mounts
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus()
    }
  }, [])

  // Handle barcode input
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (barcodeInput.trim()) {
      const product = getProductByBarcode(barcodeInput.trim(), products)
      if (product) {
        if (product.stock <= 0) {
          toast({
            title: "Produkt nicht verfügbar",
            description: `${product.name} ist nicht auf Lager.`,
            variant: "destructive",
          })
        } else {
          addToCart(product)
          toast({
            title: "Produkt hinzugefügt",
            description: `${product.name} wurde zum Warenkorb hinzugefügt.`,
          })
        }
      } else {
        toast({
          title: "Produkt nicht gefunden",
          description: `Barcode ${barcodeInput} wurde nicht gefunden.`,
          variant: "destructive",
        })
      }
      setBarcodeInput("")
    }
  }

  // Handle barcode scan result
  const handleBarcodeScan = (barcode: string) => {
    setBarcodeInput(barcode)
    const product = getProductByBarcode(barcode, products)
    if (product) {
      if (product.stock <= 0) {
        toast({
          title: "Produkt nicht verfügbar",
          description: `${product.name} ist nicht auf Lager.`,
          variant: "destructive",
        })
      } else {
        addToCart(product)
        toast({
          title: "Produkt hinzugefügt",
          description: `${product.name} wurde zum Warenkorb hinzugefügt.`,
        })
      }
    } else {
      toast({
        title: "Produkt nicht gefunden",
        description: `Barcode ${barcode} wurde nicht gefunden.`,
        variant: "destructive",
      })
    }
    setIsScannerOpen(false)
  }

  const addToCart = (product: Product) => {
    // Check if product is in stock
    if (product.stock <= 0) {
      toast({
        title: "Produkt nicht verfügbar",
        description: `${product.name} ist nicht auf Lager.`,
        variant: "destructive",
      })
      return
    }

    const existingItem = cart.find((item) => item.id === product.id)
    const currentQuantity = existingItem ? existingItem.quantity : 0

    // Check if requested quantity exceeds available stock
    if (currentQuantity + 1 > product.stock) {
      toast({
        title: "Nicht genügend auf Lager",
        description: `Nur noch ${product.stock} ${product.unit || "Stück"} von ${product.name} verfügbar.`,
        variant: "destructive",
      })
      return
    }

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item,
        ),
      )
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          total: product.price,
          barcode: product.barcode,
        },
      ])
    }
  }

  const removeFromCart = (id: number) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return

    const product = products.find((p) => p.id === id)
    if (!product) return

    // Check if requested quantity exceeds available stock
    if (newQuantity > product.stock) {
      toast({
        title: "Nicht genügend auf Lager",
        description: `Nur noch ${product.stock} ${product.unit || "Stück"} von ${product.name} verfügbar.`,
        variant: "destructive",
      })
      return
    }

    setCart(
      cart.map((item) => (item.id === id ? { ...item, quantity: newQuantity, total: newQuantity * item.price } : item)),
    )
  }

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0)
  const discountAmount = (subtotal * discountPercent) / 100
  const discountedSubtotal = subtotal - discountAmount
  const tax = discountedSubtotal * 0.1 // 10% tax
  const total = discountedSubtotal + tax

  const handlePaymentComplete = async (paymentMethod: string) => {
    setIsProcessing(true)

    try {
      // Update inventory
      const inventoryUpdates = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }))

      // Call the inventory update API
      await updateInventory(inventoryUpdates)

      // Generate receipt ID
      const receiptId = `R-${Date.now().toString().slice(-6)}`

      // Create receipt data
      const receiptData = {
        id: receiptId,
        date: new Date().toISOString().split("T")[0],
        items: cart.map((item) => ({
          id: item.id,
          product: item.name,
          artNr: `P-${item.id}`,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
        subtotal: subtotal,
        discountPercent: discountPercent,
        discountAmount: discountAmount,
        tax: tax,
        taxRate: 10,
        total: total,
        paymentMethod: paymentMethod,
        customer: {
          name: "Barverkauf",
          address: "",
          city: "",
          zip: "",
          country: "Österreich",
        },
      }

      // Generate receipt PDF
      const response = await fetch("/api/pdf/receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: receiptData }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate receipt")
      }

      const blob = await response.blob()

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob)

      // Open the PDF in a new tab
      window.open(url, "_blank")

      // Show success message
      toast({
        title: "Zahlung erfolgreich",
        description: `Beleg ${receiptId} wurde erstellt.`,
      })

      // Clear the cart
      setCart([])
      setDiscountPercent(0)
      setIsPaymentOpen(false)
    } catch (error) {
      console.error("Error processing payment:", error)
      toast({
        title: "Fehler",
        description: "Zahlung konnte nicht verarbeitet werden.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePrintReceipt = () => {
    if (cart.length === 0) {
      toast({
        title: "Warenkorb leer",
        description: "Fügen Sie Produkte hinzu, um einen Beleg zu drucken.",
        variant: "destructive",
      })
      return
    }

    setIsPaymentOpen(true)
  }

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold">Kasse</h1>

          <div className="w-full md:w-auto flex flex-col md:flex-row gap-2">
            {/* Barcode input */}
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={barcodeInputRef}
                  placeholder="Barcode scannen..."
                  className="pl-8"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                />
              </div>
              <Button type="submit" variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={() => setIsScannerOpen(true)}>
                <Barcode className="h-4 w-4" />
              </Button>
            </form>

            {/* Search input */}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${product.stock <= 0 ? "opacity-50" : ""}`}
              onClick={() => product.stock > 0 && addToCart(product)}
            >
              <CardContent className="p-4">
                <div className="aspect-square mb-2 bg-muted rounded-md flex items-center justify-center relative">
                  <img src={product.image || "/placeholder.svg"} alt={product.name} className="max-h-full max-w-full" />
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <Badge variant="destructive" className="text-xs">
                        Nicht verfügbar
                      </Badge>
                    </div>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                      Nur noch {product.stock}
                    </Badge>
                  )}
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {product.price.toFixed(2)}€ {product.unit ? `/ ${product.unit}` : ""}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">{product.barcode}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Warenkorb
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Warenkorb ist leer</p>
            ) : (
              <ul className="space-y-2">
                {cart.map((item) => (
                  <li key={item.id} className="flex justify-between items-start border-b pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              updateQuantity(item.id, item.quantity - 1)
                            }}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              updateQuantity(item.id, item.quantity + 1)
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span>{item.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{item.price.toFixed(2)}€ pro Stück</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{item.total.toFixed(2)}€</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFromCart(item.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Summe:</span>
                <span>{subtotal.toFixed(2)}€</span>
              </div>

              <div className="flex justify-between items-center">
                <Label htmlFor="rabatt">Rabatt:</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="rabatt"
                    type="number"
                    min="0"
                    max="100"
                    className="w-16 text-right"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  />
                  <span>%</span>
                </div>
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Rabatt ({discountPercent}%):</span>
                  <span>-{discountAmount.toFixed(2)}€</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Zwischensumme:</span>
                <span>{discountedSubtotal.toFixed(2)}€</span>
              </div>

              <div className="flex justify-between">
                <span>MwSt. (10%):</span>
                <span>{tax.toFixed(2)}€</span>
              </div>

              <div className="flex justify-between text-lg font-bold">
                <span>Gesamt:</span>
                <span>{total.toFixed(2)}€</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" onClick={handlePrintReceipt} disabled={cart.length === 0 || isProcessing}>
              {isProcessing ? (
                <>Verarbeitung...</>
              ) : (
                <>
                  <Printer className="mr-2 h-4 w-4" />
                  Bezahlen & Beleg drucken
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <PaymentDialog
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        total={total}
        onComplete={handlePaymentComplete}
        isProcessing={isProcessing}
      />

      <BarcodeScannerDialog open={isScannerOpen} onOpenChange={setIsScannerOpen} onScan={handleBarcodeScan} />
    </div>
  )
}
