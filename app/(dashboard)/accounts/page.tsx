"use client";

import { useEffect, useState } from "react";
import type { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { accountCategories } from "@/config/accounts-categories";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
        <h1 className="text-2xl font-bold text-foreground">
          Choisis une catégorie d’investissement
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {accountCategories.map((cat) => (
            <Card
              key={cat.id}
              className="hover:shadow-lg transition hover:scale-[1.02] cursor-pointer"
              onClick={() => router.push(`/investissements/${cat.id}`)}
            >
              <CardHeader className="flex flex-col items-center justify-center">
                {cat.icon && (
                  <cat.icon className="w-10 h-10 mb-3 text-primary" />
                )}
                <CardTitle className="text-lg">{cat.name}</CardTitle>
                {cat.description && (
                  <CardDescription className="text-center">
                    {cat.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button
                  variant="outline"
                  className="mt-2 text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Explorer
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
