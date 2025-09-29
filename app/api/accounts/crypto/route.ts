// 📁 app/api/accounts/crypto/route.ts
import { CryptoWalletService } from "@/services"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "99999")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc"

    const result = await CryptoWalletService.findAll({ page, limit, sortBy, sortOrder })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ success: false, error: `${error}` }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await CryptoWalletService.create(body)
    return NextResponse.json(result, { status: result.success ? 201 : 400 })
  } catch (error) {
    return NextResponse.json({ success: false, error: `${error}` }, { status: 500 })
  }
}
