import axios, { AxiosError } from "axios"
import { Results } from "@/types/adapters";

const GETBLOCK_URL = process.env.GETBLOCK_API_URL

export async function getBalances(address: string): Promise<Results> {
    try {
        const res = await axios.post(
            GETBLOCK_URL as string,
            {
                jsonrpc: "2.0",
                method: "account_info",
                params: [
                    {
                        account: address,
                        ledger_index: "validated"
                    }
                ],
                id: 1
            },
            {headers: { "Content-Type": "application/json" } }
        )

        const data = res.data?.result?.account_data
        if (!data || !data.Balance) {
            console.error("❌ Invalid response from GetBlock:", res.data)
            return { status_ok: false, chain: "xrp", address, error: "Invalid response from GetBlock" }
        }

        const xrp = Number(data.Balance) / 1e6 // Convert drops to XRP

        console.log(`✅ Balance for address ${address}: ${xrp} XRP`)
        return {
            status_ok: true,
            chain: "xrp",
            address,
            balances: [{
                token: "XRP",
                amount: xrp 
            }],
        }
  } catch (error: unknown) {
    const err = error as AxiosError
    console.error(
      "❌ Error fetching XRP balances:",
      err.response?.data || err.message
    )
    return { 
        status_ok: false,
        chain: "xrp",
        address,
        error: err }
  } 
}

