import { Results } from "@/types/adapters";
import axios from "axios";


export async function getBalances(address: string): Promise<Results> {
  try {
    const url = `https://blockchain.info/rawaddr/${address}`;
    const res = await axios.get(url);
    console.log("✅ Fetched Bitcoin balance data:", res.data);

    const satoshis = res.data.final_balance;
    const bitcoins = satoshis / 1e8; // Convert satoshis to BTC

    return {
        status_ok: true,
        chain: "bitcoin",
        address,
        balances: [{
          token: "BTC",
          amount: bitcoins // ici bitcoins est un number
        }],
    };
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error("❌ Error fetching Bitcoin balance:", error.message);

    return {
        status_ok: false,
        chain: "bitcoin",
        address,
        error: error.message,
    };
  }

  return {
    status_ok: false,
    chain: "bitcoin",
    address,
    error: "Unknown error",
  };
}
}
