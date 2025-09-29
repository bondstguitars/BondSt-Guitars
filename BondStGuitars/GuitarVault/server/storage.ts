import { type Guitar, type InsertGuitar, guitars } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, or, ilike } from "drizzle-orm";

export interface IStorage {
  getGuitar(id: string): Promise<Guitar | undefined>;
  getAllGuitars(): Promise<Guitar[]>;
  createGuitar(guitar: InsertGuitar): Promise<Guitar>;
  updateGuitar(id: string, updates: Partial<InsertGuitar>): Promise<Guitar | undefined>;
  deleteGuitar(id: string): Promise<boolean>;
  searchGuitars(query: string): Promise<Guitar[]>;
  filterGuitars(filters: {
    type?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
  }): Promise<Guitar[]>;
}

export class DatabaseStorage implements IStorage {
  async getGuitar(id: string): Promise<Guitar | undefined> {
    const [guitar] = await db.select().from(guitars).where(eq(guitars.id, id));
    return guitar || undefined;
  }

  async getAllGuitars(): Promise<Guitar[]> {
    return await db.select().from(guitars);
  }

  async createGuitar(insertGuitar: InsertGuitar): Promise<Guitar> {
    const [guitar] = await db
      .insert(guitars)
      .values({
        ...insertGuitar,
        price: insertGuitar.price.toString(),
        imageUrls: insertGuitar.imageUrls || [],
      })
      .returning();
    return guitar;
  }

  async updateGuitar(id: string, updates: Partial<InsertGuitar>): Promise<Guitar | undefined> {
    const updateData: any = { ...updates };
    if (updates.price !== undefined) {
      updateData.price = updates.price;
    }
    
    const [updated] = await db
      .update(guitars)
      .set(updateData)
      .where(eq(guitars.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteGuitar(id: string): Promise<boolean> {
    const result = await db.delete(guitars).where(eq(guitars.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async searchGuitars(query: string): Promise<Guitar[]> {
    const searchPattern = `%${query}%`;
    return await db
      .select()
      .from(guitars)
      .where(
        or(
          ilike(guitars.brand, searchPattern),
          ilike(guitars.model, searchPattern),
          ilike(guitars.color, searchPattern),
          ilike(guitars.description, searchPattern)
        )
      );
  }

  async filterGuitars(filters: {
    type?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
  }): Promise<Guitar[]> {
    const conditions = [];
    
    if (filters.type) {
      conditions.push(eq(guitars.type, filters.type));
    }
    if (filters.brand) {
      conditions.push(eq(guitars.brand, filters.brand));
    }
    if (filters.status) {
      conditions.push(eq(guitars.status, filters.status));
    }
    if (filters.minPrice !== undefined) {
      conditions.push(gte(guitars.price, filters.minPrice.toString()));
    }
    if (filters.maxPrice !== undefined) {
      conditions.push(lte(guitars.price, filters.maxPrice.toString()));
    }
    
    if (conditions.length === 0) {
      return await db.select().from(guitars);
    }
    
    return await db
      .select()
      .from(guitars)
      .where(and(...conditions));
  }
}

export const storage = new DatabaseStorage();
