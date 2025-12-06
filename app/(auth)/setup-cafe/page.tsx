"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Coffee, ArrowRight, Store, Loader2, MapPin, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { AddressAutocomplete, AddressData } from "@/components/ui/address-autocomplete"

export default function SetupCafePage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [addressError, setAddressError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    cafeName: "",
    cafeSlug: "",
    address: "",
    city: null as string | null,
    latitude: null as number | null,
    longitude: null as number | null,
    placeId: null as string | null,
  })

  // Auto-generate slug from cafe name
  useEffect(() => {
    if (formData.cafeName) {
      const slug = formData.cafeName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
      setFormData((prev) => ({ ...prev, cafeSlug: slug }))
    }
  }, [formData.cafeName])

  // Redirect if not authenticated or already has a cafe
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?type=cafe")
    } else if (session?.user?.staffProfiles && session.user.staffProfiles.length > 0) {
      // User already has a cafe, redirect to dashboard
      router.push("/dashboard")
    }
  }, [session, status, router])

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validate address
    if (!formData.address.trim()) {
      setAddressError("Address is required for customers to find your cafe")
      return
    }
    setAddressError(null)
    
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/google-callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email,
          accountType: "cafe",
          name: session?.user?.name,
          image: session?.user?.image,
          cafeName: formData.cafeName,
          cafeSlug: formData.cafeSlug,
          cafeAddress: formData.address,
          cafeCity: formData.city,
          cafeLatitude: formData.latitude,
          cafeLongitude: formData.longitude,
          cafePlaceId: formData.placeId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to set up cafe")
      }

      // Update the session to reflect new user role
      await update()

      toast({
        title: "Cafe created!",
        description: "Redirecting to your dashboard...",
      })

      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-amber-700 to-amber-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-md relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8 border border-white/20">
            <Store className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white font-display mb-4">
            Almost there!
          </h2>
          <p className="text-white/80 text-lg">
            Just a few more details to set up your cafe on Sippy and start growing your business.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-espresso-500 to-espresso-700 flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-espresso-900 font-display">Sippy</span>
          </Link>

          <h1 className="text-3xl font-bold text-espresso-950 font-display mb-2">
            Set up your cafe
          </h1>
          <p className="text-muted-foreground mb-8">
            Welcome{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}! 
            Let&apos;s get your cafe ready on Sippy.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cafeName">Cafe Name</Label>
              <Input
                id="cafeName"
                type="text"
                placeholder="The Coffee House"
                value={formData.cafeName}
                onChange={(e) => setFormData({ ...formData, cafeName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cafeSlug">Cafe URL</Label>
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-1">sippy.coffee/</span>
                <Input
                  id="cafeSlug"
                  type="text"
                  placeholder="the-coffee-house"
                  value={formData.cafeSlug}
                  onChange={(e) => setFormData({ ...formData, cafeSlug: e.target.value })}
                  className="flex-1"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This will be your cafe&apos;s unique URL for online ordering
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cafeAddress" className="flex items-center gap-1">
                Cafe Address <span className="text-red-500">*</span>
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
                  Location verified
                </p>
              )}
              {!formData.latitude && formData.address && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Select an address from the dropdown
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Your address helps customers find you in nearby searches
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-8">
            Changed your mind?{" "}
            <Link href="/" className="text-primary hover:underline">
              Continue as a customer instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

