"use client";

import { useEffect, useState} from "react";
import type { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchSession() {
      const sess = await getSession();
      if (!sess) {
        router.push("/login");
      } else {
        setSession(sess);
      }
    }
    fetchSession();
  }, [router]);
  if (!session) {
    return null;
  }

  return (
    <div className="p-6 w-full">
      <main className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-foreground">
            Liste des comptes
          </h1>
          <p className="text-muted-foreground">
            Explore la liste des comptes que tu as ajoutés à ton espace
          </p>
        </div>

        <Link href={"/accounts/new"} className="text-primary underline">
            <Button>Ajouter un compte</Button>
        </Link>
      </main>
    </div>
  );
}
