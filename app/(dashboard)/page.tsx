"use client";

import { ModeToggle } from "@/components/theme-switcher";
import { useEffect, useState } from "react";
import type { Session } from "next-auth";
import { getSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";

export default function Dashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const { showAmounts, currency } = useAppContext();
  const balance = 12500.75
  useEffect(() => {
    async function fetchSession() {
      const sess = await getSession();
      if (!sess) {
        router.push("/login"); // redirect is server-only, so use router.push
      } else {
        console.log(sess)
        setSession(sess);
      }
    }
    fetchSession();
  }, [router]);

  if (!session) {
    return null; // you could show a loading spinner here
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-1">
          <p className="mt-2">Welcome back, {session.user?.name}</p>
          <span>{session.user._id}</span>
          <Button
            variant="destructive"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Disconnect
          </Button>
        </div>
        
        <ModeToggle />
        <p className="text-lg font-semibold">
          {showAmounts ? `${balance.toLocaleString()} €` : "•••••"}
        </p>
        <div className="space-y-1 text-sm text-foreground">
            <p><strong>Code :</strong> {currency.code}</p>
            <p><strong>Name :</strong> {currency.name}</p>
            <p><strong>Symbol :</strong> {currency.symbol}</p>
            <p><strong>Decimals :</strong> {currency.decimals}</p>
            <p><strong>Crypto :</strong> {currency.isCrypto ? "Yes" : "No"}</p>
        </div>
      </main>
    </div>
  );
}
