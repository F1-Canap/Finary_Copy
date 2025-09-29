"use client"

import { useState, FormEvent, ChangeEvent } from "react"

type Mode = "wallet" | "binance" | null

interface WalletResponse {
  ok: boolean
  chain: string
  address: string
  balances?: unknown
}

interface BinanceResponse {
  ok: boolean
  balances?: {
    asset: string
    free: string
    locked: string
  }[]
}

// Map chain codes → display names
const chainOptions: { value: string; label: string }[] = [
  // Non-EVM chains
  { value: "bitcoin", label: "Bitcoin" },
  { value: "cardano", label: "Cardano" },
  { value: "solana", label: "Solana" },
  { value: "xrp", label: "XRP" },

  // EVM chains
  { value: "eth", label: "Ethereum" },
  { value: "sepolia", label: "Ethereum Sepolia" },
  { value: "holesky", label: "Ethereum Holesky" },
  { value: "polygon", label: "Polygon" },
  { value: "amoy", label: "Polygon Amoy" },
  { value: "bsc", label: "BNB Smart Chain" },
  { value: "bsc-testnet", label: "BNB Smart Chain Testnet" },
  { value: "arbitrum", label: "Arbitrum" },
  { value: "base", label: "Base" },
  { value: "base-sepolia", label: "Base Sepolia" },
  { value: "optimism", label: "Optimism" },
  { value: "linea", label: "Linea" },
  { value: "linea-sepolia", label: "Linea Sepolia" },
  { value: "ava", label: "Avalanche" },
  { value: "ftm", label: "Fantom" },
  { value: "cro", label: "Cronos" },
  { value: "gnosis", label: "Gnosis" },
  { value: "gnosis-chiado", label: "Gnosis Chiado" },
  { value: "chiliz", label: "Chiliz" },
  { value: "chiliz-testnet", label: "Chiliz Testnet" },
  { value: "moonbeam", label: "Moonbeam" },
  { value: "moonriver", label: "Moonriver" },
  { value: "moonbase", label: "Moonbase Alpha" },
  { value: "flow", label: "Flow" },
  { value: "flow-testnet", label: "Flow Testnet" },
  { value: "ronin", label: "Ronin" },
  { value: "ronin-saigon", label: "Ronin Saigon Testnet" },
  { value: "lisk", label: "Lisk" },
  { value: "lisk-sepolia", label: "Lisk Sepolia" },
  { value: "pulsechain", label: "PulseChain" },
]

export default function ConnectWalletPage() {
  const [mode, setMode] = useState<Mode>(null)

  // Wallet form state
  const [chain, setChain] = useState("")
  const [address, setAddress] = useState("")

  // Binance form state
  const [apiKey, setApiKey] = useState("")
  const [secret, setSecret] = useState("")

  const [result, setResult] = useState<WalletResponse | BinanceResponse | null>(
    null
  )

  async function handleWalletSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      const res = await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chain, address }),
      })
      const data: WalletResponse = await res.json()
      setResult(data)
    } catch (err) {
      console.error("❌ Wallet error:", err)
    }
  }

  async function handleBinanceSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      const res = await fetch("/api/binance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, secret }),
      })
      const data: BinanceResponse = await res.json()
      setResult(data)
    } catch (err) {
      console.error("❌ Binance error:", err)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">🔗 Connect Wallet</h1>

      {/* Mode selector */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setMode("wallet")}
          className="px-4 py-2 rounded bg-blue-500 text-white"
        >
          Wallet
        </button>
        <button
          onClick={() => setMode("binance")}
          className="px-4 py-2 rounded bg-green-500 text-white"
        >
          Binance
        </button>
      </div>

      {/* Wallet form */}
      {mode === "wallet" && (
        <form onSubmit={handleWalletSubmit} className="space-y-4">
          <select
            value={chain}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setChain(e.target.value)
            }
            className="border p-2 w-full"
            required
          >
            <option value="" disabled>
              Select a chain...
            </option>
            {chainOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Wallet address"
            value={address}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setAddress(e.target.value)
            }
            className="border p-2 w-full"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Connect Wallet
          </button>
        </form>
      )}

      {/* Binance form */}
      {mode === "binance" && (
        <form onSubmit={handleBinanceSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="API Key"
            value={apiKey}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setApiKey(e.target.value)
            }
            className="border p-2 w-full"
            required
          />
          <input
            type="password"
            placeholder="API Secret"
            value={secret}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSecret(e.target.value)
            }
            className="border p-2 w-full"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 rounded bg-green-600 text-white"
          >
            Connect Binance
          </button>
        </form>
      )}

      {/* Result */}
      {result && (
        <pre className="mt-6 bg-gray-100 p-4 rounded text-sm text-black">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}