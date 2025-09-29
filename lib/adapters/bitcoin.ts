import axios from "axios";
import { Results } from "./types";

export async function getBalances(address: string): Promise<Results> {
  try {
    const url = `https://blockchain.info/rawaddr/${address}`;
    const res = await axios.get(url);

    const satoshis = res.data.final_balance;
    const bitcoins = satoshis / 1e8; // Convert satoshis to BTC

    console.log(`✅ Balance for address ${address}: ${bitcoins} BTC`);

    return {
        status_ok: true,
        chain: "bitcoin",
        address,
        balance: bitcoins,
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
