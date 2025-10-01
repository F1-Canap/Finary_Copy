// account.service.ts
import { getDatabase } from "@/lib/mongodb"
import type { Account, DatabaseResponse, PaginationOptions } from "@/types/database"
import { ObjectId } from "mongodb"

export class BankAccountService {
  private static readonly COLLECTION_NAME = "bankAccounts"

  // 📌 Créer un compte
  static async create(account: Omit<Account, "_id" | "createdAt" | "updatedAt">): Promise<DatabaseResponse<Account>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<Account>(this.COLLECTION_NAME)

      // Vérifier si un compte avec le même IBAN existe déjà (si IBAN renseigné)
      if (account.iban) {
        const existingAccount = await collection.findOne({ iban: account.iban, userId: account.userId })
        if (existingAccount) {
          return { success: false, error: "Un compte avec cet IBAN existe déjà pour cet utilisateur" }
        }
      }

      const now = new Date()

      const result = await collection.insertOne({
        ...account,
        createdAt: now,
        updatedAt: now,
      })

      if (result.acknowledged) {
        const createdAccount = await collection.findOne({ _id: result.insertedId })
        if (!createdAccount) {
          return { success: false, error: "Compte introuvable après création" }
        }

        return { success: true, data: { ...createdAccount, _id: createdAccount._id.toString() } }
      }

      return { success: false, error: "Échec de la création du compte" }
    } catch (error) {
      return { success: false, error: `Erreur lors de la création: ${error}` }
    }
  }

  // 📌 Trouver par ID
  static async findById(_id: string): Promise<DatabaseResponse<Account>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<Account>(this.COLLECTION_NAME)

      const account = await collection.findOne({ _id: new ObjectId(_id) })
      if (account) {
        return { success: true, data: { ...account, _id: account._id.toString() } }
      }

      return { success: false, error: "Compte non trouvé" }
    } catch (error) {
      return { success: false, error: `Erreur lors de la recherche: ${error}` }
    }
  }

  // 📌 Trouver par userId
  static async findByUserId(userId: string): Promise<DatabaseResponse<Account[]>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<Account>(this.COLLECTION_NAME)

      const accounts = await collection.find({ userId }).toArray()

      return {
        success: true,
        data: accounts.map((account) => ({ ...account, _id: account._id.toString() })),
      }
    } catch (error) {
      return { success: false, error: `Erreur lors de la recherche par userId: ${error}` }
    }
  }

  // 📌 Lister avec pagination
  static async findAll(options?: PaginationOptions): Promise<DatabaseResponse<Account[]>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<Account>(this.COLLECTION_NAME)

      const { page = 1, limit = 99999, sortBy = "createdAt", sortOrder = "desc" } = options || {}
      const skip = (page - 1) * limit

      const accounts = await collection
        .find({})
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .toArray()

      return {
        success: true,
        data: accounts.map((account) => ({ ...account, _id: account._id.toString() })),
      }
    } catch (error) {
      return { success: false, error: `Erreur lors de la recherche: ${error}` }
    }
  }

  // 📌 Mettre à jour
  static async update(id: string, updates: Partial<Account>): Promise<DatabaseResponse<Account>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<Account>(this.COLLECTION_NAME)

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...updates, updatedAt: new Date() } },
        { returnDocument: "after" },
      )

      if (!result) {
        return { success: false, error: "Compte non trouvé" }
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
      const collection = db.collection<Account>(this.COLLECTION_NAME)

      const result = await collection.deleteOne({ _id: new ObjectId(id) })

      return { success: result.deletedCount > 0, data: result.deletedCount > 0 }
    } catch (error) {
      return { success: false, error: `Erreur lors de la suppression: ${error}` }
    }
  }
}
