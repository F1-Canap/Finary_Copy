import { BankRequisitionService } from "@/services"
import { type NextRequest, NextResponse } from "next/server"

// GET - Get requisition by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await BankRequisitionService.findById(params.id)

    if (!result.success) {
      return NextResponse.json(result, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ success: false, error: `Error fetching requisition: ${error}` }, { status: 500 })
  }
}

// PUT - Update requisition
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const result = await BankRequisitionService.update(params.id, body)

    if (!result.success) {
      return NextResponse.json(result, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ success: false, error: `Error updating requisition: ${error}` }, { status: 500 })
  }
}

// DELETE - Delete requisition
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await BankRequisitionService.delete(params.id)

    if (!result.success) {
      return NextResponse.json(result, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ success: false, error: `Error deleting requisition: ${error}` }, { status: 500 })
  }
}
