import { Connection, PublicKey } from "@solana/web3.js"
import axios, { AxiosError } from "axios"
import { Results } from "./types"

const RPC_URL = "https://api.mainnet-beta.solana.com"
const MORALIS_API_KEY = process.env.MORALIS_API_KEY as string

// Types for Moralis API response
interface MoralisBalanceResponse {
  lamports: number
}

// Types for Solana Web3.js stake account response
interface StakeAccountInfo {
  info?: {
    stake?: {
      delegation?: {
        stake?: number
      }
    }
  }
}

interface ParsedStakeAccount {
  account: {
    data: {
      parsed: StakeAccountInfo
    }
  }
  pubkey: PublicKey
}

// Result type for internal functions
interface BalanceResult {
  success: boolean
  value?: number
  error?: string
}

async function getNativeBalance(address: string): Promise<BalanceResult> {
  try {
    const response = await axios.get<MoralisBalanceResponse>(
      `https://solana-gateway.moralis.io/account/mainnet/${address}/balance`,
      { 
        headers: { "X-API-Key": MORALIS_API_KEY },
        timeout: 15000
      }
    )

    const lamports = response.data.lamports
    const solBalance = lamports / 1e9 // Convert lamports → SOL
    console.log(`Native SOL Balance: ${solBalance} SOL`)
    
    return { success: true, value: solBalance }
  } catch (error: unknown) {
    const err = error as AxiosError
    const errorMessage = (err.response?.data as Error)?.message || err.message || "Failed to fetch native balance"
    console.error("❌ Error fetching SOL balance:", errorMessage)
    return { success: false, error: errorMessage }
  }
}

async function getStakedSOL(walletAddress: string): Promise<BalanceResult> {
  try {
    const connection = new Connection(RPC_URL, "confirmed")
    const publicKey = new PublicKey(walletAddress)

    // Use memcmp filter with proper encoding
    const stakeAccounts = await connection.getParsedProgramAccounts(
      new PublicKey("Stake11111111111111111111111111111111111111"),
      {
        filters: [
          {
            memcmp: {
              offset: 12, // stake authority offset
              bytes: publicKey.toBase58()
            }
          }
        ]
      }
    ) as ParsedStakeAccount[]

    if (stakeAccounts.length === 0) {
      console.log("⚠️ No stake accounts found for this wallet.")
      return { success: true, value: 0 }
    }

    let totalSOL = 0
    stakeAccounts.forEach((acc, idx) => {
      const parsed = acc.account.data.parsed
      const stake = parsed?.info?.stake?.delegation?.stake || 0
      totalSOL += stake / 1e9

      // Log each delegate stake account
      console.log(
        `#${idx + 1}: Stake Account ${acc.pubkey.toBase58()} | Delegated: ${(stake / 1e9).toFixed(4)} SOL`
      )
    })

    console.log(`Total Staked SOL: ${totalSOL} SOL`)
    return { success: true, value: totalSOL }
  } catch (error: unknown) {
    const err = error as Error
    const errorMessage = err.message || "Failed to fetch staked SOL"
    console.error("❌ Error fetching staked SOL:", errorMessage)
    return { success: false, error: errorMessage }
  }
}

export async function getBalances(address: string): Promise<Results> {
  try {
    console.log(`Checking Solana balances for ${address}`)
    
    const nativeResult = await getNativeBalance(address)
    const stakingResult = await getStakedSOL(address)

    // Check if any operation failed
    if (!nativeResult.success) {
      return {
        status_ok: false,
        chain: "solana",
        address,
        error: `Native balance error: ${nativeResult.error}`
      }
    }

    if (!stakingResult.success) {
      return {
        status_ok: false,
        chain: "solana",
        address,
        error: `Staking balance error: ${stakingResult.error}`
      }
    }

    const nativeBalance = nativeResult.value || 0
    const stakingBalance = stakingResult.value || 0
    const totalBalance = nativeBalance + stakingBalance

    console.log(`\n💰 Total SOL Balance (native + staking): ${totalBalance.toFixed(6)} SOL`)

    return {
      status_ok: true,
      chain: "solana",
      address,
      balances: {
        sol: totalBalance,
        native: nativeBalance,
        staked: stakingBalance
      }
    }
  } catch (error: unknown) {
    const err = error as AxiosError
    const errorMessage = err.response?.data || err.message || "Unknown error occurred"
    console.error("❌ Error fetching Solana balances:", errorMessage)

    return {
      status_ok: false,
      chain: "solana", 
      address,
      error: errorMessage
    }
  }
}