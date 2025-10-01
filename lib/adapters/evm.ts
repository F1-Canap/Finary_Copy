// /chains/evm.ts
import axios, { AxiosError } from "axios"
import "dotenv/config"
import { Results, ChainAdapter } from "@/types/adapters";

const MORALIS_API_KEY = process.env.MORALIS_API_KEY as string
const BASE = "https://deep-index.moralis.io/api/v2.2"

if (!MORALIS_API_KEY) {
  console.warn("⚠️ MORALIS_API_KEY not set — Moralis calls will fail.")
}

// Types for Moralis token balance responses
interface MoralisToken {
  token_address?: string
  contract_address?: string
  address?: string
  name?: string
  token_name?: string
  symbol?: string
  token_symbol?: string
  decimals?: number | string
  token_decimals?: number | string
  contract_decimals?: number | string
  balance?: string
  token_balance?: string
  amount?: string
  raw_balance?: string
  usd_price?: number
  price?: number
  quote?: { price?: number }
  [key: string]: unknown
}

type MoralisResponse = MoralisToken[] | { result: MoralisToken[] }

// Helper for Moralis GET requests
async function moralisGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = `${BASE}${path}`
  const res = await axios.get<T>(url, {
    params,
    headers: { "X-API-Key": MORALIS_API_KEY },
    timeout: 15000,
  })
  return res.data
}

/**
 * getAllBalances(chain, address)
 * - Tries /wallets/{address}/tokens first
 * - Falls back to /{address}/erc20
 * - Normalizes Moralis response into Results.balances
 */
async function getAllBalances(chain: string, address: string): Promise<Results> {
  try {
    let items: MoralisToken[] = []

    // Try the richer wallets endpoint first
    try {
      const data = await moralisGet<MoralisResponse>(`/wallets/${address}/tokens`, { chain })
      if (Array.isArray(data)) items = data
      else if (Array.isArray(data.result)) items = data.result
    } catch {
      items = []
    }

    // Fallback to erc20 endpoint
    if (items.length === 0) {
      const data = await moralisGet<MoralisToken[]>(`/${address}/erc20`, { chain })
      items = Array.isArray(data) ? data : []
    }

    // Normalize to consistent shape
    const normalized = items.map((t): { token: string; amount: number } => {
      const decimalsRaw =
        t.decimals ?? t.token_decimals ?? t.contract_decimals ?? 0
      const decimals = Number(decimalsRaw) || 0

      const raw =
        t.balance ?? t.token_balance ?? t.amount ?? t.raw_balance ?? "0"
      const rawNum = Number(raw)
      const balance = decimals > 0 ? rawNum / 10 ** decimals : rawNum

      return {
        token: t.symbol ?? t.name ?? t.token_address ?? "unknown",
        amount: balance,
      }
    })

    // Logs like solana.ts
    console.log(`\n🔗 Checking EVM balances on ${chain} for ${address}`)
    console.log(`📦 Found ${normalized.length} token(s):`)
    normalized.forEach((t) =>
      console.log(` - ${t.token}: ${t.amount.toFixed(6)}`)
    )

    return {
      status_ok: true,
      chain,
      address,
      balances: normalized,
    }
  } catch (error: unknown) {
    const err = error as AxiosError
    const errorMessage = err.response?.data || err.message || "Unknown error"

    console.error("❌ Error fetching token balances:", errorMessage)

    return {
      status_ok: false,
      chain,
      address,
      error: errorMessage,
    }
  }
}

/**
 * Factory to create an adapter bound to a specific chain name.
 */
export function create(chain: string): ChainAdapter {
  return {
    getBalances: async (address: string) => await getAllBalances(chain, address),
  }
}