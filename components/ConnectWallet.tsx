"use client";

import { useState } from "react";
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { ethers } from "ethers";

export default function ConnectWallet() {
  const [address, setAddress] = useState<string | null>(null);

  async function connectWallet() {
    const wcProvider = await EthereumProvider.init({
      projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
      chains: [1], // Ethereum mainnet
      showQrModal: true,
    });

    await wcProvider.connect();

    const ethersProvider = new ethers.BrowserProvider(wcProvider);
    const signer = await ethersProvider.getSigner();
    const addr = await signer.getAddress();
    setAddress(addr);
  }

  return (
    <div>
      {address ? (
        <p>Connecté : {address}</p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}
