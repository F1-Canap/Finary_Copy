import type { Metadata } from "next";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Authentication",
  description:"Finay copy authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Finary Copy
        </Link>

        <div className="flex flex-col gap-6">
            {children}
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By signing up, you agree to our <a href="#">Terms of Service</a> and{" "}
                <Link href="#">Privacy Policy</Link>.
            </div>
        </div>
      </div>
    </div>
  );
}
