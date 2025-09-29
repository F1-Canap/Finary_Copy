// app/layout.tsx
import "./../globals.css";
import { Suspense } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { SidebarComponent } from "@/components/sidebar/sidebar";
import { Breadcrumb } from "@/components/sidebar/breadcrumb";
import { Providers } from "./providers";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ToggleAmountsButton } from "@/components/ToggleAmountsButton";
import { CurrencySelectorButton } from "@/components/CurrencySelectorButton";
import Link from "next/link";

// Layout principal
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex h-screen w-screen overflow-hidden">
          {/* Sidebar fixe */}
          <SidebarComponent />
          {/* Contenu principal */}
          <SidebarInset className="flex flex-col flex-1 p-0">
            {/* Header fixe */}
            <div className="flex justify-between pl-4 md:pl-2 pr-4 pt-4 pb-2 shrink-0">
              <Breadcrumb />
              <div className="flex space-x-2 items-center">
                <ToggleAmountsButton />
                <CurrencySelectorButton />
                <Link href="/accounts/new">
                  <Button variant="default">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un compte
                  </Button>
                </Link>
              </div>
            </div>

            {/* Main scrollable */}
            <main className="flex-1 overflow-y-auto pl-4 md:pl-2 pr-4 pb-12">
              {children}
            </main>
          </SidebarInset>
        </div>
      </Suspense>
    </Providers>
  );
}
