"use client"

import { Check, ChevronDown} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAppContext } from "@/context/AppContext"
import { CURRENCIES, CurrencyCode } from "@/config/currency"
import ReactCountryFlag from "react-country-flag"
import { FaDollarSign, FaEuroSign, FaPoundSign, FaBitcoin, FaEthereum } from 'react-icons/fa'
// ✅ Mapping des codes pays
const COUNTRY_CODES: Record<string, string> = {
  USD: "US",
  EUR: "EU", 
  GBP: "GB",
}


type CurrencyIconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>
const CURRENCY_ICONS: Record<CurrencyCode, CurrencyIconComponent> = {
  USD: FaDollarSign,
  EUR: FaEuroSign,
  GBP: FaPoundSign,
  BTC: FaBitcoin,
  ETH: FaEthereum, // Plus précis pour Ethereum
}

const renderCurrencyIcon = (currencyCode: CurrencyCode, size: number = 4) => {
  const IconComponent = CURRENCY_ICONS[currencyCode]
  return IconComponent ? <IconComponent className={`h-${size} w-${size}`} /> : null
}

// ✅ Fonction helper pour rendre le drapeau
const renderFlag = (currencyCode: CurrencyCode) => {
  const countryCode = COUNTRY_CODES[currencyCode]
  return countryCode ? (
    <ReactCountryFlag 
      countryCode={countryCode} 
      svg 
      style={{ width: '100%', height: '100%' }}
      className="object-cover"
    />
  ) : null
}

export function CurrencySelectorButton() {
  const { currency, setCurrency } = useAppContext()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center px-3 text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <span className="flex items-center">
                  {renderCurrencyIcon(currency.code)}
                </span>
                <ChevronDown className="h-4 w-4 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" className="w-48">
              {Object.values(CURRENCIES).map((c) => (
                <DropdownMenuItem
                  key={c.code}
                  onClick={() => setCurrency(c.code as CurrencyCode)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-muted overflow-hidden">
                    {c.isCrypto ? renderCurrencyIcon(c.code, 6) : renderFlag(c.code)}
                  </span>
                  <span className="flex flex-col">
                    <span className="font-medium">{c.code}</span>
                    <span className="text-xs text-muted-foreground">{c.name}</span>
                  </span>
                  {currency.code === c.code && ( <Check className="ml-auto h-4 w-4 text-primary" /> )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-sm">
          Changer la devise ({currency.code})
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
