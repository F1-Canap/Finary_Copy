const BASE_URL = "https://bankaccountdata.gocardless.com/api/v2/"

interface TokenResponse {
  access: string
  refresh: string
  access_expires: number
}

interface Agreement {
  id: string
  institution_id: string
  created: string
  max_historical_days: string
  access_valid_for_days: string
  access_scope: string[]
}

interface Requisition {
  id: string
  link: string
  status: string
  accounts: string[]
  institution_id: string
  agreement: string
  reference: string
  created: string
}

interface AccountDetails {
  account: {
    iban?: string
    name?: string
    product?: string
    currency?: string
  }
}

interface Balance {
  balanceAmount: {
    amount: string
    currency: string
  }
  balanceType: string
}

interface Transaction {
  transactionId: string
  bookingDate: string
  transactionAmount: {
    amount: string
    currency: string
  }
  remittanceInformationUnstructured?: string
}

interface AccountSummary {
  id: string
  name: string
  type: "investment" | "savings" | "checking"
  iban?: string
  currency: string
  balance: number
  status?: "ready" | "processing"
  lastUpdated: string
}

class GoCardlessService {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private tokenExpiry: number | null = null

  async authenticate(forceRefresh = false): Promise<TokenResponse> {
    if (!forceRefresh && this.accessToken && this.tokenExpiry && this.tokenExpiry > Date.now()) {
      return {
        access: this.accessToken,
        refresh: this.refreshToken!,
        access_expires: Math.floor((this.tokenExpiry - Date.now()) / 1000),
      }
    }

    const response = await fetch(`${BASE_URL}token/new/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret_id: process.env.NORDIGEN_SECRET_ID,
        secret_key: process.env.NORDIGEN_SECRET_KEY,
      }),
    })

    if (!response.ok) {
      throw new Error("Authentication failed")
    }

    const data: TokenResponse = await response.json()
    this.accessToken = data.access
    this.refreshToken = data.refresh
    this.tokenExpiry = Date.now() + data.access_expires * 1000

    return data
  }

  async refreshAccessToken(): Promise<TokenResponse> {
    if (!this.refreshToken) {
      return this.authenticate(true)
    }

    const response = await fetch(`${BASE_URL}token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: this.refreshToken }),
    })

    if (!response.ok) {
      return this.authenticate(true)
    }

    const data: TokenResponse = await response.json()
    this.accessToken = data.access
    this.tokenExpiry = Date.now() + data.access_expires * 1000

    return data
  }

  async getValidToken(): Promise<string> {
    if (!this.accessToken || (this.tokenExpiry && this.tokenExpiry <= Date.now())) {
      if (this.refreshToken) {
        await this.refreshAccessToken()
      } else {
        await this.authenticate()
      }
    }
    return this.accessToken!
  }

  async createAgreement(institutionId: string): Promise<Agreement> {
    const token = await this.getValidToken()

    const response = await fetch(`${BASE_URL}agreements/enduser/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        institution_id: institutionId,
        max_historical_days: "90",
        access_valid_for_days: "30",
        access_scope: ["balances", "details", "transactions"],
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create agreement")
    }

    return response.json()
  }

  async createRequisition(institutionId: string, agreementId: string, userLanguage = "FR"): Promise<Requisition> {
    const token = await this.getValidToken()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    const response = await fetch(`${BASE_URL}requisitions/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        redirect: `${baseUrl}/accounts/bank/success`,
        institution_id: institutionId,
        agreement: agreementId,
        reference: `dashboard-${Date.now()}`,
        user_language: userLanguage,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create requisition")
    }

    return response.json()
  }

  async getRequisitionStatus(requisitionId: string): Promise<Requisition> {
    const token = await this.getValidToken()

    const response = await fetch(`${BASE_URL}requisitions/${requisitionId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      throw new Error("Failed to get requisition status")
    }

    return response.json()
  }

  async getAccountDetails(accountId: string): Promise<AccountDetails> {
    const token = await this.getValidToken()

    const response = await fetch(`${BASE_URL}accounts/${accountId}/details/`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      throw new Error("Failed to get account details")
    }

    return response.json()
  }

  async getAccountBalances(
    accountId: string,
  ): Promise<{ balances: Balance[] } | { status: "processing"; error: string }> {
    const token = await this.getValidToken()

    const response = await fetch(`${BASE_URL}accounts/${accountId}/balances/`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (response.status === 409) {
      const errorData = await response.json()
      return {
        status: "processing" as const,
        error: errorData.detail || "Account is still processing",
      }
    }

    if (!response.ok) {
      throw new Error("Failed to get account balances")
    }

    return response.json()
  }

  async getAccountTransactions(
    accountId: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<{ transactions: { booked: Transaction[]; pending: Transaction[] } }> {
    const token = await this.getValidToken()

    let url = `${BASE_URL}accounts/${accountId}/transactions/`
    const params = new URLSearchParams()

    if (dateFrom) params.append("date_from", dateFrom)
    if (dateTo) params.append("date_to", dateTo)

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      throw new Error("Failed to get account transactions")
    }

    return response.json()
  }

  async getAccountsSummary(requisitionId: string) {
    const requisitionData = await this.getRequisitionStatus(requisitionId)
    const accountIds = requisitionData.accounts

    const accountsData = await Promise.all(
      accountIds.map(async (accountId) => {
        try {
          const [details, balancesResponse] = await Promise.all([
            this.getAccountDetails(accountId),
            this.getAccountBalances(accountId),
          ])

          if ("status" in balancesResponse && balancesResponse.status === "processing") {
            const accountInfo = details.account
            const accountName = accountInfo.name || accountInfo.product || "Compte"
            const accountType = this.determineAccountType(accountName)

            return {
              id: accountId,
              name: accountName,
              type: accountType,
              iban: accountInfo.iban,
              currency: accountInfo.currency || "EUR",
              balance: 0,
              status: "processing" as const,
              lastUpdated: new Date().toISOString(),
            }
          }

          const balances = balancesResponse as { balances: Balance[] }
          const accountInfo = details.account
          const balance = balances.balances[0]

          const accountName = accountInfo.name || accountInfo.product || "Compte"
          const accountType = this.determineAccountType(accountName)

          return {
            id: accountId,
            name: accountName,
            type: accountType,
            iban: accountInfo.iban,
            currency: balance?.balanceAmount?.currency || "EUR",
            balance: Number.parseFloat(balance?.balanceAmount?.amount || "0"),
            status: "ready" as const,
            lastUpdated: new Date().toISOString(),
          }
        } catch (error) {
          console.error(`Error fetching account ${accountId}:`, error)
          return null
        }
      }),
    )

    return accountsData.filter((account) => account !== null)
  }

  determineAccountType(name: string): "investment" | "savings" | "checking" {
    const nameLower = name.toLowerCase()

    if (
      nameLower.includes("pea") ||
      nameLower.includes("titres") ||
      nameLower.includes("invest") ||
      nameLower.includes("bourse")
    ) {
      return "investment"
    } else if (nameLower.includes("livret") || nameLower.includes("epargne")) {
      return "savings"
    } else {
      return "checking"
    }
  }
}

export const gocardless = new GoCardlessService()
export type { Requisition, AccountDetails, Balance, Transaction, AccountSummary }
