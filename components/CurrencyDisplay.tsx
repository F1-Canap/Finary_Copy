// components/CurrencyDisplay.tsx
"use client"

import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { CurrencyCode, CURRENCIES } from "@/config/currency"

interface CurrencyDisplayProps {
  amount: number
  fromCurrency: CurrencyCode
  hideIfNotShown?: boolean
  placeholder?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  className?: string
}

export function CurrencyDisplay({
  amount,
  fromCurrency,
  hideIfNotShown = true,
  placeholder = "••••",
  minimumFractionDigits,
  maximumFractionDigits,
  className
}: CurrencyDisplayProps) {
  const { formatCurrency } = useCurrencyFormatter()

  // On récupère l'objet complet Currency depuis la config
  const currencyObj = CURRENCIES[fromCurrency]

  const formattedValue = formatCurrency(amount, currencyObj, {
    hideIfNotShown,
    placeholder,
    minimumFractionDigits,
    maximumFractionDigits
  })

  return (
    <span className={className}>
      {formattedValue}
    </span>
  )
}
