"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Coffee, ArrowRight, Eye, EyeOff, Check, Store, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

type AccountType = "customer" | "cafe"

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [accountType, setAccountType] = useState<AccountType>(
    (searchParams.get("type") as AccountType) || "customer"
  )
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    // Cafe-specific fields
    cafeName: "",
    cafeSlug: "",
    cafeAddress: "",
  })

  // Auto-generate slug from cafe name
  useEffect(() => {
    if (accountType === "cafe" && formData.cafeName) {
      const slug = formData.cafeName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
      setFormData((prev) => ({ ...prev, cafeSlug: slug }))
    }
  }, [formData.cafeName, accountType])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const endpoint = accountType === "cafe" 
        ? "/api/auth/register-cafe" 
        : "/api/auth/register"
      
      const payload = accountType === "cafe" 
        ? {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            cafeName: formData.cafeName,
            cafeSlug: formData.cafeSlug,
            cafeAddress: formData.cafeAddress,
          }
        : {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
          }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Registration failed")
      }

      toast({
        title: "Account created!",
        description: "Please sign in to continue.",
      })
      router.push(`/login?type=${accountType}`)
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

  async function handleGoogleSignUp() {
    setIsGoogleLoading(true)
    try {
      // Store the account type in session storage for use after OAuth callback
      sessionStorage.setItem("signupAccountType", accountType)
      
      await signIn("google", {
        callbackUrl: accountType === "cafe" ? "/setup-cafe" : "/home",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign up with Google",
        variant: "destructive",
      })
      setIsGoogleLoading(false)
    }
  }

  const customerFeatures = [
    "Earn points at any Sippy cafe",
    "Redeem rewards everywhere",
    "Discover your AI coffee profile",
    "Order ahead and skip the line",
  ]

  const cafeFeatures = [
    "Simple POS system built for cafes",
    "Universal loyalty program",
    "Real-time analytics & insights",
    "Customer management tools",
  ]

  const features = accountType === "customer" ? customerFeatures : cafeFeatures

  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className={`hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden transition-colors duration-500 ${
        accountType === "cafe" 
          ? "bg-gradient-to-br from-amber-700 to-amber-900" 
          : "bg-gradient-to-br from-espresso-700 to-espresso-900"
      }`}>
        {/* Background pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-md relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8 border border-white/20">
            {accountType === "cafe" ? (
              <Store className="w-10 h-10 text-white" />
            ) : (
              <Coffee className="w-10 h-10 text-white" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-white font-display mb-6">
            {accountType === "cafe" 
              ? "Start growing your cafe business"
              : "Start earning points at 500+ cafes"
            }
          </h2>
          <div className="space-y-4">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
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
            Create your account
          </h1>
          <p className="text-muted-foreground mb-8">
            {accountType === "cafe" 
              ? "Get your cafe on Sippy today"
              : "Start earning rewards at your favorite cafes"
            }
          </p>

          {/* Account Type Tabs */}
          <div className="flex mb-8 p-1 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => setAccountType("customer")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                accountType === "customer"
                  ? "bg-white text-espresso-900 shadow-sm"
                  : "text-muted-foreground hover:text-espresso-700"
              }`}
            >
              <User className="w-4 h-4" />
              Customer
            </button>
            <button
              type="button"
              onClick={() => setAccountType("cafe")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                accountType === "cafe"
                  ? "bg-white text-espresso-900 shadow-sm"
                  : "text-muted-foreground hover:text-espresso-700"
              }`}
            >
              <Store className="w-4 h-4" />
              Cafe Owner
            </button>
          </div>

          {/* Google Sign Up */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-6 h-12 text-base bg-white border-2 border-espresso-200 text-espresso-900 hover:bg-espresso-50 hover:border-espresso-300 hover:text-espresso-950"
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Signing up...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Alex Smith"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            {accountType === "cafe" && (
              <>
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
                  <Label htmlFor="cafeAddress">Cafe Address</Label>
                  <Input
                    id="cafeAddress"
                    type="text"
                    placeholder="123 Bean St, Melbourne"
                    value={formData.cafeAddress}
                    onChange={(e) => setFormData({ ...formData, cafeAddress: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Customers will use this to find and visit your cafe
                  </p>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone{accountType === "cafe" ? " (optional)" : ""}
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+61 400 000 000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required={accountType === "customer"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline">Terms of Service</Link> and{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link 
                href={`/login?type=${accountType}`} 
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-espresso-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}
