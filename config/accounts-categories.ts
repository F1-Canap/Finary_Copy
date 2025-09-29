// config/accounts-categories.ts
import { Bitcoin, Banknote, Clock, LucideIcon } from "lucide-react";

export type AccountCategory = {
  id: string;
  name: string;
  icon: LucideIcon;
  description?: string;
};

export const accountCategories: AccountCategory[] = [
  {
    id: "crypto",
    name: "Crypto",
    icon: Bitcoin,
    description: "Investissements en cryptomonnaies (Bitcoin, Ethereum, etc.)",
  },
  {
    id: "bank",
    name: "Comptes bancaires",
    icon: Banknote,
    description: "Dépôts, comptes courants et comptes épargne",
  },
  {
    id: "watches",
    name: "Montres",
    icon: Clock,
    description: "Montres de luxe et objets horlogers de collection",
  },
];
