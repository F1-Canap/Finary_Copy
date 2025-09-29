import { getDatabase } from "@/lib/mongodb"
import type { DatabaseResponse, PaginationOptions, User } from "@/types/database"
import { ObjectId } from "mongodb"

export class UserService {
  private static readonly COLLECTION_NAME = "users"

  // 📌 Créer un utilisateur
  static async create(user: Omit<User, "_id" | "createdAt" | "updatedAt">): Promise<DatabaseResponse<User>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<User>(this.COLLECTION_NAME)

      // Vérifier si un utilisateur avec le même email existe déjà
      const existingUser = await collection.findOne({ email: user.email })
      if (existingUser) {
        return { success: false, error: "Un utilisateur avec cet email existe déjà" }
      }

      const now = new Date()

      const result = await collection.insertOne({
        ...user,
        createdAt: now,
        updatedAt: now,
      })

      if (result.acknowledged) {
        const createdUser = await collection.findOne({ _id: result.insertedId })
        if (!createdUser) {
          return { success: false, error: "Utilisateur introuvable après création" }
        }

        return { success: true, data: { ...createdUser, _id: createdUser._id.toString() } }
      }

      return { success: false, error: "Échec de la création de l'utilisateur" }
    } catch (error) {
      return { success: false, error: `Erreur lors de la création: ${error}` }
    }
  }

  // 📌 Trouver par ID
  static async findById(_id: string): Promise<DatabaseResponse<User>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<User>(this.COLLECTION_NAME)
      const user = await collection.findOne({ _id: new ObjectId(_id) })
      if (user) {
        return { success: true, data: { ...user, _id: user._id.toString() } }
      }

      return { success: false, error: "Utilisateur non trouvé" }
    } catch (error) {
      return { success: false, error: `Erreur lors de la recherche: ${error}` }
    }
  }

  // 📌 Trouver par email
  static async findByEmail(email: string): Promise<DatabaseResponse<User>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<User>(this.COLLECTION_NAME)

      const user = await collection.findOne({ email })
      if (user) {
        return { success: true, data: { ...user, _id: user._id.toString() } }
      }

      return { success: false, error: "Utilisateur non trouvé" }
    } catch (error) {
      return { success: false, error: `Erreur lors de la recherche par email: ${error}` }
    }
  }

  // 📌 Lister avec pagination
  static async findAll(options?: PaginationOptions): Promise<DatabaseResponse<User[]>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<User>(this.COLLECTION_NAME)

      const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = options || {}
      const skip = (page - 1) * limit

      const users = await collection
        .find({})
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .toArray()

      return {
        success: true,
        data: users.map((user) => ({ ...user, _id: user._id.toString() })),
      }
    } catch (error) {
      return { success: false, error: `Erreur lors de la recherche: ${error}` }
    }
  }

  // 📌 Mettre à jour
  static async update(id: string, updates: Partial<User>): Promise<DatabaseResponse<User>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<User>(this.COLLECTION_NAME)

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...updates, updatedAt: new Date() } },
        { returnDocument: "after" },
      )

      if (!result) {
        return { success: false, error: "Utilisateur non trouvé" }
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
      const collection = db.collection<User>(this.COLLECTION_NAME)

      const result = await collection.deleteOne({ _id: new ObjectId(id) })

      return { success: result.deletedCount > 0, data: result.deletedCount > 0 }
    } catch (error) {
      return { success: false, error: `Erreur lors de la suppression: ${error}` }
    }
  }
}
