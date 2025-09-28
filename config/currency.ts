export type CurrencyCode = "USD" | "EUR" | "GBP" | "BTC" | "ETH"

export type Currency = {
  code: CurrencyCode
  name: string        // Nom complet
  symbol: string      // Symbole affiché
  decimals: number    // Nombre de décimales à afficher
  isCrypto: boolean   // true si c'est une crypto
}

// Exemple d'objet Currency pour chaque code
export const CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: { code: "USD", name: "US Dollar", symbol: "$", decimals: 2, isCrypto: false },
  EUR: { code: "EUR", name: "Euro", symbol: "€", decimals: 2, isCrypto: false },
  GBP: { code: "GBP", name: "British Pound", symbol: "£", decimals: 2, isCrypto: false },
  BTC: { code: "BTC", name: "Bitcoin", symbol: "₿", decimals: 8, isCrypto: true },
  ETH: { code: "ETH", name: "Ethereum", symbol: "Ξ", decimals: 8, isCrypto: true },
}
