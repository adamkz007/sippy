"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
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
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock user data
const user = {
  name: "Alex Chen",
  email: "alex@example.com",
  phone: "+61 412 345 678",
  image: null,
  defaultAddress: "123 Coffee Street, Melbourne VIC 3000",
  notifications: {
    orderUpdates: true,
    promotions: true,
    rewards: true,
    newCafes: false,
  },
  preferences: {
    darkMode: false,
    language: "English",
  },
}

const ToggleSwitch = ({ 
  checked, 
  onChange 
}: { 
  checked: boolean
  onChange: (checked: boolean) => void 
}) => (
  <button
    onClick={() => onChange(!checked)}
    className={cn(
      "relative w-12 h-7 rounded-full transition-colors duration-200",
      checked ? "bg-espresso-700" : "bg-cream-300"
    )}
  >
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm",
        checked ? "left-6" : "left-1"
      )}
    />
  </button>
)

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.defaultAddress,
  })
  const [notifications, setNotifications] = useState(user.notifications)
  const [preferences, setPreferences] = useState(user.preferences)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    // Save logic here
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-cream-50/80 backdrop-blur-xl border-b border-cream-200/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold text-espresso-900 font-display">Settings</h1>
          </div>
          {isEditing && (
            <Button size="sm" onClick={handleSave}>
              <Check className="w-4 h-4 mr-1" />
              Save
            </Button>
          )}
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Profile Photo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="relative mb-4">
            <Avatar className="w-24 h-24 border-4 border-cream-200">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-espresso-100 to-espresso-200 text-espresso-700 text-2xl font-semibold">
                {user.name.split(' ').map(n => n[0]).join('')}
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
        </motion.div>

        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
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
                  disabled={!isEditing}
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
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-espresso-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Default Address
                </Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditing}
                  className="bg-cream-50 border-cream-200"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-semibold text-espresso-700 mb-3 px-1 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </h3>
          <Card className="border-cream-200/50 shadow-sm">
            <CardContent className="p-0">
              {[
                { key: "orderUpdates", label: "Order Updates", description: "Get notified when your order status changes" },
                { key: "promotions", label: "Promotions", description: "Receive special offers and deals" },
                { key: "rewards", label: "Rewards", description: "Updates on points and rewards" },
                { key: "newCafes", label: "New Cafes", description: "Discover new cafes in your area" },
              ].map((item, index, arr) => (
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
                    checked={notifications[item.key as keyof typeof notifications]}
                    onChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
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
              
              <button className="w-full flex items-center justify-between p-4">
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
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-sm font-semibold text-espresso-700 mb-3 px-1 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </h3>
          <Card className="border-cream-200/50 shadow-sm">
            <CardContent className="p-0">
              <button className="w-full flex items-center justify-between p-4 border-b border-cream-200/50">
                <span className="font-medium text-espresso-900">Change Password</span>
                <ChevronRight className="w-5 h-5 text-espresso-400" />
              </button>
              <button className="w-full flex items-center justify-between p-4">
                <span className="font-medium text-espresso-900">Two-Factor Authentication</span>
                <ChevronRight className="w-5 h-5 text-espresso-400" />
              </button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-sm font-semibold text-red-600 mb-3 px-1">Danger Zone</h3>
          <Card className="border-red-200 shadow-sm">
            <CardContent className="p-4">
              <button className="w-full flex items-center gap-3 text-red-600 hover:text-red-700">
                <Trash2 className="w-5 h-5" />
                <span className="font-medium">Delete Account</span>
              </button>
              <p className="text-xs text-red-500 mt-2">
                This will permanently delete your account and all associated data.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

