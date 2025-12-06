"use client"

import { useState } from "react"
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Coffee,
  GripVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn, formatCurrency } from "@/lib/utils"

// Mock data
const mockCategories = [
  { id: "1", name: "Coffee", emoji: "☕", productCount: 8 },
  { id: "2", name: "Specialty", emoji: "✨", productCount: 4 },
  { id: "3", name: "Cold Drinks", emoji: "🧊", productCount: 4 },
  { id: "4", name: "Food", emoji: "🥐", productCount: 4 },
  { id: "5", name: "Tea", emoji: "🍵", productCount: 4 },
]

const mockProducts = [
  { id: "1", name: "Flat White", price: 5.50, category: "Coffee", isActive: true, isPopular: true },
  { id: "2", name: "Long Black", price: 4.50, category: "Coffee", isActive: true, isPopular: true },
  { id: "3", name: "Cappuccino", price: 5.50, category: "Coffee", isActive: true, isPopular: false },
  { id: "4", name: "Latte", price: 5.50, category: "Coffee", isActive: true, isPopular: false },
  { id: "5", name: "Espresso", price: 4.00, category: "Coffee", isActive: true, isPopular: false },
  { id: "6", name: "Double Espresso", price: 5.00, category: "Coffee", isActive: false, isPopular: false },
  { id: "7", name: "Oat Latte", price: 6.50, category: "Specialty", isActive: true, isPopular: true },
  { id: "8", name: "Matcha Latte", price: 7.00, category: "Specialty", isActive: true, isPopular: false },
  { id: "9", name: "Cold Brew", price: 5.50, category: "Cold Drinks", isActive: true, isPopular: true },
  { id: "10", name: "Avocado Toast", price: 16.00, category: "Food", isActive: true, isPopular: false },
]

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProducts = mockProducts.filter((product) => {
    const matchesCategory = !activeCategory || product.category === activeCategory
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-espresso-950 font-display">Menu</h1>
          <p className="text-muted-foreground">Manage your products and categories</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Categories Sidebar */}
        <div className="w-64 shrink-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 p-2">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                    activeCategory === null
                      ? "bg-espresso-100 text-espresso-900"
                      : "hover:bg-muted"
                  )}
                >
                  <span className="font-medium">All Products</span>
                  <span className="text-muted-foreground">{mockProducts.length}</span>
                </button>
                {mockCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.name)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                      activeCategory === category.name
                        ? "bg-espresso-100 text-espresso-900"
                        : "hover:bg-muted"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span>{category.emoji}</span>
                      <span className="font-medium">{category.name}</span>
                    </span>
                    <span className="text-muted-foreground">{category.productCount}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products */}
        <div className="flex-1 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Products Table */}
          <Card>
            <div className="divide-y">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 text-sm font-medium text-muted-foreground">
                <div className="col-span-5">Product</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-1"></div>
              </div>

              {/* Products */}
              {filteredProducts.map((product) => (
                <div key={product.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors">
                  <div className="col-span-5 flex items-center gap-3">
                    <button className="cursor-grab text-muted-foreground hover:text-foreground">
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <div className="w-10 h-10 rounded-lg bg-espresso-100 flex items-center justify-center">
                      <Coffee className="w-5 h-5 text-espresso-600" />
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      {product.isPopular && (
                        <Badge variant="secondary" className="text-[10px]">Popular</Badge>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {product.category}
                  </div>
                  <div className="col-span-2 text-right font-medium">
                    {formatCurrency(product.price)}
                  </div>
                  <div className="col-span-2 text-center">
                    <Badge variant={product.isActive ? "success" : "secondary"}>
                      {product.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <Button variant="ghost" size="icon-sm">
                      {product.isActive ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon-sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {filteredProducts.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Coffee className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No products found</p>
                <p className="text-muted-foreground mb-4">Try adjusting your search or add a new product</p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

