"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { SidebarTrigger, useSidebar } from "../ui/sidebar"
import { Separator } from "../ui/separator"
import { Button } from "../ui/button"

interface BreadcrumbConfig {
  [key: string]: string
}

const BREADCRUMB_LABELS: BreadcrumbConfig = {
  // Pages principales
  home: "Home",
  dashboard: "Dashboard",
  wealth: "Wealth",
  accounts: "Accounts",
  transactions: "Transactions",
  settings: "Settings",
  profile: "Profile",
  // Pages secondaires
  security: "Security",
  notifications: "Notifications",
  preferences: "Preferences",
  help: "Help",
  about: "About",
  new: "Add New",
  cryptos: "Crypto Wallets",
  // Exemples spécifiques

}

function formatSegment(segment: string): string {
  if (BREADCRUMB_LABELS[segment]) {
    return BREADCRUMB_LABELS[segment]
  }
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function Breadcrumb() {
  const pathname = usePathname()
  const { state } = useSidebar()

  const segments = pathname.split("/").filter(Boolean)

  const breadcrumbItems = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    const label = formatSegment(segment)
    const isLast = index === segments.length - 1
    return { href, label, isLast }
  })

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence initial={false}>
        {state === "expanded" && (
          <>
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </>
        )}
      </AnimatePresence>

      <nav className="flex items-center space-x-2 text-sm">
        {/* Lien vers l'accueil */}
        <Link href="/" className="flex items-center">
          <Button
            data-sidebar="trigger"
            data-slot="sidebar-trigger"
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Accueil</span>
          </Button>
        </Link>

        {breadcrumbItems.length > 0 && (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}

        {/* Segments */}
        {breadcrumbItems.map((item) => (
          <div key={item.href} className="flex items-center space-x-2">
            {item.isLast ? (
              <span className="text-primary font-medium">{item.label}</span>
            ) : (
              <>
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}
