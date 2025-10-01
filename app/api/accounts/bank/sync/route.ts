import { type NextRequest, NextResponse } from "next/server"
import { gocardless } from "@/lib/gocardless"
import { BankAccountService } from "@/services"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { requisitionId, userId } = body

    if (!requisitionId || !userId) {
      return NextResponse.json({ error: "requisitionId et userId requis" }, { status: 400 })
    }

    console.log(`[v0] Syncing accounts for requisition ${requisitionId}`)

    // Fetch accounts from GoCardless
    const accountsSummary = await gocardless.getAccountsSummary(requisitionId)

    console.log(`[v0] Found ${accountsSummary.length} accounts from GoCardless`)

    // Save each account to MongoDB
    const savedAccounts = []
    for (const account of accountsSummary) {
      if (!account) continue

      const accountData = {
        requisitionId,
        userId,
        name: account.name,
        type: account.type,
        iban: account.iban,
        currency: account.currency,
        balance: account.balance,
        status: account.status || "ready",
        lastUpdated: account.lastUpdated,
      }

      const result = await BankAccountService.create(accountData)

      if (result.success) {
        console.log(`[v0] Account saved: ${account.name}`)
        savedAccounts.push(result.data)
      } else {
        console.error(`[v0] Error saving account ${account.name}:`, result.error)
      }
    }
    if(savedAccounts.length < 1){
        return NextResponse.json({success: false})
    }
    return NextResponse.json({
      success: true,
      accounts: savedAccounts.map((acc) => ({
        id: acc?._id,
        name: acc?.name,
        type: acc?.type,
        iban: acc?.iban,
        currency: acc?.currency,
        balance: acc?.balance,
        status: acc?.status,
        lastUpdated: acc?.lastUpdated,
      })),
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Erreur sync comptes:", error)
    return NextResponse.json({ error: "Erreur lors de la synchronisation des comptes" }, { status: 500 })
  }
}
