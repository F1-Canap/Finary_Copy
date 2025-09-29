// Standard type returned by each adapter
export interface Results {
  status_ok: boolean,
  chain: string,
  address: string, 
  balances?: Record<string, number> | { token: string; amount: number }[]
  error?: unknown
}

// Shape of any chain adapter module
export interface ChainAdapter {
  getBalances(address: string): Promise<Results>
}
