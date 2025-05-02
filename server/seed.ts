import { db } from "./db";
import { users, produce, priceHistory, orders, negotiations, reviews } from "@shared/schema";
import { orderStatuses } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");
  
  try {
    // Check if data already exists
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log("Database already has data, skipping seeding.");
      return;
    }

    // Create sample users
    const [farmer] = await db.insert(users).values({
      username: "farmer1",
      password: "$2a$10$yRx/R8bZU0JXVFZIHoSzSuuEKXlDCEJ8OVQ3c4NRoHLWk5aMvO4vK", // "password123"
      fullName: "Farmer Singh",
      email: "farmer@example.com",
      phone: "9876543210",
      userType: "farmer",
      isVerified: true,
      licenseUrl: "https://example.com/license.jpg",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    }).returning();

    const [vendor] = await db.insert(users).values({
      username: "vendor1",
      password: "$2a$10$yRx/R8bZU0JXVFZIHoSzSuuEKXlDCEJ8OVQ3c4NRoHLWk5aMvO4vK", // "password123"
      fullName: "Vendor Kumar",
      email: "vendor@example.com",
      phone: "9876543211",
      userType: "vendor",
      isVerified: true,
      licenseUrl: null,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) // 25 days ago
    }).returning();

    // Create sample produce
    const [tomatoes] = await db.insert(produce).values({
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
    }).returning();

    const [potatoes] = await db.insert(produce).values({
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
      updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
    }).returning();

    const [onions] = await db.insert(produce).values({
      farmerId: farmer.id,
      name: "Onions",
      category: "Vegetable",
      description: "Red onions from local farms",
      pricePerKg: 15,
      minOrderQuantity: 200,
      availableQuantity: 600,
      totalQuantity: 1000,
      imageUrl: "https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      isActive: true,
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
    }).returning();

    // Create price history entries
    await db.insert(priceHistory).values([
      {
        produceId: tomatoes.id,
        price: 25,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      },
      {
        produceId: tomatoes.id,
        price: 27,
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
      },
      {
        produceId: tomatoes.id,
        price: 26,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        produceId: tomatoes.id,
        price: 25,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        produceId: potatoes.id,
        price: 20,
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
      },
      {
        produceId: potatoes.id,
        price: 19,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      },
      {
        produceId: potatoes.id,
        price: 18,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        produceId: onions.id,
        price: 16,
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) // 12 days ago
      },
      {
        produceId: onions.id,
        price: 15,
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
      }
    ]);

    // Create sample order
    const [tomatoOrder] = await db.insert(orders).values({
      produceId: tomatoes.id,
      vendorId: vendor.id,
      farmerId: farmer.id,
      quantity: 300,
      pricePerKg: 25,
      totalAmount: 7500, // 300 * 25
      commissionAmount: 375, // 5% of 7500
      status: orderStatuses.ACCEPTED,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
    }).returning();

    // Create sample negotiation
    await db.insert(negotiations).values({
      orderId: tomatoOrder.id,
      vendorId: vendor.id,
      farmerId: farmer.id,
      offeredPrice: 23.5,
      message: "I would like to order in bulk, can you offer a better price?",
      status: "accepted",
      round: 1,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 1000 * 60 * 60) // 5 days ago + 1 hour
    });

    console.log("Seed data created successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run the seed function
seed();