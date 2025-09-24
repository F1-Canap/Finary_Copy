"use client";

import ConnectWallet from "@/components/ConnectWallet";
import Metamask from "@/components/metamask";
import "@reown/appkit-wallet-button/react";

export default function Home() {
  return (
    <div>
      <h1>Mon Dashboard</h1>
      <ConnectWallet />
      <Metamask />
    </div>
  );
}
