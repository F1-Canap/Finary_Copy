import type { CryptoWallet, DatabaseResponse, PaginationOptions, BinanceAccount } from "@/types/database"

class ApiClient {
  private async request<T>(url: string, options?: RequestInit): Promise<DatabaseResponse<T>> {
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "x-api-secret": process.env.NEXT_PUBLIC_API_SECRET!,
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      return {
        success: false,
        error: `Erreur de requête: ${error}`,
      }
    }
  }

  // 📌 Ressource Crypto Wallets
  cryptoWallets = {
    getAll: (options?: PaginationOptions) => {
      const params = new URLSearchParams()
      if (options?.page) params.append("page", options.page.toString())
      if (options?.limit) params.append("limit", options.limit.toString())
      if (options?.sortBy) params.append("sortBy", options.sortBy)
      if (options?.sortOrder) params.append("sortOrder", options.sortOrder)

      return this.request<CryptoWallet[]>(`/api/accounts/crypto?${params}`)
    },

    getById: (id: string) => this.request<CryptoWallet>(`/api/accounts/crypto/${id}`),

    getByUserId: (userId: string) => {
      const params = new URLSearchParams({ userId })
      return this.request<CryptoWallet[]>(`/api/accounts/crypto?${params}`)
    },

    create: (wallet: Omit<CryptoWallet, "_id" | "createdAt" | "updatedAt">) =>
      this.request<CryptoWallet>("/api/accounts/crypto", {
        method: "POST",
        body: JSON.stringify(wallet),
      }),

    update: (id: string, updates: Partial<CryptoWallet>) =>
      this.request<CryptoWallet>(`/api/accounts/crypto/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      }),

    delete: (id: string) =>
      this.request<boolean>(`/api/accounts/crypto/${id}`, {
        method: "DELETE",
      }),
  }

    // 📌 Ressource Binance Accounts
  binanceAccounts = {
    getAll: (options?: PaginationOptions) => {
      const params = new URLSearchParams();
      if (options?.page) params.append("page", options.page.toString());
      if (options?.limit) params.append("limit", options.limit.toString());
      if (options?.sortBy) params.append("sortBy", options.sortBy);
      if (options?.sortOrder) params.append("sortOrder", options.sortOrder);

      return this.request<BinanceAccount[]>(`/api/accounts/crypto/binance?${params}`);
    },

    getById: (id: string) => this.request<BinanceAccount>(`/api/accounts/crypto/binance/${id}`),

    getByUserId: (userId: string) => {
      const params = new URLSearchParams({ userId });
      return this.request<BinanceAccount[]>(`/api/accounts/crypto/binance?${params}`);
    },

    create: (account: Omit<BinanceAccount, "_id" | "createdAt" | "updatedAt">) =>
      this.request<BinanceAccount>("/api/accounts/crypto/binance", {
        method: "POST",
        body: JSON.stringify(account),
      }),

    update: (id: string, updates: Partial<BinanceAccount>) =>
      this.request<BinanceAccount>(`/api/accounts/crypto/binance/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      }),

    delete: (id: string) =>
      this.request<boolean>(`/api/accounts/crypto/binance/${id}`, {
        method: "DELETE",
      }),
  }
}

export const apiClient = new ApiClient()