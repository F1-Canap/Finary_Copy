"use client";

import { useState } from "react";
import { TokenIcon, ExchangeIcon, WalletIcon } from "@web3icons/react";
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
import { ethers } from "ethers";
import EthereumProvider from "@walletconnect/ethereum-provider";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

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

const WalletFormSchema = z.object({
  chain: z.string().min(1, "Please select a chain"),
  address: z.string().min(5, "Wallet address is required"),
});
type WalletFormValues = z.infer<typeof WalletFormSchema>;

const BinanceFormSchema = z.object({
  apiKey: z.string().min(10, "API Key is required"),
  secret: z.string().min(10, "API Secret is required"),
});
type BinanceFormValues = z.infer<typeof BinanceFormSchema>;


export default function ConnectWalletPage() {
  const [mode, setMode] = useState<Mode>(null);
  const [open, setOpen] = useState(false);

  const [result, setResult] = useState<WalletResponse | BinanceResponse | null>(
    null
  );

    const walletForm = useForm<WalletFormValues>({
    resolver: zodResolver(WalletFormSchema),
    defaultValues: {
      chain: "",
      address: "",
    },
  });

const binanceForm = useForm<BinanceFormValues>({
    resolver: zodResolver(BinanceFormSchema),
    defaultValues: {
      apiKey: "",
      secret: "",
    },
  });

  async function handleWalletSubmit() {
    const { chain, address } = walletForm.getValues();
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

  async function handleBinanceSubmit() {
    const { apiKey, secret } = binanceForm.getValues();
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

    async function connectWallet() {
      const wcProvider = await EthereumProvider.init({
        projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
        chains: [1], // Ethereum mainnet
        showQrModal: true,
      });
  
      await wcProvider.connect();
  
      const ethersProvider = new ethers.BrowserProvider(wcProvider);
      const signer = await ethersProvider.getSigner();
      const addr = await signer.getAddress();
        walletForm.setValue("address", addr);
        setMode("wallet");
      setOpen(true);
    }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Connect Crypto Accounts</h1>

      {/* Mode selector cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
        <Card
          className="cursor-pointer"
          onClick={connectWallet}
        >
          <CardHeader className="flex flex-col items-center justify-center ">
            <WalletIcon id="wallet-connect" variant="branded" size="60" />
            <CardTitle className="mt-3">Wallet Connect</CardTitle>
            <CardDescription className="text-center">
              Connect with Wallet Connect QR code
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" className={`w-full text-primary border-primary hover:bg-primary hover:text-primary`}>Select</Button>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer"
          onClick={() => {
            setMode("wallet");
            setOpen(true);
          }}
        >
          <CardHeader className="flex flex-col items-center justify-center ">
            <TokenIcon symbol="eth" variant="branded" size="60" />
            <CardTitle className="mt-3">Wallet</CardTitle>
            <CardDescription className="text-center">
              Connect your on-chain wallet address
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" className={`w-full text-primary border-primary hover:bg-primary hover:text-primary`}>Select</Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer"
          onClick={() => {
            setMode("binance");
            setOpen(true);
          }}
        >
          <CardHeader className="flex flex-col items-center justify-center">
            <ExchangeIcon id="binance" variant="branded" size="60" />
            <CardTitle className="mt-3">Binance</CardTitle>
            <CardDescription className="text-center">
              Connect using your Binance API keys
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" className={`w-full text-primary border-primary hover:bg-primary hover:text-primary`}>Select</Button>
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
            <Form {...walletForm}>
                <form
                    onSubmit={walletForm.handleSubmit(handleWalletSubmit)}
                    className="space-y-6 max-w-md w-full"
                >
                    {/* Chain select */}
                    <FormField
                    control={walletForm.control}
                    name="chain"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-foreground">Blockchain</FormLabel>
                        <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            required
                        >
                            <FormControl>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a chain..." />
                            </SelectTrigger>
                            </FormControl>
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
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    {/* Wallet address */}
                    <FormField
                    control={walletForm.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-foreground">Wallet Address</FormLabel>
                        <FormControl>
                            <Input
                            type="text"
                            placeholder="0x..."
                            {...field}
                            className="w-full"
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    {/* Submit button */}
                    <Button type="submit" className="w-full bg-primary text-primary-foreground">
                    Connect Wallet
                    </Button>
                </form>
                </Form>
          )}

          {mode === "binance" && (
            <Form {...binanceForm}>
                <form
                    onSubmit={binanceForm.handleSubmit(handleBinanceSubmit)}
                    className="space-y-6 max-w-md w-full"
                >
                    {/* API Key */}
                    <FormField
                    control={binanceForm.control}
                    name="apiKey"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-foreground">API Key</FormLabel>
                        <FormControl>
                            <Input
                            type="text"
                            placeholder="Enter your API Key"
                            {...field}
                            className="w-full"
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    {/* API Secret */}
                    <FormField
                    control={binanceForm.control}
                    name="secret"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-foreground">API Secret</FormLabel>
                        <FormControl>
                            <Input
                            type="password"
                            placeholder="Enter your API Secret"
                            {...field}
                            className="w-full"
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    {/* Submit button */}
                    <Button type="submit" className="w-full bg-primary text-primary-foreground">
                    Connect Binance
                    </Button>
                </form>
                </Form>
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