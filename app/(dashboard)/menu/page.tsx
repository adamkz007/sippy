"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Coffee,
  GripVertical,
  Loader2,
  ChevronRight,
  Settings,
  X,
  Package
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogBody } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn, formatCurrency, CurrencyCode } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { useCurrency } from "@/components/currency-context"

// Types
interface ModifierOption {
  id?: string
  name: string
  price: number
  isDefault: boolean
}

interface ProductModifier {
  id: string
  name: string
  required: boolean
  maxSelect: number
  options: ModifierOption[]
}

interface Category {
  id: string
  name: string
  description?: string | null
  image?: string | null
  sortOrder: number
  isActive: boolean
  productCount: number
}

interface Product {
  id: string
  name: string
  description?: string | null
  price: number
  cost?: number | null
  categoryId: string
  isActive: boolean
  isPopular: boolean
  sortOrder: number
  roastLevel?: string | null
  origin?: string | null
  flavorNotes: string[]
  category: Category
  modifiers: ProductModifier[]
}

// Initial states for forms
const initialCategoryForm = {
  name: "",
  description: "",
  isActive: true,
}

const initialProductForm = {
  name: "",
  description: "",
  price: "",
  cost: "",
  categoryId: "",
  isActive: true,
  isPopular: false,
  roastLevel: "",
  origin: "",
  flavorNotes: [] as string[],
}

const initialModifierForm = {
  name: "",
  required: false,
  maxSelect: 1,
  options: [{ name: "", price: 0, isDefault: false }] as ModifierOption[],
}

export default function MenuPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const { currency } = useCurrency()
  
  // State
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Modal states
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [modifierModalOpen, setModifierModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  
  // Form states
  const [categoryForm, setCategoryForm] = useState(initialCategoryForm)
  const [productForm, setProductForm] = useState(initialProductForm)
  const [modifierForm, setModifierForm] = useState(initialModifierForm)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingModifier, setEditingModifier] = useState<ProductModifier | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'product' | 'modifier', id: string, name: string } | null>(null)
  const [productTab, setProductTab] = useState("details")
  
  // Get cafeId from session - staff profile includes cafeId
  const cafeId = (session?.user as any)?.cafeId || ""

  // Fetch data
  const fetchCategories = useCallback(async () => {
    if (!cafeId) return
    try {
      const res = await fetch(`/api/categories?cafeId=${cafeId}`)
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }, [cafeId])

  const fetchProducts = useCallback(async () => {
    if (!cafeId) return
    try {
      const res = await fetch(`/api/products?cafeId=${cafeId}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
    }
  }, [cafeId])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchCategories(), fetchProducts()])
      setLoading(false)
    }
    if (cafeId) {
      loadData()
    }
  }, [cafeId, fetchCategories, fetchProducts])

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesCategory = !activeCategory || product.category.name === activeCategory
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Category CRUD
  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setCategoryForm({
        name: category.name,
        description: category.description || "",
        isActive: category.isActive,
      })
    } else {
      setEditingCategory(null)
      setCategoryForm(initialCategoryForm)
    }
    setCategoryModalOpen(true)
  }

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast({ title: "Error", description: "Category name is required", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const method = editingCategory ? "PATCH" : "POST"
      const body = editingCategory 
        ? { id: editingCategory.id, ...categoryForm }
        : { cafeId, ...categoryForm }
      
      const res = await fetch("/api/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      
      if (res.ok) {
        toast({ title: "Success", description: `Category ${editingCategory ? 'updated' : 'created'} successfully` })
        setCategoryModalOpen(false)
        fetchCategories()
      } else {
        const error = await res.json()
        toast({ title: "Error", description: error.error || "Failed to save category", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save category", variant: "destructive" })
    }
    setSaving(false)
  }

  // Product CRUD
  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setProductForm({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        cost: product.cost?.toString() || "",
        categoryId: product.categoryId,
        isActive: product.isActive,
        isPopular: product.isPopular,
        roastLevel: product.roastLevel || "",
        origin: product.origin || "",
        flavorNotes: product.flavorNotes || [],
      })
    } else {
      setEditingProduct(null)
      setProductForm({
        ...initialProductForm,
        categoryId: categories.length > 0 ? categories[0].id : "",
      })
    }
    setProductTab("details")
    setProductModalOpen(true)
  }

  const handleSaveProduct = async () => {
    if (!productForm.name.trim()) {
      toast({ title: "Error", description: "Product name is required", variant: "destructive" })
      return
    }
    if (!productForm.price || parseFloat(productForm.price) <= 0) {
      toast({ title: "Error", description: "Valid price is required", variant: "destructive" })
      return
    }
    if (!productForm.categoryId) {
      toast({ title: "Error", description: "Category is required", variant: "destructive" })
      return
    }
    
    setSaving(true)
    try {
      const method = editingProduct ? "PATCH" : "POST"
      const data = {
        ...(editingProduct ? { id: editingProduct.id } : { cafeId }),
        name: productForm.name,
        description: productForm.description || null,
        price: parseFloat(productForm.price),
        cost: productForm.cost ? parseFloat(productForm.cost) : null,
        categoryId: productForm.categoryId,
        isActive: productForm.isActive,
        isPopular: productForm.isPopular,
        roastLevel: productForm.roastLevel || null,
        origin: productForm.origin || null,
        flavorNotes: productForm.flavorNotes,
      }
      
      const res = await fetch("/api/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      
      if (res.ok) {
        toast({ title: "Success", description: `Product ${editingProduct ? 'updated' : 'created'} successfully` })
        setProductModalOpen(false)
        fetchProducts()
        fetchCategories() // Refresh counts
      } else {
        const error = await res.json()
        toast({ title: "Error", description: error.error || "Failed to save product", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save product", variant: "destructive" })
    }
    setSaving(false)
  }

  const handleToggleProductActive = async (product: Product) => {
    try {
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, isActive: !product.isActive }),
      })
      if (res.ok) {
        fetchProducts()
        toast({ 
          title: "Success", 
          description: `${product.name} is now ${product.isActive ? 'hidden' : 'visible'}` 
        })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update product", variant: "destructive" })
    }
  }

  // Modifier CRUD
  const openModifierModal = (modifier?: ProductModifier) => {
    if (modifier) {
      setEditingModifier(modifier)
      setModifierForm({
        name: modifier.name,
        required: modifier.required,
        maxSelect: modifier.maxSelect,
        options: modifier.options.map(o => ({ ...o })),
      })
    } else {
      setEditingModifier(null)
      setModifierForm(initialModifierForm)
    }
    setModifierModalOpen(true)
  }

  const handleAddModifierOption = () => {
    setModifierForm(prev => ({
      ...prev,
      options: [...prev.options, { name: "", price: 0, isDefault: false }],
    }))
  }

  const handleRemoveModifierOption = (index: number) => {
    setModifierForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }))
  }

  const handleModifierOptionChange = (index: number, field: keyof ModifierOption, value: any) => {
    setModifierForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      ),
    }))
  }

  const handleSaveModifier = async () => {
    if (!modifierForm.name.trim()) {
      toast({ title: "Error", description: "Modifier name is required", variant: "destructive" })
      return
    }
    if (modifierForm.options.length === 0 || !modifierForm.options.some(o => o.name.trim())) {
      toast({ title: "Error", description: "At least one option is required", variant: "destructive" })
      return
    }
    
    setSaving(true)
    try {
      const method = editingModifier ? "PATCH" : "POST"
      const validOptions = modifierForm.options.filter(o => o.name.trim())
      const data = {
        ...(editingModifier ? { id: editingModifier.id } : { productId: editingProduct?.id }),
        name: modifierForm.name,
        required: modifierForm.required,
        maxSelect: modifierForm.maxSelect,
        options: validOptions,
      }
      
      const res = await fetch("/api/modifiers", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      
      if (res.ok) {
        toast({ title: "Success", description: `Add-on ${editingModifier ? 'updated' : 'created'} successfully` })
        setModifierModalOpen(false)
        fetchProducts() // Refresh to get updated modifiers
      } else {
        const error = await res.json()
        toast({ title: "Error", description: error.error || "Failed to save add-on", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save add-on", variant: "destructive" })
    }
    setSaving(false)
  }

  // Delete handlers
  const openDeleteConfirm = (type: 'category' | 'product' | 'modifier', id: string, name: string) => {
    setDeleteTarget({ type, id, name })
    setDeleteConfirmOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSaving(true)
    try {
      const endpoint = deleteTarget.type === 'category' 
        ? '/api/categories' 
        : deleteTarget.type === 'product'
        ? '/api/products'
        : '/api/modifiers'
      
      const res = await fetch(`${endpoint}?id=${deleteTarget.id}`, {
        method: "DELETE",
      })
      
      if (res.ok) {
        toast({ title: "Success", description: `${deleteTarget.name} deleted successfully` })
        setDeleteConfirmOpen(false)
        setDeleteTarget(null)
        
        if (deleteTarget.type === 'category') {
          fetchCategories()
          if (activeCategory === deleteTarget.name) {
            setActiveCategory(null)
          }
        } else if (deleteTarget.type === 'product') {
          fetchProducts()
          fetchCategories()
        } else {
          fetchProducts()
        }
      } else {
        const error = await res.json()
        toast({ title: "Error", description: error.error || "Failed to delete", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" })
    }
    setSaving(false)
  }

  // Flavor notes helper
  const handleFlavorNotesChange = (value: string) => {
    const notes = value.split(',').map(s => s.trim()).filter(Boolean)
    setProductForm(prev => ({ ...prev, flavorNotes: notes }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-espresso-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-espresso-950 font-display">Menu</h1>
          <p className="text-muted-foreground">Manage your products, categories, and add-ons</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openCategoryModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
          <Button onClick={() => openProductModal()}>
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
                  <span className="text-muted-foreground">{products.length}</span>
                </button>
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors group",
                      activeCategory === category.name
                        ? "bg-espresso-100 text-espresso-900"
                        : "hover:bg-muted"
                    )}
                  >
                    <button
                      onClick={() => setActiveCategory(category.name)}
                      className="flex-1 flex items-center gap-2 text-left"
                    >
                      <span className={cn("font-medium", !category.isActive && "text-muted-foreground line-through")}>
                        {category.name}
                      </span>
                      {!category.isActive && (
                        <EyeOff className="w-3 h-3 text-muted-foreground" />
                      )}
                    </button>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground mr-1">{category.productCount}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openCategoryModal(category)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white rounded transition-opacity"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openDeleteConfirm('category', category.id, category.name)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white rounded transition-opacity text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
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
                <div className="col-span-4">Product</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {/* Products */}
              {filteredProducts.map((product) => (
                <div key={product.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors">
                  <div className="col-span-4 flex items-center gap-3">
                    <button className="cursor-grab text-muted-foreground hover:text-foreground">
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <div className="w-10 h-10 rounded-lg bg-espresso-100 flex items-center justify-center">
                      <Coffee className="w-5 h-5 text-espresso-600" />
                    </div>
                    <div>
                      <p className={cn("font-medium", !product.isActive && "text-muted-foreground")}>
                        {product.name}
                      </p>
                      <div className="flex items-center gap-1">
                        {product.isPopular && (
                          <Badge variant="secondary" className="text-[10px]">Popular</Badge>
                        )}
                        {product.modifiers.length > 0 && (
                          <Badge variant="outline" className="text-[10px]">
                            <Settings className="w-2.5 h-2.5 mr-0.5" />
                            {product.modifiers.length} add-ons
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {product.category.name}
                  </div>
                  <div className="col-span-2 text-right font-medium">
                    {formatCurrency(product.price, currency)}
                  </div>
                  <div className="col-span-2 text-center">
                    <Badge variant={product.isActive ? "success" : "secondary"}>
                      {product.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </div>
                  <div className="col-span-2 flex justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon-sm"
                      onClick={() => handleToggleProductActive(product)}
                      title={product.isActive ? "Hide product" : "Show product"}
                    >
                      {product.isActive ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon-sm"
                      onClick={() => openProductModal(product)}
                      title="Edit product"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon-sm" 
                      className="text-destructive"
                      onClick={() => openDeleteConfirm('product', product.id, product.name)}
                      title="Delete product"
                    >
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
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "Try adjusting your search" 
                    : categories.length === 0 
                    ? "Create a category first, then add products"
                    : "Add a new product to get started"
                  }
                </p>
                {categories.length > 0 && (
                  <Button onClick={() => openProductModal()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Category Modal */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent onClose={() => setCategoryModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update category details' : 'Create a new menu category'}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Name *</Label>
              <Input
                id="category-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Coffee, Pastries"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Description</Label>
              <Textarea
                id="category-description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="category-active">Active</Label>
                <p className="text-xs text-muted-foreground">Hidden categories won&apos;t appear on the menu</p>
              </div>
              <Switch
                id="category-active"
                checked={categoryForm.isActive}
                onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Modal */}
      <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
        <DialogContent onClose={() => setProductModalOpen(false)} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product details and add-ons' : 'Create a new menu item'}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={productTab} onValueChange={setProductTab}>
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
              {editingProduct && (
                <TabsTrigger value="addons" className="flex-1">
                  Add-ons
                  {editingProduct.modifiers.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {editingProduct.modifiers.length}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="details">
              <DialogBody className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Name *</Label>
                    <Input
                      id="product-name"
                      value={productForm.name}
                      onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Flat White"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-category">Category *</Label>
                    <Select
                      value={productForm.categoryId}
                      onValueChange={(value) => setProductForm(prev => ({ ...prev, categoryId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="product-description">Description</Label>
                  <Textarea
                    id="product-description"
                    value={productForm.description}
                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the item"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-price">Price *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        {currency === 'MYR' ? 'RM' : '$'}
                      </span>
                      <Input
                        id="product-price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={productForm.price}
                        onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                        className="pl-10"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-cost">Cost (Optional)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        {currency === 'MYR' ? 'RM' : '$'}
                      </span>
                      <Input
                        id="product-cost"
                        type="number"
                        step="0.01"
                        min="0"
                        value={productForm.cost}
                        onChange={(e) => setProductForm(prev => ({ ...prev, cost: e.target.value }))}
                        className="pl-10"
                        placeholder="For profit tracking"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-roast">Roast Level</Label>
                    <Select
                      value={productForm.roastLevel}
                      onValueChange={(value) => setProductForm(prev => ({ ...prev, roastLevel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select roast" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        <SelectItem value="LIGHT">Light</SelectItem>
                        <SelectItem value="MEDIUM_LIGHT">Medium Light</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="MEDIUM_DARK">Medium Dark</SelectItem>
                        <SelectItem value="DARK">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-origin">Origin</Label>
                    <Input
                      id="product-origin"
                      value={productForm.origin}
                      onChange={(e) => setProductForm(prev => ({ ...prev, origin: e.target.value }))}
                      placeholder="e.g., Ethiopian, Colombian"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-notes">Flavor Notes</Label>
                  <Input
                    id="product-notes"
                    value={productForm.flavorNotes.join(', ')}
                    onChange={(e) => handleFlavorNotesChange(e.target.value)}
                    placeholder="Comma-separated, e.g., chocolate, nutty, fruity"
                  />
                </div>

                <div className="flex gap-6 pt-2">
                  <div className="flex items-center gap-3">
                    <Switch
                      id="product-active"
                      checked={productForm.isActive}
                      onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label htmlFor="product-active">Active</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="product-popular"
                      checked={productForm.isPopular}
                      onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, isPopular: checked }))}
                    />
                    <Label htmlFor="product-popular">Mark as Popular</Label>
                  </div>
                </div>
              </DialogBody>
            </TabsContent>

            {editingProduct && (
              <TabsContent value="addons">
                <DialogBody className="space-y-4 max-h-[60vh] overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Product Add-ons</h3>
                      <p className="text-sm text-muted-foreground">Configure customization options</p>
                    </div>
                    <Button size="sm" onClick={() => openModifierModal()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Option Group
                    </Button>
                  </div>

                  {editingProduct.modifiers.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <Package className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No add-ons configured</p>
                      <p className="text-sm text-muted-foreground">Add option groups like &quot;Milk Options&quot; or &quot;Extra Shots&quot;</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {editingProduct.modifiers.map((modifier) => (
                        <div key={modifier.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium flex items-center gap-2">
                                {modifier.name}
                                {modifier.required && (
                                  <Badge variant="outline" className="text-[10px]">Required</Badge>
                                )}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {modifier.maxSelect === 1 ? 'Single select' : `Select up to ${modifier.maxSelect}`}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon-sm"
                                onClick={() => openModifierModal(modifier)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon-sm"
                                className="text-destructive"
                                onClick={() => openDeleteConfirm('modifier', modifier.id, modifier.name)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {modifier.options.map((option) => (
                              <Badge 
                                key={option.id} 
                                variant={option.isDefault ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {option.name}
                                {option.price > 0 && ` (+${formatCurrency(option.price, currency)})`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </DialogBody>
              </TabsContent>
            )}
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProductModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProduct} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modifier Modal */}
      <Dialog open={modifierModalOpen} onOpenChange={setModifierModalOpen}>
        <DialogContent onClose={() => setModifierModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editingModifier ? 'Edit Add-on Group' : 'Add Add-on Group'}</DialogTitle>
            <DialogDescription>
              Configure customization options for this product
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="modifier-name">Group Name *</Label>
              <Input
                id="modifier-name"
                value={modifierForm.name}
                onChange={(e) => setModifierForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Milk Options, Extra Shots"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Switch
                  id="modifier-required"
                  checked={modifierForm.required}
                  onCheckedChange={(checked) => setModifierForm(prev => ({ ...prev, required: checked }))}
                />
                <Label htmlFor="modifier-required">Required</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="modifier-max">Max Selections</Label>
                <Input
                  id="modifier-max"
                  type="number"
                  min="1"
                  value={modifierForm.maxSelect}
                  onChange={(e) => setModifierForm(prev => ({ ...prev, maxSelect: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Options *</Label>
                <Button type="button" variant="ghost" size="sm" onClick={handleAddModifierOption}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Option
                </Button>
              </div>
              <div className="space-y-2">
                {modifierForm.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option.name}
                      onChange={(e) => handleModifierOptionChange(index, 'name', e.target.value)}
                      placeholder="Option name"
                      className="flex-1"
                    />
                    <div className="relative w-28">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        {currency === 'MYR' ? 'RM' : '$'}
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={option.price}
                        onChange={(e) => handleModifierOptionChange(index, 'price', parseFloat(e.target.value) || 0)}
                        className="pl-10"
                        placeholder="0.00"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleModifierOptionChange(index, 'isDefault', !option.isDefault)}
                      className={cn(option.isDefault && "bg-espresso-100 text-espresso-600")}
                      title="Set as default"
                    >
                      <ChevronRight className={cn("w-4 h-4 transition-transform", option.isDefault && "rotate-90")} />
                    </Button>
                    {modifierForm.options.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRemoveModifierOption(index)}
                        className="text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Click the arrow to set an option as default. Add extra price for premium options.
              </p>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModifierModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveModifier} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingModifier ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent onClose={() => setDeleteConfirmOpen(false)} className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {deleteTarget?.type}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
