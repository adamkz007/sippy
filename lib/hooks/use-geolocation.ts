"use client"

import { useState, useEffect, useCallback } from "react"

export interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  loading: boolean
  error: string | null
  permissionState: PermissionState | null
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

const defaultOptions: UseGeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000, // 5 minutes cache
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: false,
    error: null,
    permissionState: null,
  })

  const opts = { ...defaultOptions, ...options }

  // Check permission state
  useEffect(() => {
    if (!navigator.permissions) return

    navigator.permissions.query({ name: "geolocation" }).then((result) => {
      setState((prev) => ({ ...prev, permissionState: result.state }))
      result.addEventListener("change", () => {
        setState((prev) => ({ ...prev, permissionState: result.state }))
      })
    })
  }, [])

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocation is not supported by your browser",
      }))
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          loading: false,
          error: null,
          permissionState: "granted",
        })
      },
      (error) => {
        let errorMessage = "Failed to get location"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable"
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out"
            break
        }
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          permissionState: error.code === error.PERMISSION_DENIED ? "denied" : prev.permissionState,
        }))
      },
      {
        enableHighAccuracy: opts.enableHighAccuracy,
        timeout: opts.timeout,
        maximumAge: opts.maximumAge,
      }
    )
  }, [opts.enableHighAccuracy, opts.timeout, opts.maximumAge])

  // Auto-request on mount if permission is granted
  useEffect(() => {
    if (state.permissionState === "granted" && !state.latitude && !state.loading) {
      requestLocation()
    }
  }, [state.permissionState, state.latitude, state.loading, requestLocation])

  return {
    ...state,
    requestLocation,
    isSupported: typeof navigator !== "undefined" && "geolocation" in navigator,
  }
}

