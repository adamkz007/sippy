"use client"

import { 
  Store, 
  CreditCard, 
  Users,
  Bell,
  Palette,
  Shield,
  Link2,
  ChevronRight,
  DollarSign,
  Check
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useCurrency, SUPPORTED_CURRENCIES, CurrencyCode } from "@/components/currency-context"
import { cn } from "@/lib/utils"

const settingsGroups = [
  {
    title: "Cafe",
    description: "Manage your cafe details and branding",
    icon: Store,
    items: ["Business Info", "Operating Hours", "Location", "Branding"]
  },
  {
    title: "Currency",
    description: "Set your display currency",
    icon: DollarSign,
    items: ["Display Currency", "Price Format"]
  },
  {
    title: "Payments",
    description: "Payment processing and payouts",
    icon: CreditCard,
    items: ["Stripe Connect", "Tax Settings", "Receipt Templates"]
  },
  {
    title: "Team",
    description: "Staff accounts and permissions",
    icon: Users,
    items: ["Staff Members", "Roles & Permissions", "Time Tracking"]
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
  {
    title: "Integrations",
    description: "Connect third-party services",
    icon: Link2,
    items: ["Accounting", "Delivery Platforms", "POS Hardware"]
  },
]

export default function SettingsPage() {
  const { currency, setCurrency } = useCurrency()

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
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cafeName">Cafe Name</Label>
              <Input id="cafeName" defaultValue="The Daily Grind" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 bg-muted text-sm text-muted-foreground">
                  sippy.coffee/
                </span>
                <Input id="slug" defaultValue="daily-grind" className="rounded-l-none" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" defaultValue="123 Coffee Street, Kuala Lumpur" />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" defaultValue="+60 3 1234 5678" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue="hello@dailygrind.my" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" defaultValue="Asia/Kuala_Lumpur" disabled />
            </div>
          </div>
          <div className="flex justify-end">
            <Button>Save Changes</Button>
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
                onClick={() => setCurrency(curr.code as CurrencyCode)}
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

