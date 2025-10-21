"use client"

import { Currency, CURRENCIES, CurrencyCode } from "@/config/currency"
import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { useSession } from "next-auth/react"
import { apiClient } from "@/lib/apiClient"
import { CryptoWallet, BinanceAccount, Watch, AccountsSummary } from "@/types/database"

type Wealth = {
  cryptoWallets: CryptoWallet[]
  binanceAccounts: BinanceAccount[]
  bankAccounts: AccountsSummary | null
  watches: Watch[]
  // ⚙️ extensible : ajoute ici d'autres modules (immobilier, actions, etc.)
}

type AppContextType = {
  showAmounts: boolean
  toggleShowAmounts: () => void
  currency: Currency
  setCurrency: (c: CurrencyCode) => void

  wealth: Wealth
  setWealth: (w: Partial<Wealth>) => void

  loading: boolean
  setLoading: (v: boolean) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [showAmounts, setShowAmounts] = useState(true)
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>("EUR")

  const [wealth, setWealthState] = useState<Wealth>({
    cryptoWallets: [],
    binanceAccounts: [],
    bankAccounts: null,
    watches: [],
  })

  const [loading, setLoading] = useState<boolean>(true)

  const toggleShowAmounts = () => setShowAmounts((prev) => !prev)
  const setWealth = (partial: Partial<Wealth>) =>
    setWealthState((prev) => ({ ...prev, ...partial }))

  // 🚀 Chargement automatique des données via apiClient
  useEffect(() => {
    const loadWealth = async () => {
      if (!session?.user?._id) {
        setLoading(false)
        return
      }

      setLoading(true)
      const userId = session.user._id as string

      try {
        const [crypto, binance, bankResponse, watches] = await Promise.all([
          apiClient.cryptoWallets.getByUserId(userId),
          apiClient.binanceAccounts.getByUserId(userId),
          fetch(`/api/accounts/bank/summary?userId=${userId}`),
          apiClient.watches.getByUserId(userId),
        ])

        // ✅ correction : parse du JSON de la requête fetch
        const bankData: AccountsSummary | null = bankResponse.ok
          ? await bankResponse.json()
          : null

        setWealth({
          cryptoWallets: crypto.data ?? [],
          binanceAccounts: binance.data ?? [],
          bankAccounts: bankData,
          watches: watches.data ?? [],
        })
      } catch (error) {
        console.error("❌ Erreur lors du chargement des comptes :", error)
      } finally {
        setLoading(false)
      }
    }

    loadWealth()
  }, [session])

  return (
    <AppContext.Provider
      value={{
        showAmounts,
        toggleShowAmounts,
        currency: CURRENCIES[currencyCode],
        setCurrency: setCurrencyCode,
        wealth,
        setWealth,
        loading,
        setLoading,
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
