// hooks/useExchangeRatesHost.ts
import { useState, useEffect } from "react"
import { CurrencyCode } from "@/config/currency"

type Rates = Record<CurrencyCode, number>

export function useExchangeRatesHost(base: CurrencyCode = "EUR") {
  const [rates, setRates] = useState<Rates | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const url = `https://api.exchangerate.host/latest?base=${base}`
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        setRates(data.rates as Rates)
      })
      .catch((err) => {
        console.error("ExchangeRate-host error:", err)
        setError(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [base])

  return { rates, loading, error }
}
