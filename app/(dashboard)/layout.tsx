// app/layout.tsx

import "./../globals.css";
import { Suspense } from "react";
import { SidebarInset} from "@/components/ui/sidebar";
import { SidebarComponent } from "@/components/sidebar/sidebar";
import { Breadcrumb } from "@/components/sidebar/breadcrumb";
import { Providers } from "./providers";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ToggleAmountsButton } from "@/components/ToggleAmountsButton";

// Layout principal
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
        <Providers>
          <Suspense fallback={<div>Loading...</div>}>
            <SidebarComponent />
            <SidebarInset className="p-0">
              <div className="flex justify-between pl-4 md:pl-2 pr-4 pt-4">
                <Breadcrumb />
                <div className="flex space-x-2">
                    <ToggleAmountsButton />
                    <Button variant="default">
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un compte
                    </Button>
                </div>
              </div>
              <main className="flex-1 pl-4 md:pl-2 pr-4 pb-12">{children}</main>
            </SidebarInset>
          </Suspense>
        </Providers>
        </>
  );
}
