"use client"

import { useState, useEffect, useCallback, ChangeEvent } from "react"
import { useSession } from "next-auth/react"
import { 
  Store, 
  CreditCard, 
  Users,
  Bell,
  Shield,
  Link2,
  ChevronRight,
  DollarSign,
  Check,
  Loader2,
  Coffee,
  Save,
  MapPin,
  AlertCircle
} from "lucide-react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCurrency, SUPPORTED_CURRENCIES, CurrencyCode } from "@/components/currency-context"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { AddressAutocomplete, AddressData } from "@/components/ui/address-autocomplete"

interface CafeData {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  placeId: string | null
  phone: string | null
  email: string | null
  timezone: string
  currency: string
  taxRate: number
  image: string | null
  pointsPerDollar: number
  pointsPerRedemption: number
}

const settingsGroups = [
  {
    title: "Payments",
    description: "Payment processing and payouts",
    icon: CreditCard,
    items: ["Stripe Connect", "Tax Settings", "Receipt Templates"]
  },
  {
    title: "Notifications",
    description: "Order alerts and customer comms",
    icon: Bell,
    items: ["Order Alerts", "Email Templates", "SMS Settings"]
  },
  {
    title: "Loyalty",
    description: "Configure your loyalty program",
    icon: Shield,
    items: ["Points Rate", "Tier Thresholds", "Voucher Settings"]
  },
]

export default function SettingsPage() {
  const { data: session, status: sessionStatus } = useSession()
  const { currency, setCurrency } = useCurrency()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cafe, setCafe] = useState<CafeData | null>(null)
  const [addressError, setAddressError] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    address: "",
    image: null as string | null,
    city: null as string | null,
    latitude: null as number | null,
    longitude: null as number | null,
    placeId: null as string | null,
    phone: "",
    email: "",
    timezone: "",
  })

  // Get cafeId from session
  const staffProfiles = (session?.user as any)?.staffProfiles || []
  const cafeId = staffProfiles[0]?.cafeId || ""

  const fetchCafe = useCallback(async () => {
    if (!cafeId) return
    
    try {
      const res = await fetch(`/api/cafe?cafeId=${cafeId}`)
      if (res.ok) {
        const data = await res.json()
        setCafe(data)
        setFormData({
          name: data.name || "",
          slug: data.slug || "",
          address: data.address || "",
          image: data.image || null,
          city: data.city || null,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          placeId: data.placeId || null,
          phone: data.phone || "",
          email: data.email || "",
          timezone: data.timezone || "",
        })
        // Sync currency with cafe settings
        if (data.currency) {
          setCurrency(data.currency as CurrencyCode)
        }
      }
    } catch (error) {
      console.error("Failed to fetch cafe:", error)
    }
    setLoading(false)
  }, [cafeId, setCurrency])

  useEffect(() => {
    if (sessionStatus === "loading") return
    
    if (cafeId) {
      fetchCafe()
    } else {
      setLoading(false)
    }
  }, [cafeId, sessionStatus, fetchCafe])

  const handleSave = async () => {
    if (!cafeId) return
    
    // Validate address is required
    if (!formData.address.trim()) {
      setAddressError("Address is required for your cafe to appear in nearby searches")
      return
    }
    setAddressError(null)
    
    setSaving(true)
    try {
      const res = await fetch('/api/cafe', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cafeId,
          name: formData.name,
          slug: formData.slug,
          address: formData.address,
          city: formData.city,
          latitude: formData.latitude,
          longitude: formData.longitude,
          placeId: formData.placeId,
          image: formData.image,
          phone: formData.phone,
          email: formData.email,
          timezone: formData.timezone,
          currency,
        }),
      })
      
      if (res.ok) {
        toast({ title: "Success", description: "Settings saved successfully" })
        fetchCafe()
      } else {
        const error = await res.json()
        toast({ title: "Error", description: error.error || "Failed to save settings", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" })
    }
    setSaving(false)
  }

  const handleAddressSelect = useCallback((data: AddressData) => {
    setFormData(prev => ({
      ...prev,
      address: data.address,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      placeId: data.placeId,
    }))
    if (data.address) {
      setAddressError(null)
    }
  }, [])

  const handleCurrencyChange = async (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency)
    if (!cafeId) return
    
    // Auto-save currency change
    try {
      await fetch('/api/cafe', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cafeId, currency: newCurrency }),
      })
    } catch (error) {
      console.error("Failed to save currency:", error)
    }
  }

  const handleLogoUpload = async (file: File) => {
    setLogoUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("filename", file.name)
      formData.append("contentType", file.type)

      const uploadRes = await fetch("/api/blob-upload", {
        method: "POST",
        body: formData,
      })

      const uploadData = await uploadRes.json()
      if (!uploadRes.ok || !uploadData.url) {
        throw new Error("Upload failed")
      }

      setFormData(prev => ({ ...prev, image: uploadData.url }))
      toast({ title: "Image uploaded", description: "Storefront image updated" })
    } catch (error: any) {
      console.error("Logo upload error:", error)
      toast({
        title: "Upload failed",
        description: error?.message || "Could not upload image",
        variant: "destructive",
      })
    } finally {
      setLogoUploading(false)
    }
  }

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image", variant: "destructive" })
      return
    }
    handleLogoUpload(file)
    event.target.value = ""
  }

  if (loading || sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-espresso-600" />
      </div>
    )
  }

  if (!cafeId) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Coffee className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">No Cafe Found</h2>
            <p className="text-muted-foreground">
              You need to be associated with a cafe to manage settings.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-espresso-950 font-display">Settings</h1>
        <p className="text-muted-foreground">Manage your cafe configuration</p>
      </div>

      {/* Quick Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Cafe Details</CardTitle>
          <CardDescription>Basic information about your cafe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-lg border bg-muted overflow-hidden">
              {formData.image ? (
                <Image
                  src={formData.image}
                  alt="Cafe storefront"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
                  <Store className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                    disabled={logoUploading}
                  />
                  <Button type="button" disabled={logoUploading}>
                    {logoUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {formData.image ? "Change Image" : "Upload Image"}
                  </Button>
                </label>
                {formData.image && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Storefront image is shown on customer pages and receipts.
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cafeName">Cafe Name</Label>
              <Input 
                id="cafeName" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 bg-muted text-sm text-muted-foreground">
                  sippy.coffee/
                </span>
                <Input 
                  id="slug" 
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="rounded-l-none" 
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-1">
              Address <span className="text-red-500">*</span>
            </Label>
            <AddressAutocomplete
              value={formData.address}
              onChange={(address) => setFormData({ ...formData, address })}
              onAddressSelect={handleAddressSelect}
              placeholder="Search for your cafe location..."
              required
              error={addressError || undefined}
            />
            {formData.latitude && formData.longitude && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Location verified: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
              </p>
            )}
            {!formData.latitude && formData.address && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Select an address from the dropdown to enable location features
              </p>
            )}
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input 
                id="timezone" 
                value={formData.timezone}
                disabled 
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Currency Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Currency Settings
          </CardTitle>
          <CardDescription>Set your display currency for all prices and transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {SUPPORTED_CURRENCIES.map((curr) => (
              <button
                key={curr.code}
                onClick={() => handleCurrencyChange(curr.code as CurrencyCode)}
                className={cn(
                  "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all hover:border-espresso-300",
                  currency === curr.code
                    ? "border-espresso-600 bg-espresso-50"
                    : "border-muted bg-background"
                )}
              >
                {currency === curr.code && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-4 h-4 text-espresso-600" />
                  </div>
                )}
                <span className="text-2xl font-bold text-espresso-800">{curr.symbol}</span>
                <span className="text-sm font-medium mt-1">{curr.code}</span>
                <span className="text-xs text-muted-foreground text-center mt-0.5">{curr.name}</span>
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Current currency: <span className="font-medium text-espresso-800">{currency}</span> — This will be used across your dashboard and customer-facing pages.
          </p>
        </CardContent>
      </Card>

      {/* Loyalty Settings */}
      {cafe && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Loyalty Configuration
            </CardTitle>
            <CardDescription>Configure how customers earn and redeem points</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Points per dollar spent</p>
                <p className="text-2xl font-bold">{cafe.pointsPerDollar} pts</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Points for $1 discount</p>
                <p className="text-2xl font-bold">{cafe.pointsPerRedemption} pts</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Contact support to modify loyalty program settings.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Settings Groups */}
      <div className="grid md:grid-cols-2 gap-4">
        {settingsGroups.map((group) => (
          <Card key={group.title} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-espresso-100 flex items-center justify-center shrink-0">
                  <group.icon className="w-6 h-6 text-espresso-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{group.title}</h3>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{group.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {group.items.map((item) => (
                      <span key={item} className="text-xs px-2 py-0.5 rounded-full bg-muted">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Cafe</p>
              <p className="text-sm text-muted-foreground">Permanently delete your cafe and all data</p>
            </div>
            <Button variant="destructive">Delete Cafe</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
