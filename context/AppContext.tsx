"use client"

import { Currency, CURRENCIES, CurrencyCode } from "@/config/currency"
import { createContext, useContext, useState, ReactNode } from "react"

type AppContextType = {
  showAmounts: boolean
  toggleShowAmounts: () => void
  currency: Currency
  setCurrency: (c: CurrencyCode) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [showAmounts, setShowAmounts] = useState(true)
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>("EUR")

  const toggleShowAmounts = () => setShowAmounts((prev) => !prev)

  return (
    <AppContext.Provider
      value={{
        showAmounts,
        toggleShowAmounts,
        currency: CURRENCIES[currencyCode],
        setCurrency: setCurrencyCode,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
