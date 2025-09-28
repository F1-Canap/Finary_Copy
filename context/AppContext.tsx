"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type AppContextType = {
  showAmounts: boolean
  toggleShowAmounts: () => void
  // 👉 tu peux ajouter d’autres variables ici
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [showAmounts, setShowAmounts] = useState(true)

  const toggleShowAmounts = () => setShowAmounts((prev) => !prev)

  return (
    <AppContext.Provider value={{ showAmounts, toggleShowAmounts }}>
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
