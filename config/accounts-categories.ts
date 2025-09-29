// config/accounts-categories.ts
import { Bitcoin, Banknote, Clock, LucideIcon } from "lucide-react";

export type AccountCategory = {
  id: string;
  name: string;
  icon: LucideIcon;
  description?: string;
  href: string; // link to the category page
  badge?: string; // small label (e.g., "Soon", "Popular")
  comingSoon?: boolean; // disables link if true
};

export const accountCategories: AccountCategory[] = [
  {
    id: "crypto",
    name: "Crypto",
    icon: Bitcoin,
    description: "Investments in cryptocurrencies",
    href: "/accounts/new/crypto",
    badge: "Popular",
  },
  {
    id: "bank",
    name: "Bank Accounts",
    icon: Banknote,
    description: "Checking accounts, savings, and deposits",
    href: "/accounts/new/bank",
    badge: "Coming Soon",
    comingSoon: true,
  },
  {
    id: "watches",
    name: "Watches",
    icon: Clock,
    description: "Luxury watches and collectible timepieces",
    href: "/accounts/new/watches",
    badge: "Coming Soon",
    comingSoon: true,
  },
];
