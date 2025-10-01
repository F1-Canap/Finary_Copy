export const SUPPORTED_BANKS = {
  BOURSORAMA: {
    id: "BOURSORAMA_BOUSFRPP",
    name: "Boursorama Banque",
    country: "FR",
    logo: "🏦",
  },
  BNP: {
    id: "BNP_PARIBAS_BNPAFRPPXXX",
    name: "BNP Paribas",
    country: "FR",
    logo: "🏦",
  },
  SANDBOX: {
    id: "SANDBOXFINANCE_SFIN0000",
    name: "Sandbox Finance",
    country: "FR",
    logo: "🧪",
  },
} as const

export type BankId = (typeof SUPPORTED_BANKS)[keyof typeof SUPPORTED_BANKS]["id"]
