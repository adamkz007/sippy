"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  Bell,
  Moon,
  Globe,
  Shield,
  Trash2,
  Camera,
  ChevronRight,
  Check
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const ToggleSwitch = ({ 
  checked, 
  onChange 
}: { 
  checked: boolean
  onChange: (checked: boolean) => void 
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={cn(
      "relative w-12 h-7 rounded-full transition-colors duration-200",
      checked ? "bg-espresso-700" : "bg-cream-300"
    )}
  >
    <div
      className={cn(
        "absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200",
        checked ? "left-6" : "left-1"
      )}
    />
  </button>
)

export default function SettingsPage() {
  const router = useRouter()
  const phoneInputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(true)
  const [userImage, setUserImage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  type NotificationKey = "orderUpdates" | "promotions"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    orderUpdates: true,
    promotions: true,
  })
  const [preferences, setPreferences] = useState({
    darkMode: false,
    language: "English",
  })
  const [isEditing, setIsEditing] = useState(false)
  const missingPhone = !formData.phone || formData.phone.trim().length === 0

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch("/api/customer/me", { cache: "no-store" })
        if (!res.ok) {
          throw new Error("Failed to fetch profile")
        }
        const data = await res.json()
        if (!active) return
        setFormData({
          name: data.user?.name || "",
          email: data.user?.email || "",
          phone: data.user?.phone || "",
        })
        setUserImage(data.user?.image || null)
      } catch {
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const handleBack = useCallback(() => {
    router.push('/home')
  }, [router])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const payload = {
        name: formData.name.trim() || null,
        phone: formData.phone.trim() || null,
      }
      const res = await fetch("/api/customer/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) return

      const updated = await res.json()
      setFormData((prev) => ({
        ...prev,
        name: updated.user?.name ?? prev.name,
        phone: updated.user?.phone ?? prev.phone,
      }))
      setIsEditing(false)
    } finally {
      setSaving(false)
    }
  }, [formData.name, formData.phone])

  return (
    <div className="min-h-screen pb-8 animate-in fade-in duration-200">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-cream-50/80 backdrop-blur-xl border-b border-cream-200/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon-sm" onClick={handleBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold text-espresso-900 font-display">Settings</h1>
          </div>
          {isEditing && (
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Check className="w-4 h-4 mr-1" />
              {saving ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {loading ? (
          <div className="px-1 text-sm text-espresso-500">Loading profile…</div>
        ) : null}
        {!loading && missingPhone ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-espresso-900">Add your phone number</p>
                  <p className="text-xs text-espresso-600">Secure your account and enable SMS updates</p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setIsEditing(true)
                  setTimeout(() => phoneInputRef.current?.focus(), 0)
                }}
              >
                Add phone
              </Button>
            </CardContent>
          </Card>
        ) : null}
        {/* Profile Photo */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <Avatar className="w-24 h-24 border-4 border-cream-200">
              <AvatarImage src={userImage || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-espresso-100 to-espresso-200 text-espresso-700 text-2xl font-semibold">
                {(formData.name || "U N").split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon-sm"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full shadow-md"
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        {/* Personal Information */}
        <div>
          <h3 className="text-sm font-semibold text-espresso-700 mb-3 px-1">Personal Information</h3>
          <Card className="border-cream-200/50 shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-espresso-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Name
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="bg-cream-50 border-cream-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-espresso-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={true}
                className="bg-cream-50 border-cream-200"
              />
              </div>
              
              <div className="space-y-2">
                <Label className="text-espresso-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                className="bg-cream-50 border-cream-200"
                ref={phoneInputRef}
              />
            </div>
            
            
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <div>
          <h3 className="text-sm font-semibold text-espresso-700 mb-3 px-1 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </h3>
          <Card className="border-cream-200/50 shadow-sm">
            <CardContent className="p-0">
              {(
                [
                  {
                    key: "orderUpdates",
                    label: "Order Updates",
                    description: "Get notified when your order status changes",
                  },
                  {
                    key: "promotions",
                    label: "Promotions & News",
                    description: "Receive special offers, announcements, and product news",
                  },
                ] as const
              ).map((item, index, arr) => (
                <div
                  key={item.key}
                  className={cn(
                    "flex items-center justify-between p-4",
                    index !== arr.length - 1 && "border-b border-cream-200/50"
                  )}
                >
                  <div>
                    <p className="font-medium text-espresso-900">{item.label}</p>
                    <p className="text-xs text-espresso-500">{item.description}</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications[item.key]}
                    onChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, [item.key]: checked }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Preferences */}
        <div>
          <h3 className="text-sm font-semibold text-espresso-700 mb-3 px-1">Preferences</h3>
          <Card className="border-cream-200/50 shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b border-cream-200/50">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-espresso-600" />
                  <div>
                    <p className="font-medium text-espresso-900">Dark Mode</p>
                    <p className="text-xs text-espresso-500">Use dark theme</p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={preferences.darkMode}
                  onChange={(checked) => setPreferences({ ...preferences, darkMode: checked })}
                />
              </div>
              
              <button type="button" className="w-full flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-espresso-600" />
                  <div className="text-left">
                    <p className="font-medium text-espresso-900">Language</p>
                    <p className="text-xs text-espresso-500">{preferences.language}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-espresso-400" />
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Security */}
        <div>
          <h3 className="text-sm font-semibold text-espresso-700 mb-3 px-1 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </h3>
          <Card className="border-cream-200/50 shadow-sm">
            <CardContent className="p-0">
              <button type="button" className="w-full flex items-center justify-between p-4 border-b border-cream-200/50">
                <span className="font-medium text-espresso-900">Change Password</span>
                <ChevronRight className="w-5 h-5 text-espresso-400" />
              </button>
              <button type="button" className="w-full flex items-center justify-between p-4">
                <span className="font-medium text-espresso-900">Two-Factor Authentication</span>
                <ChevronRight className="w-5 h-5 text-espresso-400" />
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <div>
          <h3 className="text-sm font-semibold text-red-600 mb-3 px-1">Danger Zone</h3>
          <Card className="border-red-200 shadow-sm">
            <CardContent className="p-4">
              <button type="button" className="w-full flex items-center gap-3 text-red-600 hover:text-red-700">
                <Trash2 className="w-5 h-5" />
                <span className="font-medium">Delete Account</span>
              </button>
              <p className="text-xs text-red-500 mt-2">
                This will permanently delete your account and all associated data.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
