import * as bitcoin from "./bitcoin"
import * as cardano from "./cardano"
import * as solana from "./solana"
import * as evm from "./evm"
import * as xrp from "./xrp"

import { ChainAdapter } from "@/types/adapters";

// Map of non-EVM chain adapters
export const chains: Record<string, ChainAdapter> = {
  bitcoin,
  cardano,
  solana,
  xrp,
}

// Set of supported EVM chains
export const evmChains = new Set<string>([
  "eth",
  "sepolia",
  "holesky",
  "polygon",
  "amoy",
  "bsc",
  "bsc-testnet",
  "arbitrum",
  "base",
  "base-sepolia",
  "optimism",
  "linea",
  "linea-sepolia",
  "ava",
  "ftm",
  "cro",
  "gnosis",
  "gnosis-chiado",
  "chiliz",
  "chiliz-testnet",
  "moonbeam",
  "moonriver",
  "moonbase",
  "flow",
  "flow-testnet",
  "ronin",
  "ronin-saigon",
  "lisk",
  "lisk-sepolia",
  "pulsechain",
])

// Returns the adapter for a given chain
export function getChainAdapter(name: string): ChainAdapter | null {
  if (!name) return null
  const lc = name.toLowerCase()

  // Direct adapters (Bitcoin, Cardano, etc.)
  if (chains[lc]) return chains[lc]

  // Future: EVM adapter creation
  if (evmChains.has(lc)) {
    return evm.create(lc)
  }


  return null
}
