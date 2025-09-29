"use client";

import { SessionProvider } from "next-auth/react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import { AppProvider } from "@/context/AppContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppProvider>
      <SidebarProvider>
        {children}
        <Toaster />
      </SidebarProvider>
      </AppProvider>
    </SessionProvider>
  );
}
