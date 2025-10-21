"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/context/AppContext"

const COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price"

type CacheEntry = {
  timestamp: number
  rates: Record<string, Record<string, number>>
}

const CACHE_KEY = "cryptoRates"
const CACHE_TTL = 2 * 60 * 1000 // 2 minutes

// ✅ mapping des tickers → IDs CoinGecko
const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  ADA: "cardano",
  SOL: "solana",
  DOT: "polkadot",
  AVAX: "avalanche-2",
  DOGE: "dogecoin",
  XRP: "ripple",
  MATIC: "matic-network",
  BNB: "binancecoin",
  LTC: "litecoin",
  // ➕ ajoute d'autres tokens si besoin
}

export function useCryptoCurrencyFormatter() {
  const { currency, showAmounts } = useAppContext()
  const [rates, setRates] = useState<Record<string, Record<string, number>> | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchRates() {
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
        const ids = Object.values(COINGECKO_IDS).join(",")
        const vs = ["usd", "eur", "gbp"].join(",")

        const res = await fetch(`${COINGECKO_URL}?ids=${ids}&vs_currencies=${vs}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        const newCache: CacheEntry = { timestamp: Date.now(), rates: data }
        localStorage.setItem(CACHE_KEY, JSON.stringify(newCache))
        setRates(data)
      } catch (err) {
        console.error("❌ Erreur fetch CoinGecko:", err)
        setRates(null)
      } finally {
        setLoading(false)
      }
    }

    fetchRates()
    const timer = setInterval(fetchRates, CACHE_TTL)
    return () => clearInterval(timer)
  }, [])

  /**
   * Convertit un montant en crypto (ticker) vers la devise du contexte
   * @param amount Montant en crypto
   * @param ticker Symbole de la crypto (ex: "BTC", "ETH", "SOL")
   */
  const formatCryptoCurrency = (
    amount: number,
    ticker: string,
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
      maximumFractionDigits,
    } = options

    if (hideIfNotShown && !showAmounts) return placeholder
    if (loading || !rates) return "loading..."

    const tokenId = COINGECKO_IDS[ticker.toUpperCase()]
    if (!tokenId) {
      console.warn(`Ticker non reconnu : ${ticker}`)
      return "N/A"
    }

    const targetCode = currency.code.toLowerCase()
    const tokenData = rates[tokenId]

    if (!tokenData || !tokenData[targetCode]) {
      console.warn(`Taux manquant pour ${ticker} → ${targetCode}`)
      return "N/A"
    }

    const converted = amount * tokenData[targetCode]

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
      return `${currency.symbol}${converted.toFixed(currency.decimals)}`
    }
  }

  return { formatCryptoCurrency, loading }
}
