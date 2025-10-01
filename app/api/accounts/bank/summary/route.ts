import { NextRequest, NextResponse } from "next/server"
import { BankAccountService } from "@/services"


export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") // "123" ou null si absent

    if (!userId) {
      return NextResponse.json({ error: "userId manquant" }, { status: 400 })
    }

    const accountsResult = await BankAccountService.findByUserId(userId)

    if (!accountsResult.success || !accountsResult.data) {
      return NextResponse.json({ error: "Aucune liaison bancaire active" }, { status: 401 })
    }

    const accounts = accountsResult.data

    return NextResponse.json({
      success: true,
      accounts: accounts.map((acc) => ({
        id: acc._id,
        requisitionId: acc.requisitionId,
        name: acc.name,
        type: acc.type,
        iban: acc.iban,
        currency: acc.currency,
        balance: acc.balance,
        status: acc.status,
        lastUpdated: acc.lastUpdated,
      })),
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Erreur résumé comptes:", error)
    return NextResponse.json({ error: "Erreur lors du chargement des données" }, { status: 500 })
  }
}

