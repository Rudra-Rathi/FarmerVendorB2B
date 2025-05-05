import {
  users, produce, priceHistory, orders, negotiations, reviews,
  type User, type InsertUser, type Produce, type InsertProduce,
  type PriceHistory, type InsertPriceHistory, type Order, type InsertOrder,
  type Negotiation, type InsertNegotiation, type Review, type InsertReview,
  orderStatuses, negotiationStatuses
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserVerification(id: number, isVerified: boolean): Promise<User | undefined>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  updateUserPassword(id: number, password: string): Promise<User>;
  
  // Produce methods
  getProduce(id: number): Promise<Produce | undefined>;
  getProduceByFarmerId(farmerId: number): Promise<Produce[]>;
  getAllActiveProduce(): Promise<Produce[]>;
  createProduce(produce: InsertProduce): Promise<Produce>;
  updateProduce(id: number, produce: Partial<Produce>): Promise<Produce | undefined>;
  
  // Price History methods
  getPriceHistoryByProduceId(produceId: number): Promise<PriceHistory[]>;
  createPriceHistory(priceHistory: InsertPriceHistory): Promise<PriceHistory>;
  
  // Order methods
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByFarmerId(farmerId: number): Promise<Order[]>;
  getOrdersByVendorId(vendorId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Negotiation methods
  getNegotiationsByOrderId(orderId: number): Promise<Negotiation[]>;
  createNegotiation(negotiation: InsertNegotiation): Promise<Negotiation>;
  updateNegotiationStatus(id: number, status: string): Promise<Negotiation | undefined>;
  
  // Review methods
  getReviewsByOrderId(orderId: number): Promise<Review[]>;
  getReviewsByRevieweeId(revieweeId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private produce: Map<number, Produce>;
  private priceHistory: Map<number, PriceHistory>;
  private orders: Map<number, Order>;
  private negotiations: Map<number, Negotiation>;
  private reviews: Map<number, Review>;
  
  private currentUserId: number;
  private currentProduceId: number;
  private currentPriceHistoryId: number;
  private currentOrderId: number;
  private currentNegotiationId: number;
  private currentReviewId: number;

  constructor() {
    this.users = new Map();
    this.produce = new Map();
    this.priceHistory = new Map();
    this.orders = new Map();
    this.negotiations = new Map();
    this.reviews = new Map();
    
    this.currentUserId = 1;
    this.currentProduceId = 1;
    this.currentPriceHistoryId = 1;
    this.currentOrderId = 1;
    this.currentNegotiationId = 1;
    this.currentReviewId = 1;
    
    // Add sample data for development
    this.addSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async updateUserVerification(id: number, isVerified: boolean): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, isVerified };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserPassword(id: number, password: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...user, password };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Produce methods
  async getProduce(id: number): Promise<Produce | undefined> {
    return this.produce.get(id);
  }

  async getProduceByFarmerId(farmerId: number): Promise<Produce[]> {
    return Array.from(this.produce.values()).filter(
      (produce) => produce.farmerId === farmerId,
    );
  }

  async getAllActiveProduce(): Promise<Produce[]> {
    return Array.from(this.produce.values()).filter(
      (produce) => produce.isActive,
    );
  }

  async createProduce(insertProduce: InsertProduce): Promise<Produce> {
    const id = this.currentProduceId++;
    const now = new Date();
    const produce: Produce = { 
      ...insertProduce, 
      id, 
      createdAt: now,
      updatedAt: now 
    };
    this.produce.set(id, produce);
    
    // Also create price history entry
    await this.createPriceHistory({
      produceId: id,
      price: insertProduce.pricePerKg,
    });
    
    return produce;
  }

  async updateProduce(id: number, updatedFields: Partial<Produce>): Promise<Produce | undefined> {
    const existingProduce = this.produce.get(id);
    if (!existingProduce) return undefined;
    
    const updatedProduce = { 
      ...existingProduce, 
      ...updatedFields,
      updatedAt: new Date() 
    };
    this.produce.set(id, updatedProduce);
    
    // If price changed, also create price history entry
    if (updatedFields.pricePerKg && updatedFields.pricePerKg !== existingProduce.pricePerKg) {
      await this.createPriceHistory({
        produceId: id,
        price: updatedFields.pricePerKg,
      });
    }
    
    return updatedProduce;
  }

  // Price History methods
  async getPriceHistoryByProduceId(produceId: number): Promise<PriceHistory[]> {
    return Array.from(this.priceHistory.values())
      .filter((history) => history.produceId === produceId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async createPriceHistory(insertPriceHistory: InsertPriceHistory): Promise<PriceHistory> {
    const id = this.currentPriceHistoryId++;
    const now = new Date();
    const priceHistory: PriceHistory = { 
      ...insertPriceHistory, 
      id, 
      date: now 
    };
    this.priceHistory.set(id, priceHistory);
    return priceHistory;
  }

  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByFarmerId(farmerId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter((order) => order.farmerId === farmerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getOrdersByVendorId(vendorId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter((order) => order.vendorId === vendorId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const now = new Date();
    const order: Order = { 
      ...insertOrder, 
      id, 
      commissionAmount: null,
      createdAt: now,
      updatedAt: now 
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    // Calculate commission if status is ACCEPTED
    let commissionAmount = order.commissionAmount;
    if (status === orderStatuses.ACCEPTED && !commissionAmount) {
      commissionAmount = order.totalAmount * 0.05; // 5% commission
    }
    
    const updatedOrder = { 
      ...order, 
      status, 
      commissionAmount,
      updatedAt: new Date() 
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Negotiation methods
  async getNegotiationsByOrderId(orderId: number): Promise<Negotiation[]> {
    return Array.from(this.negotiations.values())
      .filter((negotiation) => negotiation.orderId === orderId)
      .sort((a, b) => a.round - b.round);
  }

  async createNegotiation(insertNegotiation: InsertNegotiation): Promise<Negotiation> {
    const id = this.currentNegotiationId++;
    const now = new Date();
    const negotiation: Negotiation = { 
      ...insertNegotiation, 
      id, 
      createdAt: now 
    };
    this.negotiations.set(id, negotiation);
    return negotiation;
  }

  async updateNegotiationStatus(id: number, status: string): Promise<Negotiation | undefined> {
    const negotiation = this.negotiations.get(id);
    if (!negotiation) return undefined;
    
    const updatedNegotiation = { ...negotiation, status };
    this.negotiations.set(id, updatedNegotiation);
    return updatedNegotiation;
  }

  // Review methods
  async getReviewsByOrderId(orderId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.orderId === orderId,
    );
  }

  async getReviewsByRevieweeId(revieweeId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.revieweeId === revieweeId,
    );
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const now = new Date();
    const review: Review = { 
      ...insertReview, 
      id, 
      createdAt: now 
    };
    this.reviews.set(id, review);
    return review;
  }

  // Add sample data for development
  private addSampleData(): void {
    // Create sample users
    const farmer = {
      id: this.currentUserId++,
      username: "farmer1",
      password: "$2a$10$yRx/R8bZU0JXVFZIHoSzSuuEKXlDCEJ8OVQ3c4NRoHLWk5aMvO4vK", // "password123"
      fullName: "Farmer Singh",
      email: "farmer@example.com",
      phone: "9876543210",
      userType: "farmer",
      isVerified: true,
      licenseUrl: "https://example.com/license.jpg",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    };
    this.users.set(farmer.id, farmer);

    const vendor = {
      id: this.currentUserId++,
      username: "vendor1",
      password: "$2a$10$yRx/R8bZU0JXVFZIHoSzSuuEKXlDCEJ8OVQ3c4NRoHLWk5aMvO4vK", // "password123"
      fullName: "Vendor Kumar",
      email: "vendor@example.com",
      phone: "9876543211",
      userType: "vendor",
      isVerified: true,
      licenseUrl: null,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) // 25 days ago
    };
    this.users.set(vendor.id, vendor);

    // Create sample produce
    const tomatoes = {
      id: this.currentProduceId++,
      farmerId: farmer.id,
      name: "Tomatoes",
      category: "Vegetable",
      description: "Fresh organic tomatoes",
      pricePerKg: 25,
      minOrderQuantity: 200,
      availableQuantity: 800,
      totalQuantity: 1000,
      imageUrl: "https://images.unsplash.com/photo-1594057687713-5fd14eed1c17?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      isActive: true,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    };
    this.produce.set(tomatoes.id, tomatoes);

    const potatoes = {
      id: this.currentProduceId++,
      farmerId: farmer.id,
      name: "Potatoes",
      category: "Vegetable",
      description: "Premium quality potatoes",
      pricePerKg: 18,
      minOrderQuantity: 200,
      availableQuantity: 450,
      totalQuantity: 1000,
      imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      isActive: true,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
    };
    this.produce.set(potatoes.id, potatoes);

    const onions = {
      id: this.currentProduceId++,
      farmerId: farmer.id,
      name: "Onions",
      category: "Vegetable",
      description: "Organic red onions",
      pricePerKg: 22,
      minOrderQuantity: 250,
      availableQuantity: 950,
      totalQuantity: 1000,
      imageUrl: "https://images.unsplash.com/photo-1607305387299-a3d9611cd469?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      isActive: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
    };
    this.produce.set(onions.id, onions);

    // Create price history for tomatoes
    const dates = Array.from({ length: 7 }).map((_, i) => new Date(Date.now() - (12 - i*2) * 24 * 60 * 60 * 1000));
    const tomatoPrices = [22, 22.5, 23, 22.8, 23.5, 24, 25];
    
    dates.forEach((date, index) => {
      this.priceHistory.set(this.currentPriceHistoryId++, {
        id: this.currentPriceHistoryId,
        produceId: tomatoes.id,
        price: tomatoPrices[index],
        date
      });
    });

    // Create price history for potatoes
    const potatoPrices = [19, 19, 18.5, 18.5, 18, 18, 18];
    
    dates.forEach((date, index) => {
      this.priceHistory.set(this.currentPriceHistoryId++, {
        id: this.currentPriceHistoryId,
        produceId: potatoes.id,
        price: potatoPrices[index],
        date
      });
    });

    // Create sample orders with negotiations
    const potatoOrder = {
      id: this.currentOrderId++,
      produceId: potatoes.id,
      vendorId: vendor.id,
      farmerId: farmer.id,
      quantity: 350,
      pricePerKg: 18,
      totalAmount: 6300, // 350 * 18
      status: orderStatuses.NEGOTIATION,
      commissionAmount: null,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    };
    this.orders.set(potatoOrder.id, potatoOrder);

    const tomatoOrder = {
      id: this.currentOrderId++,
      produceId: tomatoes.id,
      vendorId: vendor.id,
      farmerId: farmer.id,
      quantity: 500,
      pricePerKg: 25,
      totalAmount: 12500, // 500 * 25
      status: orderStatuses.NEGOTIATION,
      commissionAmount: null,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
    };
    this.orders.set(tomatoOrder.id, tomatoOrder);

    // Create sample negotiation for potato order
    const potatoNegotiation = {
      id: this.currentNegotiationId++,
      orderId: potatoOrder.id,
      round: 1,
      vendorId: vendor.id,
      farmerId: farmer.id,
      offeredPrice: 16.5,
      status: negotiationStatuses.PENDING,
      message: "Can we get a better price for this bulk order?",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    };
    this.negotiations.set(potatoNegotiation.id, potatoNegotiation);

    // Create sample negotiation for tomato order
    const tomatoNegotiation = {
      id: this.currentNegotiationId++,
      orderId: tomatoOrder.id,
      round: 1,
      vendorId: vendor.id,
      farmerId: farmer.id,
      offeredPrice: 23,
      status: negotiationStatuses.PENDING,
      message: "Requesting discount for large order",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
    };
    this.negotiations.set(tomatoNegotiation.id, tomatoNegotiation);
  }
}

// Export DatabaseStorage to replace MemStorage
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserVerification(id: number, isVerified: boolean): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ isVerified })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    return updatedUser;
  }
  
  async updateUserPassword(id: number, password: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ password })
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    return updatedUser;
  }
  
  async getProduce(id: number): Promise<Produce | undefined> {
    const [produceItem] = await db.select().from(produce).where(eq(produce.id, id));
    return produceItem || undefined;
  }
  
  async getProduceByFarmerId(farmerId: number): Promise<Produce[]> {
    return await db.select().from(produce).where(eq(produce.farmerId, farmerId));
  }
  
  async getAllActiveProduce(): Promise<Produce[]> {
    return await db.select().from(produce).where(eq(produce.isActive, true));
  }
  
  async createProduce(insertProduce: InsertProduce): Promise<Produce> {
    const [produceItem] = await db
      .insert(produce)
      .values(insertProduce)
      .returning();
    return produceItem;
  }
  
  async updateProduce(id: number, updatedFields: Partial<Produce>): Promise<Produce | undefined> {
    const [updatedProduce] = await db
      .update(produce)
      .set(updatedFields)
      .where(eq(produce.id, id))
      .returning();
    return updatedProduce || undefined;
  }
  
  async getPriceHistoryByProduceId(produceId: number): Promise<PriceHistory[]> {
    return await db
      .select()
      .from(priceHistory)
      .where(eq(priceHistory.produceId, produceId))
      .orderBy(desc(priceHistory.createdAt));
  }
  
  async createPriceHistory(insertPriceHistory: InsertPriceHistory): Promise<PriceHistory> {
    const [priceHistoryItem] = await db
      .insert(priceHistory)
      .values(insertPriceHistory)
      .returning();
    return priceHistoryItem;
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }
  
  async getOrdersByFarmerId(farmerId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.farmerId, farmerId));
  }
  
  async getOrdersByVendorId(vendorId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.vendorId, vendorId));
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    return order;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }
  
  async getNegotiationsByOrderId(orderId: number): Promise<Negotiation[]> {
    return await db
      .select()
      .from(negotiations)
      .where(eq(negotiations.orderId, orderId))
      .orderBy(desc(negotiations.createdAt));
  }
  
  async createNegotiation(insertNegotiation: InsertNegotiation): Promise<Negotiation> {
    const [negotiation] = await db
      .insert(negotiations)
      .values(insertNegotiation)
      .returning();
    return negotiation;
  }
  
  async updateNegotiationStatus(id: number, status: string): Promise<Negotiation | undefined> {
    const [updatedNegotiation] = await db
      .update(negotiations)
      .set({ status })
      .where(eq(negotiations.id, id))
      .returning();
    return updatedNegotiation || undefined;
  }
  
  async getReviewsByOrderId(orderId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.orderId, orderId));
  }
  
  async getReviewsByRevieweeId(revieweeId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.revieweeId, revieweeId));
  }
  
  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(insertReview)
      .returning();
    return review;
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
