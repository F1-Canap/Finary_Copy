// components/CurrencyDisplay.tsx
"use client"

import { useCryptoCurrencyFormatter } from "@/hooks/useCryptoCurrencyFormatter"

interface CryptoCurrencyDisplayProps {
  amount: number
  fromCurrency: string
  hideIfNotShown?: boolean
  placeholder?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  className?: string
}

export function CryptoCurrencyDisplay({
  amount,
  fromCurrency,
  hideIfNotShown = true,
  placeholder = "••••",
  minimumFractionDigits,
  maximumFractionDigits,
  className
}: CryptoCurrencyDisplayProps) {
const { formatCryptoCurrency } = useCryptoCurrencyFormatter()

  const formattedValue = formatCryptoCurrency(amount, fromCurrency, {
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
