import { getDatabase } from "@/lib/mongodb"
import type { CryptoWallet, DatabaseResponse, PaginationOptions } from "@/types/database"
import { ObjectId } from "mongodb"

export class CryptoWalletService {
  private static readonly COLLECTION_NAME = "crypto_wallets"

  // 📌 Créer un wallet
  static async create(wallet: Omit<CryptoWallet, "_id" | "createdAt" | "updatedAt">): Promise<DatabaseResponse<CryptoWallet>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<CryptoWallet>(this.COLLECTION_NAME)

      // Vérifier si un wallet avec la même address et la même chain existe déjà
      const existingWallet = await collection.findOne({ address: wallet.address, chain: wallet.chain })
      if (existingWallet) {
        return { success: false, error: "Un wallet avec cette adresse et cette blockchain existe déjà" }
      }

      const now = new Date()

      const result = await collection.insertOne({
        ...wallet,
        createdAt: now,
        updatedAt: now,
      })

      if (result.acknowledged) {
        const createdWallet = await collection.findOne({ _id: result.insertedId })
        if (!createdWallet) {
          return { success: false, error: "Wallet introuvable après création" }
        }

        return { success: true, data: { ...createdWallet, _id: createdWallet._id.toString() } }
      }

      return { success: false, error: "Échec de la création du wallet" }
    } catch (error) {
      return { success: false, error: `Erreur lors de la création: ${error}` }
    }
  }

  // 📌 Trouver par ID
  static async findById(_id: string): Promise<DatabaseResponse<CryptoWallet>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<CryptoWallet>(this.COLLECTION_NAME)

      const wallet = await collection.findOne({ _id: new ObjectId(_id) })
      if (wallet) {
        return { success: true, data: { ...wallet, _id: wallet._id.toString() } }
      }

      return { success: false, error: "Wallet non trouvé" }
    } catch (error) {
      return { success: false, error: `Erreur lors de la recherche: ${error}` }
    }
  }

  // 📌 Trouver par userId
  static async findByUserId(userId: string): Promise<DatabaseResponse<CryptoWallet[]>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<CryptoWallet>(this.COLLECTION_NAME)

      const wallets = await collection.find({ userId: new ObjectId(userId) }).toArray()

      return {
        success: true,
        data: wallets.map((wallet) => ({ ...wallet, _id: wallet._id.toString() })),
      }
    } catch (error) {
      return { success: false, error: `Erreur lors de la recherche par userId: ${error}` }
    }
  }

  // 📌 Lister avec pagination
  static async findAll(options?: PaginationOptions): Promise<DatabaseResponse<CryptoWallet[]>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<CryptoWallet>(this.COLLECTION_NAME)

      const { page = 1, limit = 99999, sortBy = "createdAt", sortOrder = "desc" } = options || {}
      const skip = (page - 1) * limit

      const wallets = await collection
        .find({})
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .toArray()

      return {
        success: true,
        data: wallets.map((wallet) => ({ ...wallet, _id: wallet._id.toString() })),
      }
    } catch (error) {
      return { success: false, error: `Erreur lors de la recherche: ${error}` }
    }
  }

  // 📌 Mettre à jour
  static async update(id: string, updates: Partial<CryptoWallet>): Promise<DatabaseResponse<CryptoWallet>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<CryptoWallet>(this.COLLECTION_NAME)

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...updates, updatedAt: new Date() } },
        { returnDocument: "after" },
      )

      if (!result) {
        return { success: false, error: "Wallet non trouvé" }
      }

      return { success: true, data: { ...result, _id: result._id.toString() } }
    } catch (error) {
      return { success: false, error: `Erreur lors de la mise à jour: ${error}` }
    }
  }

  // 📌 Supprimer
  static async delete(id: string): Promise<DatabaseResponse<boolean>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<CryptoWallet>(this.COLLECTION_NAME)

      const result = await collection.deleteOne({ _id: new ObjectId(id) })

      return { success: result.deletedCount > 0, data: result.deletedCount > 0 }
    } catch (error) {
      return { success: false, error: `Erreur lors de la suppression: ${error}` }
    }
  }
}