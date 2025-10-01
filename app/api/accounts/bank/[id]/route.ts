import { BankAccountService } from "@/services"
import { type NextRequest, NextResponse } from "next/server"

// GET - Get account by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await BankAccountService.findById(params.id)

    if (!result.success) {
      return NextResponse.json(result, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ success: false, error: `Error fetching account: ${error}` }, { status: 500 })
  }
}

// PUT - Update account
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const result = await BankAccountService.update(params.id, body)

    if (!result.success) {
      return NextResponse.json(result, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ success: false, error: `Error updating account: ${error}` }, { status: 500 })
  }
}

// DELETE - Delete account
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await BankAccountService.delete(params.id)

    if (!result.success) {
      return NextResponse.json(result, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ success: false, error: `Error deleting account: ${error}` }, { status: 500 })
  }
}
