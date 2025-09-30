import { NextResponse } from "next/server"
import { BinanceService } from "@/services/binance/binance.service"

// 📌 Créer un compte Binance
export async function POST(req: Request) {
  try {
    const { apiKey, secretKey, userId } = await req.json()

    if (!apiKey || !secretKey || !userId) {
      return NextResponse.json(
        { success: false, error: "Champs manquants (apiKey, secretKey, userId)" },
        { status: 400 }
      )
    }

    // Appel au service → création + récupération balances
    const result = await BinanceService.create({
      api_key: apiKey,
      secret_key: secretKey,
      userId,
    })

    if (!result.success || !result.data) {
      return NextResponse.json(
        { ok: false, error: result.error || "Account not found" },
        { status: 400 }
      );
    }

    // ⚠️ Ne jamais renvoyer les clés → juste uid + tokens
    return NextResponse.json({
      success: true,
      data: {
        uid: result.data.uid,
        tokens: result.data.tokens,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Erreur POST Binance: ${error}` },
      { status: 500 }
    )
  }
}

// 📌 Récupérer les comptes Binance par userId
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Paramètre userId manquant" },
        { status: 400 }
      )
    }

    const result = await BinanceService.findByUserId(userId)

    if (!result.success || !result.data) {
      return NextResponse.json(
        { ok: false, error: result.error || "Account not found" },
        { status: 400 }
      );
    }

    // ⚠️ Masquer api_key / secret_key
    const safeData = result.data.map((acc) => ({
      _id: acc._id,
      uid: acc.uid,
      tokens: acc.tokens,
      createdAt: acc.createdAt,
      updatedAt: acc.updatedAt,
    }))

    return NextResponse.json({ success: true, data: safeData })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Erreur GET Binance: ${error}` },
      { status: 500 }
    )
  }
}
