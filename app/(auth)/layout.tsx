import type { Metadata } from "next";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { AuthFooter } from "@/components/auth/auth-footer";
import { ModeToggle } from "@/components/theme-switcher";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Finary copy authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Finary Copy
        </Link>

        <div className="flex flex-col gap-6">
            {children}
            <AuthFooter />
        </div>
      </div>
      <div className="fixed bottom-4 right-4">
        <ModeToggle />
      </div>
    </div>
  );
}
