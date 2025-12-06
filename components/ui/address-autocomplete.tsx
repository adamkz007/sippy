"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Input } from "./input"
import { MapPin, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"

declare global {
  interface Window {
    google: any
    initGoogleMaps?: () => void
  }
  // Declare the global google namespace used by the Maps script
  const google: any
}

export interface AddressData {
  address: string
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  placeId: string | null
}

interface AddressAutocompleteProps {
  value: string
  onChange: (address: string) => void
  onAddressSelect: (data: AddressData) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  className?: string
}

let googleMapsLoaded = false
let googleMapsLoading = false
const loadCallbacks: (() => void)[] = []

function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (googleMapsLoaded) {
      resolve()
      return
    }

    if (googleMapsLoading) {
      loadCallbacks.push(() => resolve())
      return
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.warn("Google Maps API key not configured")
      reject(new Error("Google Maps API key not configured"))
      return
    }

    googleMapsLoading = true

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`
    script.async = true
    script.defer = true

    window.initGoogleMaps = () => {
      googleMapsLoaded = true
      googleMapsLoading = false
      loadCallbacks.forEach((cb) => cb())
      loadCallbacks.length = 0
      resolve()
    }

    script.onerror = () => {
      googleMapsLoading = false
      reject(new Error("Failed to load Google Maps"))
    }

    document.head.appendChild(script)
  })
}

export function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Start typing an address...",
  disabled = false,
  required = false,
  error,
  className,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)

  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => {
        setIsGoogleLoaded(true)
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!isGoogleLoaded || !inputRef.current || autocompleteRef.current) return

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["establishment", "geocode"],
      fields: ["formatted_address", "geometry", "address_components", "place_id", "name"],
    })

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace()

      if (!place.geometry?.location) {
        return
      }

      let city: string | null = null
      let country: string | null = null

      if (place.address_components) {
        for (const component of place.address_components) {
          if (component.types.includes("locality")) {
            city = component.long_name
          }
          if (component.types.includes("country")) {
            country = component.short_name
          }
        }
      }

      // Use establishment name + address for cafes, or just formatted address
      const fullAddress = place.name && !place.formatted_address?.includes(place.name)
        ? `${place.name}, ${place.formatted_address}`
        : place.formatted_address || ""

      onChange(fullAddress)
      onAddressSelect({
        address: fullAddress,
        city,
        country,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        placeId: place.place_id || null,
      })
    })

    autocompleteRef.current = autocomplete
  }, [isGoogleLoaded, onChange, onAddressSelect])

  const handleClear = useCallback(() => {
    onChange("")
    onAddressSelect({
      address: "",
      city: null,
      country: null,
      latitude: null,
      longitude: null,
      placeId: null,
    })
    inputRef.current?.focus()
  }, [onChange, onAddressSelect])

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isLoading ? "Loading..." : placeholder}
          disabled={disabled || isLoading}
          required={required}
          className={cn(
            "pl-10 pr-10",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
        />
        {isLoading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        ) : value ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
      {!isGoogleLoaded && !isLoading && (
        <p className="text-xs text-amber-600 mt-1">
          Address autocomplete unavailable. You can still type manually.
        </p>
      )}
    </div>
  )
}

