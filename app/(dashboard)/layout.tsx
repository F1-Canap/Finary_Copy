// app/layout.tsx

import "./../globals.css";
import { Suspense } from "react";
import { SidebarInset} from "@/components/ui/sidebar";
import { SidebarComponent } from "@/components/sidebar/sidebar";
import { Breadcrumb } from "@/components/sidebar/breadcrumb";
import { Providers } from "./providers";

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
              </div>
              <main className="flex-1 pl-4 md:pl-2 pr-4 pb-12">{children}</main>
            </SidebarInset>
          </Suspense>
        </Providers>
        </>
  );
}
