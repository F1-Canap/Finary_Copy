"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { TokenIcon, ExchangeIcon } from "@web3icons/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Mode = "wallet" | "binance" | null;

interface WalletResponse {
  ok: boolean;
  chain: string;
  address: string;
  balances?: unknown;
}

interface BinanceResponse {
  ok: boolean;
  balances?: {
    asset: string;
    free: string;
    locked: string;
  }[];
}

const chainOptions: { value: string; label: string; symbol: string }[] = [
  { value: "bitcoin", label: "Bitcoin", symbol: "btc" },
  { value: "cardano", label: "Cardano", symbol: "ada" },
  { value: "solana", label: "Solana", symbol: "sol" },
  { value: "xrp", label: "XRP", symbol: "xrp" },
  { value: "eth", label: "Ethereum", symbol: "eth" },
  { value: "polygon", label: "Polygon", symbol: "matic" },
  { value: "bsc", label: "BNB Smart Chain", symbol: "bnb" },
  { value: "arbitrum", label: "Arbitrum", symbol: "arb" },
  { value: "base", label: "Base", symbol: "base" },
  { value: "optimism", label: "Optimism", symbol: "op" },
  { value: "ava", label: "Avalanche", symbol: "avax" },
  { value: "ftm", label: "Fantom", symbol: "ftm" },
  { value: "cro", label: "Cronos", symbol: "cro" },
  { value: "gnosis", label: "Gnosis", symbol: "gno" },
  { value: "moonbeam", label: "Moonbeam", symbol: "glmr" },
  { value: "ronin", label: "Ronin", symbol: "ron" },
];

export default function ConnectWalletPage() {
  const [mode, setMode] = useState<Mode>(null);
  const [open, setOpen] = useState(false);

  // Wallet form state
  const [chain, setChain] = useState("");
  const [address, setAddress] = useState("");

  // Binance form state
  const [apiKey, setApiKey] = useState("");
  const [secret, setSecret] = useState("");

  const [result, setResult] = useState<WalletResponse | BinanceResponse | null>(
    null
  );

  async function handleWalletSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const res = await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chain, address }),
      });
      const data: WalletResponse = await res.json();
      setResult(data);
      setOpen(false);
    } catch (err) {
      console.error("❌ Wallet error:", err);
    }
  }

  async function handleBinanceSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const res = await fetch("/api/binance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, secret }),
      });
      const data: BinanceResponse = await res.json();
      setResult(data);
      setOpen(false);
    } catch (err) {
      console.error("❌ Binance error:", err);
    }
  }

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6">Connect Crypto Accounts</h1>

      {/* Mode selector cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
        <Card
          className="hover:shadow-lg transition hover:scale-[1.02] cursor-pointer"
          onClick={() => {
            setMode("wallet");
            setOpen(true);
          }}
        >
          <CardHeader className="flex flex-col items-center justify-center">
            <TokenIcon symbol="eth" variant="branded" size="40" />
            <CardTitle className="mt-3">Wallet</CardTitle>
            <CardDescription className="text-center">
              Connect your on-chain wallet address
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline">Select</Button>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition hover:scale-[1.02] cursor-pointer"
          onClick={() => {
            setMode("binance");
            setOpen(true);
          }}
        >
          <CardHeader className="flex flex-col items-center justify-center">
            <ExchangeIcon id="binance" variant="branded" size="40" />
            <CardTitle className="mt-3">Binance</CardTitle>
            <CardDescription className="text-center">
              Connect using your Binance API keys
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline">Select</Button>
          </CardContent>
        </Card>
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mode === "wallet" ? "Connect Wallet" : "Connect Binance"}
            </DialogTitle>
            <DialogDescription>
              {mode === "wallet"
                ? "Enter your wallet details to fetch balances."
                : "Enter your Binance API credentials securely."}
            </DialogDescription>
          </DialogHeader>

          {mode === "wallet" && (
            <form onSubmit={handleWalletSubmit} className="space-y-4">
              <Select value={chain} onValueChange={setChain} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a chain..." />
                </SelectTrigger>
                <SelectContent>
                  {chainOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <TokenIcon
                          symbol={opt.symbol}
                          variant="branded"
                          size="20"
                        />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="text"
                placeholder="Wallet address"
                value={address}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setAddress(e.target.value)
                }
                required
              />
              <Button type="submit" className="w-full">
                Connect Wallet
              </Button>
            </form>
          )}

          {mode === "binance" && (
            <form onSubmit={handleBinanceSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="API Key"
                value={apiKey}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setApiKey(e.target.value)
                }
                required
              />
              <Input
                type="password"
                placeholder="API Secret"
                value={secret}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSecret(e.target.value)
                }
                required
              />
              <Button type="submit" className="w-full">
                Connect Binance
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Result */}
      {result && (
        <pre className="mt-6 bg-muted p-4 rounded text-sm text-foreground whitespace-pre-wrap">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}