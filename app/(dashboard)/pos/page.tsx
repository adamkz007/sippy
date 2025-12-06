"use client"

import { useState } from "react"
import { 
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  Banknote,
  Gift,
  X,
  Check,
  Coffee,
  ChevronRight
} from "lucide-react"
import { cn, formatCurrency, generateOrderNumber } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"

// Mock menu data
const categories = [
  { id: "coffee", name: "Coffee", emoji: "☕" },
  { id: "specialty", name: "Specialty", emoji: "✨" },
  { id: "food", name: "Food", emoji: "🥐" },
  { id: "cold", name: "Cold Drinks", emoji: "🧊" },
  { id: "tea", name: "Tea", emoji: "🍵" },
]

const products = [
  // Coffee
  { id: "1", name: "Flat White", price: 5.50, category: "coffee", popular: true },
  { id: "2", name: "Long Black", price: 4.50, category: "coffee", popular: true },
  { id: "3", name: "Cappuccino", price: 5.50, category: "coffee" },
  { id: "4", name: "Latte", price: 5.50, category: "coffee" },
  { id: "5", name: "Espresso", price: 4.00, category: "coffee" },
  { id: "6", name: "Double Espresso", price: 5.00, category: "coffee" },
  { id: "7", name: "Mocha", price: 6.50, category: "coffee" },
  { id: "8", name: "Piccolo", price: 4.50, category: "coffee" },
  // Specialty
  { id: "9", name: "Oat Latte", price: 6.50, category: "specialty", popular: true },
  { id: "10", name: "Turmeric Latte", price: 6.50, category: "specialty" },
  { id: "11", name: "Matcha Latte", price: 7.00, category: "specialty" },
  { id: "12", name: "Chai Latte", price: 6.00, category: "specialty" },
  // Cold
  { id: "13", name: "Iced Latte", price: 6.00, category: "cold" },
  { id: "14", name: "Cold Brew", price: 5.50, category: "cold", popular: true },
  { id: "15", name: "Iced Long Black", price: 5.00, category: "cold" },
  { id: "16", name: "Iced Mocha", price: 7.00, category: "cold" },
  // Food
  { id: "17", name: "Avocado Toast", price: 16.00, category: "food" },
  { id: "18", name: "Croissant", price: 5.50, category: "food" },
  { id: "19", name: "Banana Bread", price: 6.50, category: "food" },
  { id: "20", name: "Muffin", price: 5.00, category: "food" },
  // Tea
  { id: "21", name: "English Breakfast", price: 4.50, category: "tea" },
  { id: "22", name: "Earl Grey", price: 4.50, category: "tea" },
  { id: "23", name: "Green Tea", price: 4.50, category: "tea" },
  { id: "24", name: "Peppermint", price: 4.50, category: "tea" },
]

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  modifiers?: string[]
}

type OrderType = "TAKEAWAY" | "DINE_IN"

export default function POSPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderType, setOrderType] = useState<OrderType>("TAKEAWAY")
  const [showPayment, setShowPayment] = useState(false)

  const filteredProducts = products.filter((product) => {
    const matchesCategory = !activeCategory || product.category === activeCategory
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToCart = (product: typeof products[0]) => {
    const existingItem = cart.find((item) => item.productId === product.id)
    
    if (existingItem) {
      setCart(cart.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([
        ...cart,
        {
          id: `cart-${Date.now()}`,
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ])
    }
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(cart.map((item) => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + delta
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
      }
      return item
    }).filter((item) => item.quantity > 0))
  }

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((item) => item.id !== itemId))
  }

  const clearCart = () => {
    setCart([])
    setShowPayment(false)
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-6">
      {/* Left Panel - Menu */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search menu..."
            className="pl-10 h-12"
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
            className="shrink-0"
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category.id)}
              className="shrink-0"
            >
              <span className="mr-1">{category.emoji}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="pos-grid">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="relative p-4 rounded-xl border bg-white hover:border-espresso-300 hover:shadow-md transition-all text-left group"
              >
                {product.popular && (
                  <Badge className="absolute -top-2 -right-2 bg-matcha-500">
                    Popular
                  </Badge>
                )}
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-espresso-100 to-latte-100 flex items-center justify-center mb-3">
                  <Coffee className="w-5 h-5 text-espresso-600" />
                </div>
                <p className="font-medium text-sm mb-1 line-clamp-2">{product.name}</p>
                <p className="text-lg font-bold text-espresso-700">
                  {formatCurrency(product.price)}
                </p>
                <div className="absolute inset-0 rounded-xl border-2 border-espresso-500 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-96 flex flex-col bg-white rounded-xl border shadow-sm">
        {!showPayment ? (
          <>
            {/* Order Type Toggle */}
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
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Coffee className="w-8 h-8" />
                  </div>
                  <p className="font-medium">No items yet</p>
                  <p className="text-sm">Tap products to add them</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.price)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Summary */}
            <div className="border-t p-4 space-y-4">
              {/* Customer lookup */}
              <Button variant="outline" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                Add Customer
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>

              {/* Totals */}
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

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  disabled={cart.length === 0}
                  onClick={clearCart}
                >
                  Clear
                </Button>
                <Button 
                  className="flex-1"
                  disabled={cart.length === 0}
                  onClick={() => setShowPayment(true)}
                >
                  Pay {formatCurrency(total)}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <PaymentPanel 
            total={total} 
            onBack={() => setShowPayment(false)}
            onComplete={clearCart}
          />
        )}
      </div>
    </div>
  )
}

function PaymentPanel({ 
  total, 
  onBack, 
  onComplete 
}: { 
  total: number
  onBack: () => void
  onComplete: () => void
}) {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash" | null>(null)
  const [cashReceived, setCashReceived] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const cashAmount = parseFloat(cashReceived) || 0
  const change = cashAmount - total

  const handlePayment = async () => {
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsProcessing(false)
    setIsComplete(true)
  }

  if (isComplete) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Payment Complete!</h2>
        <p className="text-muted-foreground mb-2">Order #{generateOrderNumber()}</p>
        {paymentMethod === "cash" && change > 0 && (
          <p className="text-lg font-medium text-green-600 mb-6">
            Change: {formatCurrency(change)}
          </p>
        )}
        <div className="flex gap-2 w-full">
          <Button variant="outline" className="flex-1">
            Print Receipt
          </Button>
          <Button className="flex-1" onClick={onComplete}>
            New Order
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={onBack}>
          <X className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold">Payment</h2>
      </div>

      {/* Total */}
      <div className="p-6 text-center border-b">
        <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
        <p className="text-4xl font-bold">{formatCurrency(total)}</p>
      </div>

      {/* Payment Methods */}
      <div className="flex-1 p-4 space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Select Payment Method</p>
        
        <button
          onClick={() => setPaymentMethod("card")}
          className={cn(
            "w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all",
            paymentMethod === "card" 
              ? "border-espresso-500 bg-espresso-50" 
              : "border-border hover:border-espresso-200"
          )}
        >
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="font-medium">Card</p>
            <p className="text-sm text-muted-foreground">Tap, insert, or swipe</p>
          </div>
          {paymentMethod === "card" && (
            <Check className="w-5 h-5 text-espresso-600 ml-auto" />
          )}
        </button>

        <button
          onClick={() => setPaymentMethod("cash")}
          className={cn(
            "w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all",
            paymentMethod === "cash" 
              ? "border-espresso-500 bg-espresso-50" 
              : "border-border hover:border-espresso-200"
          )}
        >
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
            <Banknote className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-left">
            <p className="font-medium">Cash</p>
            <p className="text-sm text-muted-foreground">Pay with notes or coins</p>
          </div>
          {paymentMethod === "cash" && (
            <Check className="w-5 h-5 text-espresso-600 ml-auto" />
          )}
        </button>

        {paymentMethod === "cash" && (
          <div className="space-y-3 animate-in">
            <p className="text-sm font-medium">Cash Received</p>
            <Input
              type="number"
              placeholder="0.00"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              className="text-2xl font-bold h-14 text-center"
            />
            {change > 0 && (
              <div className="p-3 rounded-lg bg-green-50 text-green-700 text-center">
                <p className="text-sm">Change Due</p>
                <p className="text-xl font-bold">{formatCurrency(change)}</p>
              </div>
            )}
            {/* Quick amounts */}
            <div className="grid grid-cols-4 gap-2">
              {[10, 20, 50, 100].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setCashReceived(amount.toString())}
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Complete Button */}
      <div className="p-4 border-t">
        <Button
          className="w-full h-14 text-lg"
          disabled={!paymentMethod || isProcessing || (paymentMethod === "cash" && cashAmount < total)}
          onClick={handlePayment}
        >
          {isProcessing ? (
            "Processing..."
          ) : paymentMethod === "card" ? (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Tap Card to Pay
            </>
          ) : (
            "Complete Payment"
          )}
        </Button>
      </div>
    </div>
  )
}

