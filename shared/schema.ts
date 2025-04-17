import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User types
export const userTypes = {
  FARMER: "farmer",
  VENDOR: "vendor",
} as const;

// Order statuses
export const orderStatuses = {
  NEGOTIATION: "negotiation",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

// Negotiation statuses
export const negotiationStatuses = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  COUNTERED: "countered",
} as const;

// Schema definitions
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  userType: text("user_type").notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  licenseUrl: text("license_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const produce = pgTable("produce", {
  id: serial("id").primaryKey(),
  farmerId: integer("farmer_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  pricePerKg: doublePrecision("price_per_kg").notNull(),
  minOrderQuantity: integer("min_order_quantity").notNull(),
  availableQuantity: integer("available_quantity").notNull(),
  totalQuantity: integer("total_quantity").notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  produceId: integer("produce_id").notNull(),
  price: doublePrecision("price").notNull(),
  date: timestamp("date").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  produceId: integer("produce_id").notNull(),
  vendorId: integer("vendor_id").notNull(),
  farmerId: integer("farmer_id").notNull(),
  quantity: integer("quantity").notNull(),
  pricePerKg: doublePrecision("price_per_kg").notNull(),
  totalAmount: doublePrecision("total_amount").notNull(),
  status: text("status").notNull().default(orderStatuses.NEGOTIATION),
  commissionAmount: doublePrecision("commission_amount"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const negotiations = pgTable("negotiations", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  round: integer("round").notNull(),
  vendorId: integer("vendor_id").notNull(),
  farmerId: integer("farmer_id").notNull(),
  offeredPrice: doublePrecision("offered_price").notNull(),
  status: text("status").notNull().default(negotiationStatuses.PENDING),
  message: text("message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  reviewerId: integer("reviewer_id").notNull(),
  revieweeId: integer("reviewee_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insertion schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProduceSchema = createInsertSchema(produce).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPriceHistorySchema = createInsertSchema(priceHistory).omit({
  id: true,
  date: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  commissionAmount: true,
}).partial({
  farmerId: true,
  pricePerKg: true,
  totalAmount: true
});

export const insertNegotiationSchema = createInsertSchema(negotiations).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Zod schemas extensions for form validation
export const registerUserSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

export type Produce = typeof produce.$inferSelect;
export type InsertProduce = z.infer<typeof insertProduceSchema>;

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Negotiation = typeof negotiations.$inferSelect;
export type InsertNegotiation = z.infer<typeof insertNegotiationSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
