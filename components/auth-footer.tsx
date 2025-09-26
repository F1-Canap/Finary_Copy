// components/AuthFooter.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AuthFooter() {
  const pathname = usePathname();
  const isRegister = pathname === "/register";

  return isRegister ? (
    <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4 *:[a]:transition *:[a]:duration-200">
      By signing up, you agree to our <a href="#">Terms of Service</a> and{" "}
      <Link href="#">Privacy Policy</Link>.
    </div>
  ) : (
    <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4 *:[a]:transition *:[a]:duration-200">
      By logging in, you agree to our <a href="#">Terms of Service</a> and{" "}
      <Link href="#">Privacy Policy</Link>.
    </div>
  );
}
