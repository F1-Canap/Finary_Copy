"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [search, setSearch] = useState("");
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

  const filteredCategories = useMemo(() => {
    return accountCategories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        cat.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  if (!session) {
    return null;
  }

  return (
    <div className="w-full">
      <main className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-foreground">
            Choisis une catégorie d’investissement
          </h1>
          <p className="text-muted-foreground">
            Explore et ajoute tes différents types d’actifs pour suivre ton
            patrimoine en un seul endroit.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-1/2">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher une catégorie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories grid */}
        {filteredCategories.length === 0 ? (
          <p className="text-muted-foreground text-center">
            Aucune catégorie trouvée.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {filteredCategories.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  key={cat.id}
                  className="cursor-pointer"
                  onClick={() => {
                    if (!cat.comingSoon) router.push(cat.href);
                  }}
                >
                  <CardHeader className="flex flex-col items-center justify-center">
                    {cat.icon && (
                      <cat.icon className={`w-10 h-10 mb-3 text-primary`} />
                    )}
                    <CardTitle className="text-lg flex items-center gap-2">
                      {cat.name}
                      {cat.badge && (
                        <Badge
                          variant="secondary"
                        >
                          {cat.badge}
                        </Badge>
                      )}
                    </CardTitle>
                    {cat.description && (
                      <CardDescription className="text-center">
                        {cat.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-3">
                    <Button
                      variant="outline"
                      disabled={cat.comingSoon}
                      className={`w-full text-primary border-primary hover:bg-muted hover:text-primary`}
                    >
                      {cat.comingSoon ? "Coming Soon" : "Explore"}
                    </Button>
                  </CardContent>
                </Card>

              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
