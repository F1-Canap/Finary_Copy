
// 📁 app/api/accounts/crypto/[id]/route.ts
import { CryptoWalletService } from "@/services"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest,  {params}: {params: Promise<{ id: string }>}) {
  try {
    const resolvedParams = await params
    const result = await CryptoWalletService.findById(resolvedParams.id)
    return NextResponse.json(result, { status: result.success ? 200 : 404 })
  } catch (error) {
    return NextResponse.json({ success: false, error: `${error}` }, { status: 500 })
  }
}

export async function PUT(request: NextRequest,  {params}: {params: Promise<{ id: string }>}) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    const result = await CryptoWalletService.update(resolvedParams.id, body)
    return NextResponse.json(result, { status: result.success ? 200 : 404 })
  } catch (error) {
    return NextResponse.json({ success: false, error: `${error}` }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest,  {params}: {params: Promise<{ id: string }>}) {
  try {
    const resolvedParams = await params
    const result = await CryptoWalletService.delete(resolvedParams.id)
    return NextResponse.json(result, { status: result.success ? 200 : 404 })
  } catch (error) {
    return NextResponse.json({ success: false, error: `${error}` }, { status: 500 })
  }
}
