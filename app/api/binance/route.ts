// app/api/binance/route.ts
import { NextRequest, NextResponse } from "next/server"
import axios, { AxiosResponse } from "axios"
import crypto from "crypto"

// Types for Binance balances
interface BinanceBalance {
  asset: string
  free: string
  locked: string
}

interface BinanceAccountResponse {
  makerCommission: number
  takerCommission: number
  buyerCommission: number
  sellerCommission: number
  canTrade: boolean
  canWithdraw: boolean
  canDeposit: boolean
  updateTime: number
  accountType: string
  balances: BinanceBalance[]
  permissions: string[]
}

export async function POST(req: NextRequest) {
  try {
    // Read body from frontend
    const body = (await req.json()) as { apiKey: string; secret: string }
    const { apiKey, secret } = body

    if (!apiKey || !secret) {
      return NextResponse.json(
        { ok: false, error: "API key and secret are required" },
        { status: 400 }
      )
    }

    // Create Binance signature
    const timestamp = Date.now()
    const queryString = `timestamp=${timestamp}`
    const signature = crypto
      .createHmac("sha256", secret)
      .update(queryString)
      .digest("hex")

    const url = `https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`

    // Call Binance API
    const res: AxiosResponse<BinanceAccountResponse> = await axios.get(url, {
      headers: {
        "X-MBX-APIKEY": apiKey,
      },
    })

    // Filter non-empty balances
    const balances = res.data.balances.filter(
      (b) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0
    )

    return NextResponse.json({
      ok: true,
      balances,
    })
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return NextResponse.json(
        { ok: false, error: err.response?.data || err.message },
        { status: err.response?.status || 500 }
      )
    }

    return NextResponse.json(
      { ok: false, error: "Unexpected error" },
      { status: 500 }
    )
  }
}
