// hooks/useCurrencyFormatter.ts
import { useState, useEffect } from "react"
import { useAppContext } from "@/context/AppContext"
import { CurrencyCode } from "@/config/currency"

const COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price"

// Mapping de nos codes → ids Coingecko
const COINGECKO_IDS: Record<CurrencyCode, string | null> = {
  USD: null, // fiat, pas besoin
  EUR: null,
  GBP: null,
  BTC: "bitcoin",
  ETH: "ethereum",
}

// ---- Cache global en mémoire ----
type CacheEntry = {
  timestamp: number
  rates: Record<string, number>
}
const CACHE_KEY = "currencyRates"
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export function useCurrencyFormatter() {
  const { currency, showAmounts } = useAppContext()
  const [rates, setRates] = useState<Record<string, number> | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchRates() {
      // Vérifier le cache
      const cachedStr = localStorage.getItem(CACHE_KEY)
        if (cachedStr) {
        try {
            const cached: CacheEntry = JSON.parse(cachedStr)
            if (Date.now() - cached.timestamp < CACHE_TTL) {
            setRates(cached.rates)
            setLoading(false)
            return
            }
        } catch {
            localStorage.removeItem(CACHE_KEY)
        }
        }

      setLoading(true)
      try {
        const ids = Object.values(COINGECKO_IDS).filter(Boolean).join(",")
        const vs = ["usd", "eur", "gbp"].join(",")
        console.log("Fetching rates from Coingecko...")
        const res = await fetch(`${COINGECKO_URL}?ids=${ids}&vs_currencies=${vs}`)
        const data = await res.json()

        const eurRates: Record<string, number> = {
          EUR: 1,
          USD: 1 / (data["bitcoin"]?.usd / data["bitcoin"]?.eur),
          GBP: 1 / (data["bitcoin"]?.gbp / data["bitcoin"]?.eur),
        }

        for (const [code, id] of Object.entries(COINGECKO_IDS)) {
          if (id && data[id]) {
            eurRates[code] = data[id].eur
          }
        }

        // Sauvegarder dans le cache global
        localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), rates: eurRates })
        )

        setRates(eurRates)
      } catch (err) {
        console.error("Erreur fetch rates:", err)
        setRates(null)
      } finally {
        setLoading(false)
      }
    }

    fetchRates()

    // rafraîchissement forcé toutes les 5 minutes (au cas où)
    const timer = setInterval(fetchRates, CACHE_TTL)
    return () => clearInterval(timer)
  }, [])

  const formatCurrency = (
    amount: number,
    fromCurrency: { code: CurrencyCode; isCrypto: boolean; symbol: string },
    options: {
      hideIfNotShown?: boolean
      placeholder?: string
      minimumFractionDigits?: number
      maximumFractionDigits?: number
    } = {}
  ) => {
    const {
      hideIfNotShown = true,
      placeholder = "••••",
      minimumFractionDigits,
      maximumFractionDigits
    } = options

    if (hideIfNotShown && !showAmounts) return placeholder
    if (loading || !rates) return "..."

    const fromRate = rates[fromCurrency.code] ?? 1
    const toRate   = rates[currency.code]     ?? 1

    const converted = (amount / toRate) * fromRate

    const locale =
      currency.code === "EUR" ? "fr-FR"
      : currency.code === "USD" ? "en-US"
      : currency.code === "GBP" ? "en-GB"
      : "en-US"

    const formatOptions: Intl.NumberFormatOptions = {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: minimumFractionDigits ?? currency.decimals,
      maximumFractionDigits: maximumFractionDigits ?? currency.decimals,
    }

    try {
      return new Intl.NumberFormat(locale, formatOptions).format(converted)
    } catch {
      return `${currency.symbol}${converted.toFixed(currency.decimals)}` // fallback simple
    }
  }

  return { formatCurrency, loading }
}
