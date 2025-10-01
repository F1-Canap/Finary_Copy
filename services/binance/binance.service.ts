import { getDatabase } from "@/lib/mongodb"
import type { BinanceAccount, DatabaseResponse, PaginationOptions } from "@/types/database"
import { ObjectId } from "mongodb"
import { encrypt, decrypt } from "./binance.encrypt"
import crypto from "crypto"

export class BinanceService {
  private static readonly COLLECTION_NAME = "binance_accounts"
  private static readonly BINANCE_API_URL = "https://api.binance.com"

  // 📌 Helper: Create hash of API key for duplicate detection
  private static hashApiKey(apiKey: string): string {
    return crypto.createHash("sha256").update(apiKey).digest("hex")
  }

  // 📌 Helper: Create HMAC signature for Binance API
  private static createSignature(queryString: string, secretKey: string): string {
    return crypto
      .createHmac("sha256", secretKey)
      .update(queryString)
      .digest("hex")
  }

  // 📌 Helper: Fetch Binance account info + balances
  private static async fetchBinanceAccount(
    apiKey: string,
    secretKey: string
  ): Promise<{ uid: string; balances: Array<{ asset: string; free: string; locked: string }> }> {
    try {
      const timestamp = Date.now()
      const queryString = `timestamp=${timestamp}`
      const signature = this.createSignature(queryString, secretKey)

      // 1️⃣ Get account information (includes balances)
      const accountUrl = `${this.BINANCE_API_URL}/api/v3/account?${queryString}&signature=${signature}`
      
      const accountResponse = await fetch(accountUrl, {
        method: "GET",
        headers: {
          "X-MBX-APIKEY": apiKey,
        },
      })

      if (!accountResponse.ok) {
        const errorText = await accountResponse.text()
        throw new Error(`Binance API error: ${accountResponse.status} - ${errorText}`)
      }

      const accountData = await accountResponse.json()

      // 2️⃣ Extract UID directly from account data
      const uid = accountData.uid ? accountData.uid.toString() : ""

      if (!uid) {
        throw new Error("UID not found in Binance account data")
      }

      const balances = accountData.balances || []

      // Remove "LD" prefix from locked staking tokens
      for (const balance of balances) {
        if (balance.asset.startsWith("LD")) {
          balance.asset = balance.asset.slice(2)
        }
      }  

      return {
        uid,
        balances: balances,
      }
    } catch (error) {
      throw new Error(`Failed to fetch Binance account: ${error}`)
    }
  }

  // 📌 Helper: Parse balances to Record<string, number>
  private static parseBalances(
    balances: Array<{ asset: string; free: string; locked: string }>
  ): Record<string, number> {
    const tokens: Record<string, number> = {}

    for (const balance of balances) {
      const total = parseFloat(balance.free) + parseFloat(balance.locked)
      // Only include tokens with balance > 0
      if (total > 0) {
        tokens[balance.asset] = total
      }
    }

    return tokens
  }

  // 📌 Créer un compte Binance (REAL IMPLEMENTATION)
  static async create(account: {
    api_key: string
    secret_key: string
    userId: string
  }): Promise<DatabaseResponse<BinanceAccount>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<BinanceAccount>(this.COLLECTION_NAME)

      // 1️⃣ Vérifier doublon avec le hash de l'API key (plus efficace)
      const apiKeyHash = this.hashApiKey(account.api_key)
      
      const existing = await collection.findOne({
        userId: new ObjectId(account.userId),
        api_key_hash: apiKeyHash,
      })
      
      if (existing) {
        return { success: false, error: "Ce compte Binance est déjà enregistré" }
      }

      // 2️⃣ Appel RÉEL à l'API Binance pour récupérer balances + UID
      let binanceData: { 
        uid: string; 
        balances: Array<{ asset: string; free: string; locked: string }>
      }
      
      try {
        binanceData = await this.fetchBinanceAccount(account.api_key, account.secret_key)
      } catch (apiError) {
        // Si l'API Binance échoue, on retourne une erreur claire
        return {
          success: false,
          error: `Échec de la connexion à Binance: ${apiError instanceof Error ? apiError.message : String(apiError)}`,
        }
      }

      // 3️⃣ Parser les balances
      const tokens = this.parseBalances(binanceData.balances)

      // 4️⃣ Insérer dans la base de données
      const now = new Date()

      const result = await collection.insertOne({
        userId: new ObjectId(account.userId),
        api_key: encrypt(account.api_key),
        api_key_hash: apiKeyHash, 
        secret_key: encrypt(account.secret_key),
        uid: binanceData.uid,
        balances: tokens,
        createdAt: now,
        updatedAt: now,
      })

      if (!result.acknowledged) {
        return { success: false, error: "Échec de l'insertion du compte Binance" }
      }

      // 5️⃣ Récupérer le document créé
      const created = await collection.findOne({ _id: result.insertedId })
      
      if (!created) {
        return { success: false, error: "Compte introuvable après création" }
      }

      return {
        success: true,
        data: {
          ...created,
          _id: created._id.toString(),
          // Ne pas retourner les clés chiffrées ni le hash
          api_key: null,
          secret_key: null,
        },
      }
    } catch (error) {
      console.error("❌ BinanceService.create error:", error)
      return {
        success: false,
        error: `Erreur lors de la création: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  // 📌 Trouver par userId
  static async findByUserId(userId: string): Promise<DatabaseResponse<BinanceAccount[]>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<BinanceAccount>(this.COLLECTION_NAME)

      const accounts = await collection.find({ userId: new ObjectId(userId) }).toArray()

      return {
        success: true,
        data: accounts.map((acc) => ({
          ...acc,
          _id: acc._id.toString(),
          // ⚠️ Masquer les clés
          api_key: null,
          secret_key: null,
        })),
      }
    } catch (error) {
      return { success: false, error: `Erreur lors de la recherche par userId: ${error}` }
    }
  }

  // 📌 Mettre à jour les balances d'un compte existant
  static async refreshBalances(accountId: string): Promise<DatabaseResponse<BinanceAccount>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<BinanceAccount>(this.COLLECTION_NAME)

      // 1️⃣ Récupérer le compte
      const account = await collection.findOne({ _id: new ObjectId(accountId) })
      
      if (!account || !account.api_key || !account.secret_key) {
        return { success: false, error: "Compte introuvable ou clés manquantes" }
      }

      // 2️⃣ Décrypter les clés
      const decryptedApiKey = decrypt(account.api_key)
      const decryptedSecretKey = decrypt(account.secret_key)

      // 3️⃣ Récupérer les nouvelles balances depuis Binance
      const binanceData = await this.fetchBinanceAccount(decryptedApiKey, decryptedSecretKey)
      const tokens = this.parseBalances(binanceData.balances)

      // 4️⃣ Mettre à jour dans la DB
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(accountId) },
        {
          $set: {
            tokens,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" }
      )

      if (!result) {
        return { success: false, error: "Échec de la mise à jour" }
      }

      return {
        success: true,
        data: {
          ...result,
          _id: result._id.toString(),
          api_key: null,
          secret_key: null,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: `Erreur lors du rafraîchissement: ${error}`,
      }
    }
  }

  // 📌 Lister tous les comptes (admin/debug)
  static async findAll(options?: PaginationOptions): Promise<DatabaseResponse<BinanceAccount[]>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<BinanceAccount>(this.COLLECTION_NAME)

      const { page = 1, limit = 50, sortBy = "createdAt", sortOrder = "desc" } = options || {}
      const skip = (page - 1) * limit

      const accounts = await collection
        .find({})
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .toArray()

      return {
        success: true,
        data: accounts.map((acc) => ({
          ...acc,
          _id: acc._id.toString(),
          api_key: null,
          secret_key: null,
        })),
      }
    } catch (error) {
      return { success: false, error: `Erreur lors de la recherche: ${error}` }
    }
  }

  // 📌 Supprimer un compte Binance
  static async delete(id: string): Promise<DatabaseResponse<boolean>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<BinanceAccount>(this.COLLECTION_NAME)

      const result = await collection.deleteOne({ _id: new ObjectId(id) })

      return { success: result.deletedCount > 0, data: result.deletedCount > 0 }
    } catch (error) {
      return { success: false, error: `Erreur lors de la suppression: ${error}` }
    }
  }
}