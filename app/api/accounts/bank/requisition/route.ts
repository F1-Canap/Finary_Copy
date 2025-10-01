import { BankRequisitionService } from "@/services"
import { type NextRequest, NextResponse } from "next/server"

// GET - List all requisitions or filter by userId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const page = searchParams.get("page")
    const limit = searchParams.get("limit")
    const sortBy = searchParams.get("sortBy")
    const sortOrder = searchParams.get("sortOrder") as "asc" | "desc" | undefined

    if (userId) {
      const result = await BankRequisitionService.findByUserId(userId)
      return NextResponse.json(result)
    }

    const result = await BankRequisitionService.findAll({
      page: page ? Number.parseInt(page) : undefined,
      limit: limit ? Number.parseInt(limit) : undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ success: false, error: `Error fetching requisitions: ${error}` }, { status: 500 })
  }
}

// POST - Create a new requisition
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { requisitionID, userId } = body

    if (!requisitionID || !userId) {
      return NextResponse.json({ success: false, error: "requisitionID and userId are required" }, { status: 400 })
    }

    const result = await BankRequisitionService.create({ requisitionID, userId })

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: `Error creating requisition: ${error}` }, { status: 500 })
  }
}
