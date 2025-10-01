"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"

export default function BankSuccessPage() {
  const router = useRouter()
  const [status, setStatus] = useState<"checking" | "success" | "error">("checking")
  const [message, setMessage] = useState("Vérification de la liaison bancaire...")
  const session = useSession()

  useEffect(() => {
    const checkStatusAndSaveAccounts = async () => {
      try {
        const statusResponse = await fetch(`/api/accounts/bank/status?userId=${session.data?.user._id}`)
        const statusData = await statusResponse.json()

        if (!statusResponse.ok) {
          setStatus("error")
          setMessage(statusData.error || "Erreur lors de la vérification")
          return
        }

        if (statusData.status === "LN" && statusData.accounts.length > 0) {
          console.log("[v0] Saving accounts to MongoDB:", statusData.accounts)

          const saveResponse = await fetch("/api/accounts/bank/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              requisitionId: statusData.requisitionId,
              userId: statusData.userId,
            }),
          })

          const saveData = await saveResponse.json()

          if (!saveResponse.ok) {
            console.error("[v0] Error saving accounts:", saveData.error)
            setStatus("error")
            setMessage("Erreur lors de la sauvegarde des comptes")
            return
          }

          console.log("[v0] Accounts saved successfully:", saveData.accountsSaved)
          setStatus("success")
          setMessage("Liaison réussie avec votre banque !")
          setTimeout(() => {
            router.push("/accounts/bank")
          }, 2000)
        } else {
          // Réessayer après 2 secondes
          setTimeout(checkStatusAndSaveAccounts, 2000)
        }
      } catch (error) {
        console.error("[v0] Error in checkStatusAndSaveAccounts:", error)
        setStatus("error")
        setMessage("Erreur lors de la vérification de la liaison")
      }
    }

    checkStatusAndSaveAccounts()
  }, [router, session.data?.user._id])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 pb-8">
          <div className="text-center space-y-6">
            {status === "checking" && (
              <>
                <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">{message}</h2>
                  <p className="text-sm text-muted-foreground">
                    Veuillez patienter pendant que nous vérifions votre connexion...
                  </p>
                </div>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-green-600">{message}</h2>
                  <p className="text-sm text-muted-foreground">Redirection vers votre dashboard...</p>
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="h-16 w-16 text-destructive mx-auto" />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-destructive">Erreur</h2>
                    <p className="text-sm text-muted-foreground">{message}</p>
                  </div>
                  <Button onClick={() => router.push("/accounts/new/bank")}>Réessayer</Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
