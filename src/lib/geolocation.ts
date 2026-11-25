// ═══════════════════════════════════════════════════════════════════
// GEOLOCATION & MAPS ROUTING INTELLIGENCE
// ═══════════════════════════════════════════════════════════════════

import type { Coordinates, GeolocationErrorReason } from '@/types'

export type Coords = Coordinates

export class GeolocationError extends Error {
  readonly reason: GeolocationErrorReason

  constructor(reason: GeolocationErrorReason, message: string) {
    super(message)
    this.name = 'GeolocationError'
    this.reason = reason
  }
}

/**
 * Request live device GPS coordinates via navigator.geolocation.
 * Rejects with typed GeolocationError on unsupported, denied, timeout, or unavailable.
 */
export function getUserCoordinates(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      reject(
        new GeolocationError(
          'unsupported',
          'Geolocation is not supported by your browser. Choose a market hub or enter a ZIP code.'
        )
      )
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (err) => {
        if (err.code === 1) {
          reject(
            new GeolocationError(
              'denied',
              'Location permission was denied. Enable location access in browser settings or pick a market hub.'
            )
          )
        } else if (err.code === 3) {
          reject(
            new GeolocationError(
              'timeout',
              'GPS request timed out. Check your signal and try again, or select a market hub.'
            )
          )
        } else {
          reject(
            new GeolocationError(
              'unavailable',
              'Unable to determine your GPS position. Showing regional benchmark instead.'
            )
          )
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  })
}

/**
 * Detect Apple environment (iOS, iPadOS, macOS Safari)
 */
export function isAppleDevice(): boolean {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent.toLowerCase()
  return (
    ua.includes('iphone') ||
    ua.includes('ipad') ||
    ua.includes('ipod') ||
    (ua.includes('macintosh') && 'ontouchend' in document) ||
    (ua.includes('mac') && !ua.includes('windows'))
  )
}

/**
 * Great-circle distance between two coordinates in statute miles.
 */
export function getDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8 // Earth radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

/**
 * Estimate walking duration in minutes at standard brisk pace (3.1 mph).
 */
export function estimateWalkTime(distanceMiles: number): number {
  const minutes = (distanceMiles / 3.1) * 60
  return Math.max(1, Math.round(minutes))
}

/**
 * Native Apple Maps URI scheme.
 */
export function getAppleMapsUrl(
  query: string,
  userLat?: number,
  userLng?: number,
  mode: 'walking' | 'driving' = 'walking'
): string {
  const q = encodeURIComponent(query)
  const dirflg = mode === 'walking' ? 'w' : 'd'
  if (userLat && userLng) {
    return `https://maps.apple.com/?saddr=${userLat},${userLng}&daddr=${q}&dirflg=${dirflg}`
  }
  return `https://maps.apple.com/?q=${q}&dirflg=${dirflg}`
}

/**
 * Google Maps Universal directions URL.
 */
export function getGoogleMapsUrl(
  destination: string,
  userLat?: number,
  userLng?: number,
  mode: 'walking' | 'driving' = 'walking'
): string {
  const dest = encodeURIComponent(destination)
  const travelmode = mode === 'walking' ? 'walking' : 'driving'
  if (userLat && userLng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${dest}&travelmode=${travelmode}`
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=${travelmode}`
}
