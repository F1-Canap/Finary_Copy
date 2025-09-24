"use client";

import { useState } from "react";
import { ethers } from "ethers";

interface EthereumProvider {
  request: (...args: unknown[]) => Promise<unknown>;
  // Add more properties if needed
}

// Extend the Window interface to include 'ethereum'
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export default function Metamask() {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  async function connectMetamask() {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("MetaMask n'est pas installé !");
      return;
    }

    // Demande la connexion à MetaMask
    const provider = new ethers.BrowserProvider(window.ethereum as EthereumProvider);
    await provider.send("eth_requestAccounts", []);

    const signer = await provider.getSigner();
    const addr = await signer.getAddress();
    setAddress(addr);

    // Récupère le solde ETH
    const bal = await provider.getBalance(addr);
    setBalance(ethers.formatEther(bal));
  }

  function disconnectWallet() {
    setAddress(null);
    setBalance(null);
  }

  return (
    <div>
      {address ? (
        <div>
          <p>Connecté : {address}</p>
          <p>Solde ETH : {balance}</p>
          <button onClick={disconnectWallet} style={{ marginTop: "10px" }}>
            Déconnecter
          </button>
        </div>
      ) : (
        <button onClick={connectMetamask}>Connecter MetaMask</button>
      )}
    </div>
  );
}
