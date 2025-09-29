import { ObjectId } from "mongodb"

export interface DatabaseResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface User {
  _id?: string | ObjectId
  name:string,
  email: string,
  password: string | null // hashed password
  createdAt: Date
  updatedAt: Date
}

export interface CryptoWallet{
  _id?: string | ObjectId
  userId: string | ObjectId
  address: string
  chain: string // e.g., "ethereum", "bitcoin"
  balances: Record<string, number> // { "ETH": 0.5, "USDT": 100 }
  createdAt: Date
  updatedAt: Date
}