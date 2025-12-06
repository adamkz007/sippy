"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Coffee, 
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  Banknote,
  X,
  Check
} from "lucide-react"
import { cn, formatCurrency, generateOrderNumber } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Demo data
const categories = [
  { id: "coffee", name: "Coffee", emoji: "☕" },
  { id: "specialty", name: "Specialty", emoji: "✨" },
  { id: "food", name: "Food", emoji: "🥐" },
  { id: "cold", name: "Cold", emoji: "🧊" },
]

const products = [
  { id: "1", name: "Flat White", price: 5.50, category: "coffee", popular: true },
  { id: "2", name: "Long Black", price: 4.50, category: "coffee", popular: true },
  { id: "3", name: "Cappuccino", price: 5.50, category: "coffee" },
  { id: "4", name: "Latte", price: 5.50, category: "coffee" },
  { id: "5", name: "Espresso", price: 4.00, category: "coffee" },
  { id: "6", name: "Mocha", price: 6.50, category: "coffee" },
  { id: "7", name: "Oat Latte", price: 6.50, category: "specialty", popular: true },
  { id: "8", name: "Matcha Latte", price: 7.00, category: "specialty" },
  { id: "9", name: "Chai Latte", price: 6.00, category: "specialty" },
  { id: "10", name: "Turmeric Latte", price: 6.50, category: "specialty" },
  { id: "11", name: "Cold Brew", price: 5.50, category: "cold", popular: true },
  { id: "12", name: "Iced Latte", price: 6.00, category: "cold" },
  { id: "13", name: "Iced Mocha", price: 7.00, category: "cold" },
  { id: "14", name: "Avocado Toast", price: 16.00, category: "food" },
  { id: "15", name: "Croissant", price: 5.50, category: "food" },
  { id: "16", name: "Banana Bread", price: 6.50, category: "food" },
]

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
}

export default function DemoPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderType, setOrderType] = useState<"TAKEAWAY" | "DINE_IN">("TAKEAWAY")
  const [showPayment, setShowPayment] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)

  const filteredProducts = products.filter((product) => {
    const matchesCategory = !activeCategory || product.category === activeCategory
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToCart = (product: typeof products[0]) => {
    const existing = cart.find((item) => item.productId === product.id)
    if (existing) {
      setCart(cart.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        id: `cart-${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      }])
    }
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(cart.map((item) => {
      if (item.id === itemId) {
        const newQty = item.quantity + delta
        return newQty > 0 ? { ...item, quantity: newQty } : item
      }
      return item
    }).filter((item) => item.quantity > 0))
  }

  const clearCart = () => {
    setCart([])
    setShowPayment(false)
    setPaymentComplete(false)
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header */}
      <header className="h-14 bg-espresso-900 text-white flex items-center px-4 gap-4">
        <Link href="/" className="p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-sm">Sippy POS Demo</p>
            <p className="text-xs text-white/70">Try it out!</p>
          </div>
        </div>
        <Badge variant="secondary" className="ml-auto">Demo Mode</Badge>
      </header>

      <div className="flex-1 flex">
        {/* Left - Menu */}
        <div className="flex-1 flex flex-col p-4 min-w-0">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search menu..."
              className="pl-10 h-12 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <Button
              variant={activeCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(null)}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
              >
                <span className="mr-1">{category.emoji}</span>
                {category.name}
              </Button>
            ))}
          </div>

          {/* Products */}
          <div className="flex-1 overflow-y-auto">
            <div className="pos-grid">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="relative p-4 rounded-xl border bg-white hover:border-espresso-300 hover:shadow-md transition-all text-left group"
                >
                  {product.popular && (
                    <Badge className="absolute -top-2 -right-2 bg-espresso-700">
                      Popular
                    </Badge>
                  )}
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-espresso-100 to-latte-100 flex items-center justify-center mb-3">
                    <Coffee className="w-5 h-5 text-espresso-600" />
                  </div>
                  <p className="font-medium text-sm mb-1">{product.name}</p>
                  <p className="text-lg font-bold text-espresso-700">
                    {formatCurrency(product.price)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Cart */}
        <div className="w-96 flex flex-col bg-white border-l">
          {paymentComplete ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Payment Complete!</h2>
              <p className="text-muted-foreground mb-6">Order #{generateOrderNumber()}</p>
              <Button onClick={clearCart} className="w-full">New Order</Button>
            </div>
          ) : showPayment ? (
            <>
              <div className="p-4 border-b flex items-center gap-3">
                <Button variant="ghost" size="icon-sm" onClick={() => setShowPayment(false)}>
                  <X className="w-5 h-5" />
                </Button>
                <h2 className="text-lg font-semibold">Payment</h2>
              </div>
              <div className="p-6 text-center border-b">
                <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                <p className="text-4xl font-bold">{formatCurrency(total)}</p>
              </div>
              <div className="flex-1 p-4 space-y-4">
                <button
                  onClick={() => setPaymentComplete(true)}
                  className="w-full p-4 rounded-xl border-2 border-espresso-500 bg-espresso-50 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Card</p>
                    <p className="text-sm text-muted-foreground">Tap to simulate payment</p>
                  </div>
                </button>
                <button
                  onClick={() => setPaymentComplete(true)}
                  className="w-full p-4 rounded-xl border-2 hover:border-espresso-200 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <Banknote className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Cash</p>
                    <p className="text-sm text-muted-foreground">Tap to simulate payment</p>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Order Type */}
              <div className="p-4 border-b">
                <div className="flex gap-2">
                  <Button
                    variant={orderType === "TAKEAWAY" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setOrderType("TAKEAWAY")}
                  >
                    Takeaway
                  </Button>
                  <Button
                    variant={orderType === "DINE_IN" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setOrderType("DINE_IN")}
                  >
                    Dine In
                  </Button>
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                    <Coffee className="w-12 h-12 mb-4" />
                    <p className="font-medium">No items yet</p>
                    <p className="text-sm">Tap products to add them</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon-sm" onClick={() => updateQuantity(item.id, -1)}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button variant="outline" size="icon-sm" onClick={() => updateQuantity(item.id, 1)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="icon-sm" onClick={() => updateQuantity(item.id, -item.quantity)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="border-t p-4 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST (10%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={clearCart} disabled={cart.length === 0}>
                    Clear
                  </Button>
                  <Button className="flex-1" onClick={() => setShowPayment(true)} disabled={cart.length === 0}>
                    Pay {formatCurrency(total)}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

