import { NextRequest, NextResponse } from "next/server"
import { gocardless } from "@/lib/gocardless"
import { BankRequisitionService } from "@/services"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId manquant" }, { status: 400 })
    }

    // Récupérer toutes les réquisitions de l'utilisateur
    const requisitionsResult = await BankRequisitionService.findByUserId(userId)
    if (!requisitionsResult.success || !requisitionsResult.data?.length) {
      return NextResponse.json({ error: "Aucune réquisition active" }, { status: 404 })
    }

    // Trier par date de création décroissante et prendre la plus récente
    const sorted = requisitionsResult.data.sort(
      (a, b) =>
        (b.createdAt ? new Date(b.createdAt).getTime() : 0) -
        (a.createdAt ? new Date(a.createdAt).getTime() : 0)
    )

    const latestRequisition = sorted[0]
    const requisitionId = latestRequisition.requisitionID

    // Récupérer le statut depuis GoCardless
    const statusResult = await gocardless.getRequisitionStatus(requisitionId)

    return NextResponse.json({
      success: true,
      status: statusResult?.status ?? "unknown",
      accounts: statusResult?.accounts ?? [],
      link: statusResult?.link ?? null,
      requisitionId,
      userId,
    })
  } catch (error) {
    console.error("❌ Erreur statut:", error)
    return NextResponse.json(
      { error: "Erreur lors de la vérification du statut" },
      { status: 500 }
    )
  }
}
