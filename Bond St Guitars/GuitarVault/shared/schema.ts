import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const guitars = pgTable("guitars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  type: text("type").notNull(), // electric, acoustic, classical, bass
  year: integer("year").notNull(),
  condition: text("condition").notNull(), // new, excellent, good, fair
  color: text("color").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  pickupLocation: text("pickup_location").notNull(),
  description: text("description"),
  status: text("status").notNull().default("available"), // available, reserved, sold
  imageUrl: text("image_url"), // primary image
  imageUrls: text("image_urls").array().default([]), // additional images
});

export const insertGuitarSchema = createInsertSchema(guitars).omit({
  id: true,
}).extend({
  price: z.coerce.number().min(0, "Price must be positive"),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  type: z.enum(["electric", "acoustic", "classical", "bass"]),
  condition: z.enum(["new", "excellent", "good", "fair"]),
  status: z.enum(["available", "reserved", "sold"]).default("available"),
});

export type InsertGuitar = z.infer<typeof insertGuitarSchema>;
export type Guitar = typeof guitars.$inferSelect;
