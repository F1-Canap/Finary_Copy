// requisition.service.ts
import { getDatabase } from "@/lib/mongodb"
import type { DatabaseResponse, PaginationOptions, Requisition } from "@/types/database"
import { ObjectId } from "mongodb"

export class BankRequisitionService {
  private static readonly COLLECTION_NAME = "requisition"

  // 📌 Créer une réquisition
  static async create(requisition: Omit<Requisition, "_id" | "createdAt" | "updatedAt">): Promise<DatabaseResponse<Requisition>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<Requisition>(this.COLLECTION_NAME)

      // Vérifier si une réquisition avec le même requisitionID existe déjà
      const existingRequisition = await collection.findOne({ requisitionID: requisition.requisitionID })
      if (existingRequisition) {
        return { success: false, error: "Une réquisition avec ce requisitionID existe déjà" }
      }

      const now = new Date()

      const result = await collection.insertOne({
        ...requisition,
        createdAt: now,
        updatedAt: now,
      })

      if (result.acknowledged) {
        const createdRequisition = await collection.findOne({ _id: result.insertedId })
        if (!createdRequisition) {
          return { success: false, error: "Réquisition introuvable après création" }
        }

        return { success: true, data: { ...createdRequisition, _id: createdRequisition._id.toString() } }
      }

      return { success: false, error: "Échec de la création de la réquisition" }
    } catch (error) {
      return { success: false, error: `Erreur lors de la création: ${error}` }
    }
  }

  // 📌 Trouver par ID
  static async findById(_id: string): Promise<DatabaseResponse<Requisition>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<Requisition>(this.COLLECTION_NAME)

      const requisition = await collection.findOne({ _id: new ObjectId(_id) })
      if (requisition) {
        return { success: true, data: { ...requisition, _id: requisition._id.toString() } }
      }

      return { success: false, error: "Réquisition non trouvée" }
    } catch (error) {
      return { success: false, error: `Erreur lors de la recherche: ${error}` }
    }
  }

  // 📌 Trouver par userId
  static async findByUserId(userId: string): Promise<DatabaseResponse<Requisition[]>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<Requisition>(this.COLLECTION_NAME)

      const requisitions = await collection.find({ userId }).toArray()

      return {
        success: true,
        data: requisitions.map((r) => ({ ...r, _id: r._id.toString() })),
      }
    } catch (error) {
      return { success: false, error: `Erreur lors de la recherche par userId: ${error}` }
    }
  }

  // 📌 Lister avec pagination
  static async findAll(options?: PaginationOptions): Promise<DatabaseResponse<Requisition[]>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<Requisition>(this.COLLECTION_NAME)

      const { page = 1, limit = 50, sortBy = "createdAt", sortOrder = "desc" } = options || {}
      const skip = (page - 1) * limit

      const requisitions = await collection
        .find({})
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .toArray()

      return {
        success: true,
        data: requisitions.map((r) => ({ ...r, _id: r._id.toString() })),
      }
    } catch (error) {
      return { success: false, error: `Erreur lors de la recherche: ${error}` }
    }
  }

  // 📌 Mettre à jour
  static async update(id: string, updates: Partial<Requisition>): Promise<DatabaseResponse<Requisition>> {
    try {
      const db = await getDatabase()
      const collection = db.collection<Requisition>(this.COLLECTION_NAME)

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...updates, updatedAt: new Date() } },
        { returnDocument: "after" },
      )

      if (!result) {
        return { success: false, error: "Réquisition non trouvée" }
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
      const collection = db.collection<Requisition>(this.COLLECTION_NAME)

      const result = await collection.deleteOne({ _id: new ObjectId(id) })

      return { success: result.deletedCount > 0, data: result.deletedCount > 0 }
    } catch (error) {
      return { success: false, error: `Erreur lors de la suppression: ${error}` }
    }
  }
}
