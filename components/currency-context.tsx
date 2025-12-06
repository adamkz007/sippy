"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { formatCurrency as formatCurrencyUtil, CurrencyCode, SUPPORTED_CURRENCIES, getCurrencyInfo } from '@/lib/utils'

interface CurrencyContextType {
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
  formatCurrency: (amount: number) => string
  currencySymbol: string
  currencyName: string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

interface CurrencyProviderProps {
  children: ReactNode
  defaultCurrency?: CurrencyCode
}

export function CurrencyProvider({ children, defaultCurrency = 'MYR' }: CurrencyProviderProps) {
  const [currency, setCurrency] = useState<CurrencyCode>(defaultCurrency)

  const formatCurrency = useCallback((amount: number) => {
    return formatCurrencyUtil(amount, currency)
  }, [currency])

  const currencyInfo = getCurrencyInfo(currency)

  return (
    <CurrencyContext.Provider 
      value={{
        currency,
        setCurrency,
        formatCurrency,
        currencySymbol: currencyInfo.symbol,
        currencyName: currencyInfo.name,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}

// Export for use in settings
export { SUPPORTED_CURRENCIES }
export type { CurrencyCode }

