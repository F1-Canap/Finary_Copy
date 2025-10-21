"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronRight, Bitcoin, Coins } from "lucide-react"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppContext } from "@/context/AppContext"
import { TokenIcon, ExchangeIcon } from "@web3icons/react"
import { BinanceAccount, CryptoWallet } from "@/types/database"
import { CryptoCurrencyDisplay } from "@/components/CurrencyCryptoDisplay"

export default function CryptoAccountsPage() {
  const { data: session } = useSession()
  const { wealth, loading: contextLoading } = useAppContext()

  const [wallets, setWallets] = useState<CryptoWallet[]>([])
  const [binance, setBinance] = useState<BinanceAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [expandedWallets, setExpandedWallets] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!session?.user?._id) return

    if (!contextLoading) {
      if (wealth.cryptoWallets) {
        setWallets(wealth.cryptoWallets)
      }

      if (wealth.binanceAccounts) {
        setBinance(wealth.binanceAccounts[0])
      }

      if (!wealth.cryptoWallets?.length && !wealth.binanceAccounts) {
        setError("Aucun compte crypto ou Binance trouvé.")
      } else {
        setError("")
      }

      setLoading(false)
    }
  }, [session, contextLoading, wealth.cryptoWallets, wealth.binanceAccounts])

  const toggleWallet = (id: string) => {
    setExpandedWallets((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const totalCryptoBalance = wallets.reduce(
    (sum, w) => sum + Object.values(w.balances).reduce((s, v) => s + v, 0),
    0
  )
  const totalBinanceBalance = binance
    ? Object.values(binance.balances).reduce((s, v) => s + v, 0)
    : 0
  const totalBalance = totalCryptoBalance + totalBinanceBalance

  if (loading || contextLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-semibold">Comptes Crypto & Binance</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Total Balance */}
      <div className="flex items-center justify-between py-4">
        <div>
          <p className="text-sm text-muted-foreground">Valeur totale</p>
          <CryptoCurrencyDisplay
            amount={totalBalance}
            fromCurrency="EUR"
            className="text-3xl font-bold"
          />
        </div>
      </div>

      {/* Wallets */}
      <div className="space-y-3">
        {wallets.map((wallet) => (
          <div
            key={wallet._id?.toString()}
            className="rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
          >
            <div
              onClick={() => toggleWallet(wallet._id?.toString() ?? '')}
              className="flex items-center gap-4 p-4 cursor-pointer"
            >
              <ChevronRight
                className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform",
                  expandedWallets.has(wallet._id?.toString() ?? '') && "rotate-90"
                )}
              />

              {/* Logo */}
              <TokenIcon
                symbol={wallet.chain}
                variant="branded"
                size="36"
                fallback={<Bitcoin className="h-6 w-6" />}
              />

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base capitalize">
                  {wallet.chain}
                </p>
              </div>

              <CryptoCurrencyDisplay
                amount={Object.values(wallet.balances).reduce((s, v) => s + v, 0)}
                fromCurrency={wallet.balances ? Object.keys(wallet.balances)[0] : 'EUR'}
                className="text-xl font-bold"
              />
            </div>

            {expandedWallets.has(wallet._id?.toString() ?? '') && (
              <div className="ml-4 pl-4 border-l-2 border-border space-y-2 pb-2">
                {Object.entries(wallet.balances).map(([token, amount]) => (
                  <div
                    key={token}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/30 transition"
                  >
                    <div className="flex items-center gap-2">
                      <TokenIcon
                        symbol={token.toLowerCase()}
                        variant="branded"
                        size="20"
                        fallback={<Coins className="h-4 w-4" />}
                      />
                      <p className="font-medium text-sm uppercase">{token}</p>
                    </div>
                    <CryptoCurrencyDisplay
                      amount={amount}
                      fromCurrency={token}
                      className="font-semibold"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Binance */}
        {binance && (
          <div className="rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-4 p-4">
              <ExchangeIcon id="binance" variant="branded" size="36" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base">Binance</p>
              </div>
              <CryptoCurrencyDisplay
                amount={totalBinanceBalance}
                fromCurrency="EUR"
                className="text-xl font-bold"
              />
            </div>

            <div className="ml-4 pl-4 border-l-2 border-border space-y-2 pb-2">
              {Object.entries(binance.balances).map(([asset, amount]) => (
                <div
                  key={asset}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/30 transition"
                >
                  <div className="flex items-center gap-2">
                    <TokenIcon
                      symbol={asset.toLowerCase()}
                      variant="branded"
                      size="20"
                      fallback={<Coins className="h-4 w-4" />}
                    />
                    <p className="font-medium text-sm uppercase">{asset}</p>
                  </div>
                  <CryptoCurrencyDisplay
                    amount={amount}
                    fromCurrency="EUR"
                    className="font-semibold"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
