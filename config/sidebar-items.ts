import { ArrowLeftRight, Home, PieChart, Wallet } from "lucide-react"

export const sidebarItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Wealth",
    href: "/wealth",
    icon: PieChart,
  },
  {
    title: "Accounts",
    href: "/accounts",
    icon: Wallet,
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: ArrowLeftRight
  }
]
