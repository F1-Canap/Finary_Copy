"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronRight,  RefreshCw, Loader2, Clock} from "lucide-react"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { CurrencyDisplay } from "@/components/CurrencyDisplay"
import { CurrencyCode } from "@/config/currency"


interface Account {
  id: string
  requisitionId: string
  name: string
  type: "investment" | "savings" | "checking"
  iban?: string
  currency: string
  balance: number
  status?: "ready" | "processing"
  lastUpdated: string
}

interface RequisitionGroup {
  requisitionId: string
  institutionName: string
  accounts: Account[]
  totalBalance: number
  lastUpdated: string
  logo?: string
}

interface AccountsSummary {
  accounts: Account[]
  lastUpdated: string
}

export default function BankAccountsPage() {
  const router = useRouter()
  const [data, setData] = useState<AccountsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const session = useSession()

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch(`/api/accounts/bank/summary?userId=${session.data?.user._id}`)

        if (!response.ok) {
          console.log(response)
          if (response.status === 401) {
            return
          }
          throw new Error("Erreur lors du chargement des comptes")
        }

        const result = await response.json()
        setData(result)
        setError("")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [router, session.data?.user._id])

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return "Mise à jour il y a moins d'une heure"
    } else if (diffInHours === 1) {
      return "Mise à jour il y a 1 heure"
    } else if (diffInHours < 24) {
      return `Mise à jour il y a ${diffInHours} heures`
    } else if (diffInHours < 48) {
      return "Mise à jour avant-hier"
    } else {
      return `Mise à jour il y a ${Math.floor(diffInHours / 24)} jours`
    }
  }

  const groupAccountsByRequisition = (accounts: Account[]): RequisitionGroup[] => {
    const groups = new Map<string, RequisitionGroup>()

    accounts.forEach((account) => {
      if (!groups.has(account.requisitionId)) {
        groups.set(account.requisitionId, {
          requisitionId: account.requisitionId,
          institutionName: account.name.split(" - ")[0] || account.name,
          accounts: [],
          totalBalance: 0,
          lastUpdated: account.lastUpdated,
        })
      }

      const group = groups.get(account.requisitionId)!
      group.accounts.push(account)
      group.totalBalance += account.balance

      if (new Date(account.lastUpdated) > new Date(group.lastUpdated)) {
        group.lastUpdated = account.lastUpdated
      }
    })

    return Array.from(groups.values())
  }

  const toggleGroup = (requisitionId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(requisitionId)) {
        newSet.delete(requisitionId)
      } else {
        newSet.add(requisitionId)
      }
      return newSet
    })
  }


if (loading) {
  return (
    <>
      {/* Header Skeleton */}
      <div className="px-6 py-4">
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="px-6 py-6 space-y-4">
        {/* Total Balance Skeleton */}
        <div className="flex items-center justify-between py-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Accounts List Skeleton */}
        <div className="space-y-2">
          {/* Simulated Requisition Group 1 */}
          <div className="space-y-0">
            <div className="w-full flex items-center gap-4 p-4 rounded-lg border border-border">
              
              {/* Bank Logo Skeleton */}
              <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
              
              {/* Bank Info Skeleton */}
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
              
              {/* Balance Skeleton */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>

          {/* Simulated Requisition Group 2 */}
          <div className="space-y-0">
            <div className="w-full flex items-center gap-4 p-4 rounded-lg border border-border">
              
              <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
              
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              
              <div className="flex items-center gap-3 flex-shrink-0">
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>

          {/* Simulated Requisition Group 3 */}
          <div className="space-y-0">
            <div className="w-full flex items-center gap-4 p-4 rounded-lg border border-border">
              
              <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
              
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-4 w-36" />
              </div>
              
              <div className="flex items-center gap-3 flex-shrink-0">
                <Skeleton className="h-6 w-28" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

  const requisitionGroups = data ? groupAccountsByRequisition(data.accounts) : []
  const totalBalance = requisitionGroups.reduce((sum, group) => sum + group.totalBalance, 0)

  return (
    <>
        {/* Header */}
        <div className="">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-semibold">Comptes synchronisés</h1>
          </div>
        </div>

        <div className="px-6 py-6 space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {data && data.accounts.some((acc) => acc.status === "processing") && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Certains comptes sont en cours de traitement. Les données seront disponibles dans quelques instants.
              </AlertDescription>
            </Alert>
          )}

          {/* Total Balance */}
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm text-muted-foreground">Solde total</p>
              <CurrencyDisplay amount={totalBalance} fromCurrency="EUR" className="text-3xl font-bold"/>
            </div>
          </div>

          {/* Accounts List */}
          <div className="space-y-2">
            {requisitionGroups.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Aucun compte trouvé</p>
              </div>
            ) : (
              requisitionGroups.map((group) => (
                <div key={group.requisitionId} className="space-y-0">
                  {/* Requisition Group Header */}
                  <div
                    onClick={() => toggleGroup(group.requisitionId)}
                    className="w-full flex items-center gap-4 p-4 rounded-lg bg-card hover:bg-accent/50 transition-colors border border-border"
                  >
                    <ChevronRight
                      className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform flex-shrink-0",
                        expandedGroups.has(group.requisitionId) && "rotate-90",
                      )}
                    />

                    {/* Bank Logo */}
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-semibold">{group.institutionName.charAt(0).toUpperCase()}</span>
                    </div>

                    {/* Bank Info */}
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-semibold text-base">{group.institutionName}</p>
                      <p className="text-sm text-muted-foreground">{getRelativeTime(group.lastUpdated)}</p>
                    </div>

                    {/* Balance */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {group.accounts.some((acc) => acc.status === "processing") && (
                        <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground flex items-center gap-1">
                          <RefreshCw className="h-3 w-3" />
                          SYNC. MANUELLE
                        </span>
                      )}
                      <CurrencyDisplay amount={group.totalBalance} fromCurrency="EUR" className="text-xl font-bold tabular-nums"/>
                      
                    </div>
                  </div>

                  {/* Expanded Accounts */}
                  {expandedGroups.has(group.requisitionId) && (
                    <div className="ml-4 pl-4 border-l-2 border-border space-y-1 py-2">
                      {group.accounts.map((account) => (
                        <div
                          key={account.id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{account.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {account.type === "checking" && "Compte courant"}
                              {account.type === "savings" && "Compte d'épargne"}
                              {account.type === "investment" && "Compte d'investissement"}
                              {account.iban && ` • ${account.iban.slice(-4)}`}
                            </p>
                          </div>
                          <div className="text-right">
                            {account.status === "processing" ? (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span className="text-xs">En cours...</span>
                              </div>
                            ) : (
                              <CurrencyDisplay amount={account.balance} fromCurrency={account.currency as CurrencyCode} className="font-semibold tabular-nums"/>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </>
  )
}
