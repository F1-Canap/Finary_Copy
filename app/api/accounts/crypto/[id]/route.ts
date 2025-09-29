
// 📁 app/api/accounts/crypto/[id]/route.ts
import { CryptoWalletService } from "@/services"
import { NextRequest, NextResponse } from "next/server"

interface Params {
  params: { id: string }
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const result = await CryptoWalletService.findById(params.id)
    return NextResponse.json(result, { status: result.success ? 200 : 404 })
  } catch (error) {
    return NextResponse.json({ success: false, error: `${error}` }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json()
    const result = await CryptoWalletService.update(params.id, body)
    return NextResponse.json(result, { status: result.success ? 200 : 404 })
  } catch (error) {
    return NextResponse.json({ success: false, error: `${error}` }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const result = await CryptoWalletService.delete(params.id)
    return NextResponse.json(result, { status: result.success ? 200 : 404 })
  } catch (error) {
    return NextResponse.json({ success: false, error: `${error}` }, { status: 500 })
  }
}
