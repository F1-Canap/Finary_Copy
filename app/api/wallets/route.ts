import { NextRequest, NextResponse } from "next/server";
import { getChainAdapter } from "@/lib/adapters";

export async function POST(req: NextRequest) {
  try {
    const { chain, address } = await req.json();

    if (!chain || !address) {
      return NextResponse.json(
        { status_ok: false, error: "Missing chain or address" },
        { status: 400 }
      );
    }

    const adapter = getChainAdapter(chain);
    if (!adapter) {
      return NextResponse.json(
        { status_ok: false, error: `Unknown chain: ${chain}` },
        { status: 400 }
      );
    }

    const outputs = await adapter.getBalances(address);

    return NextResponse.json({
        outputs
    });
    } catch (err: unknown) {
    if (err instanceof Error) {
        console.error("❌ Error fetching balances:", err.message)
        return NextResponse.json({ ok: false, error: err.message })
    }
    return NextResponse.json({ ok: false, error: "Unknown error" })
    }
}
