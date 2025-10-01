"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, Shield, Lock, Loader2 } from "lucide-react"
import { SUPPORTED_BANKS } from "@/config/banks"
import { useSession } from "next-auth/react"

export default function NewBankConnectionPage() {
  const [selectedBank, setSelectedBank] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const session = useSession()

  const handleConnect = async () => {
    if (!selectedBank) {
      setError("Veuillez sélectionner une banque")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/accounts/bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankId: selectedBank,
          userId: session.data?.user._id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la connexion")
      }

      window.location.href = data.link
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
      setLoading(false)
    }
  }

  return (
    <div className="w-full h-full space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Connecter votre banque</h1>
            <p className="text-muted-foreground mt-1">
              Sélectionnez votre établissement bancaire pour synchroniser vos comptes
            </p>
          </div>
        </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column - Bank selection */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Choisissez votre banque</CardTitle>
              <CardDescription>Sélectionnez votre établissement bancaire dans la liste ci-dessous</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {Object.values(SUPPORTED_BANKS).map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => setSelectedBank(bank.id)}
                    disabled={loading}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedBank === bank.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50 hover:bg-accent"
                    } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{bank.logo}</div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">{bank.name}</p>
                          <p className="text-xs text-muted-foreground">{bank.country}</p>
                        </div>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border-2 flex-shrink-0 ${
                          selectedBank === bank.id ? "border-primary bg-primary" : "border-muted-foreground/30"
                        } flex items-center justify-center`}
                      >
                        {selectedBank === bank.id && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleConnect}
            disabled={!selectedBank || loading}
            className="w-full h-12 text-base"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-5 w-5" />
                Se connecter à ma banque
              </>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Sécurité & Confidentialité</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">Connexion sécurisée via GoCardless (PSD2)</p>
                </div>
                <div className="flex gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">Aucune donnée de connexion stockée</p>
                </div>
                <div className="flex gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">Accès en lecture seule à vos comptes</p>
                </div>
              </div>
              <div className="pt-4 border-t border-primary/20">
                <p className="text-xs text-muted-foreground">Powered by GoCardless Bank Account Data API</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comment ça marche ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <span className="font-semibold text-primary">1.</span>
                <p>Sélectionnez votre banque dans la liste</p>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-primary">2.</span>
                <p>Connectez-vous via le portail sécurisé de votre banque</p>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-primary">3.</span>
                <p>Vos comptes seront automatiquement synchronisés</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
