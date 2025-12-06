import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Supported currencies for the platform
export const SUPPORTED_CURRENCIES = [
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', locale: 'ms-MY' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$', locale: 'en-AU' },
  { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', locale: 'en-SG' },
  { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB' },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', locale: 'th-TH' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', locale: 'id-ID' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', locale: 'fil-PH' },
] as const

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]['code']

export function getCurrencyInfo(code: CurrencyCode) {
  return SUPPORTED_CURRENCIES.find(c => c.code === code) || SUPPORTED_CURRENCIES[0]
}

export function formatCurrency(amount: number, currency: CurrencyCode = 'MYR'): string {
  const currencyInfo = getCurrencyInfo(currency)
  return new Intl.NumberFormat(currencyInfo.locale, {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatPoints(points: number): string {
  return new Intl.NumberFormat('en-AU').format(points)
}

export function generateOrderNumber(prefix: string = 'A'): string {
  const num = Math.floor(Math.random() * 999) + 1
  return `${prefix}-${num.toString().padStart(3, '0')}`
}

export function generateVoucherCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function calculateLoyaltyTier(lifetimePoints: number): 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' {
  if (lifetimePoints >= 15000) return 'PLATINUM'
  if (lifetimePoints >= 5000) return 'GOLD'
  if (lifetimePoints >= 1000) return 'SILVER'
  return 'BRONZE'
}

export function getTierColor(tier: string): string {
  switch (tier) {
    case 'PLATINUM': return 'text-violet-600 bg-violet-100'
    case 'GOLD': return 'text-amber-600 bg-amber-100'
    case 'SILVER': return 'text-slate-600 bg-slate-100'
    default: return 'text-orange-700 bg-orange-100'
  }
}

export function getOrderStatusColor(status: string): string {
  switch (status) {
    case 'COMPLETED': return 'bg-green-100 text-green-800'
    case 'READY': return 'bg-blue-100 text-blue-800'
    case 'PREPARING': return 'bg-yellow-100 text-yellow-800'
    case 'PENDING': return 'bg-gray-100 text-gray-800'
    case 'CANCELLED': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

