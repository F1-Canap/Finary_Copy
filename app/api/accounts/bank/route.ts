import { type NextRequest, NextResponse } from "next/server"
import { gocardless } from "@/lib/gocardless"
import { SUPPORTED_BANKS } from "@/config/banks"
import { BankRequisitionService } from "@/services"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bankId, userId } = body

    const userIdToUse = userId || "demo-user"

    const selectedBank = Object.values(SUPPORTED_BANKS).find((bank) => bank.id === bankId)

    if (!selectedBank) {
      return NextResponse.json({ error: "Banque non supportée" }, { status: 400 })
    }

    console.log(`🏦 Initialisation connexion ${selectedBank.name}`)

    // Authentification GoCardless
    await gocardless.authenticate()

    // Création de l'accord utilisateur
    const agreement = await gocardless.createAgreement(bankId)
    console.log("✅ Accord créé:", agreement.id)

    // Création de la réquisition
    const requisition = await gocardless.createRequisition(bankId, agreement.id)
    console.log("✅ Réquisition créée:", requisition.id)

    const saveResult = await BankRequisitionService.create({
      requisitionID: requisition.id,
      userId: userIdToUse,
    })

    if (!saveResult.success) {
      console.error("❌ Erreur sauvegarde réquisition:", saveResult.error)
    } else {
      console.log("✅ Réquisition sauvegardée en base:", saveResult.data?._id)
    }

    return NextResponse.json({
      success: true,
      link: requisition.link,
      requisitionId: requisition.id,
    })
  } catch (error) {
    console.error("❌ Erreur connexion banque:", error)
    return NextResponse.json({ error: "Erreur lors de la connexion à votre banque" }, { status: 500 })
  }
}
