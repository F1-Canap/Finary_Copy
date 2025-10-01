import axios, { AxiosError } from "axios"
import { Results } from "@/types/adapters";

const BLOCKFROST_API_KEY = process.env.BLOCKFROST_API_KEY as string
const BASE = "https://cardano-mainnet.blockfrost.io/api/v0"

// Types from Blockfrost API
interface Amount {
  unit: string
  quantity: string
}

interface Utxo {
  amount: Amount[]
}

export async function getBalances(address: string): Promise<Results> {

  try {
    const res = await axios.get<Utxo[]>(`${BASE}/addresses/${address}/utxos`, {
      headers: { project_id: BLOCKFROST_API_KEY },
      timeout: 15000,
    })

    let totalLovelace = 0n
    const tokenMap = new Map<string, bigint>()

    res.data.forEach((utxo) => {
      utxo.amount.forEach((amt) => {
        if (amt.unit === "lovelace") {
          totalLovelace += BigInt(amt.quantity)
        } else {
          const prev = tokenMap.get(amt.unit) || 0n
          tokenMap.set(amt.unit, prev + BigInt(amt.quantity))
        }
      })
    })

    const ada = Number(totalLovelace) / 1e6

    // Convert tokenMap to plain object
    const tokens: Record<string, number> = {}
    tokenMap.forEach((qty, unit) => {
      tokens[unit] = Number(qty) // raw quantities (no decimals applied)
    })

    return {
      status_ok: true,
      chain: "cardano",
      address,  
      balances: {
        ada,
        ...tokens,
      },
    }
  } catch (error: unknown) {
    const err = error as AxiosError
    console.error(
      "❌ Error fetching Cardano balances:",
      err.response?.data || err.message
    )
    return { 
        status_ok: false,
        chain: "cardano",
        address,
        error: err } // API route will wrap this with status_ok:false
  }
}
