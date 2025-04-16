import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { compare, hash } from "bcrypt";
import MemoryStore from "memorystore";
import { 
  insertUserSchema, insertProduceSchema, insertPriceHistorySchema,
  insertOrderSchema, insertNegotiationSchema, insertReviewSchema,
  loginSchema, registerUserSchema,
  userTypes, orderStatuses, negotiationStatuses
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

const SessionStore = MemoryStore(session);

// Helper to validate request body against schema
function validateBody(schema: any, body: any) {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      throw new Error(validationError.message);
    }
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up sessions
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "united-farms-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 24 * 60 * 60 * 1000 },
      store: new SessionStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      })
    })
  );

  // Set up passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) return done(null, false, { message: "Invalid username or password" });

        // In a real app, use bcrypt to compare passwords
        // const isValid = await compare(password, user.password);
        // For this prototype, skip the bcrypt comparison
        const isValid = password === "password123";
        
        if (!isValid) return done(null, false, { message: "Invalid username or password" });
        
        // For farmers, check if they're verified
        if (user.userType === userTypes.FARMER && !user.isVerified) {
          return done(null, false, { message: "Account not verified yet. Please wait for admin approval." });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || null);
    } catch (error) {
      done(error);
    }
  });

  // Middleware to check authentication
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Middleware to check user type
  const checkUserType = (type: string) => (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated() && (req.user as any).userType === type) {
      return next();
    }
    res.status(403).json({ message: "Forbidden" });
  };

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = validateBody(registerUserSchema, req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      // In a real app, hash the password before storing
      // const hashedPassword = await hash(userData.password, 10);
      // userData.password = hashedPassword;

      // Create user
      const user = await storage.createUser({
        username: userData.username,
        password: userData.password, // would be hashedPassword in production
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        userType: userData.userType,
        isVerified: userData.userType === userTypes.VENDOR, // Vendors are auto-verified
        licenseUrl: userData.licenseUrl
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      console.error("Register error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    try {
      // Validate login data
      validateBody(loginSchema, req.body);
      
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: info.message || "Authentication failed" });
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          // Remove password from response
          const { password, ...userWithoutPassword } = user;
          return res.json(userWithoutPassword);
        });
      })(req, res, next);
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", isAuthenticated, (req, res) => {
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  // License upload route (simulated)
  app.post("/api/auth/upload-license", async (req, res) => {
    try {
      // In a real app, handle file upload and return URL
      // For this prototype, just return a dummy URL
      const licenseUrl = "https://example.com/licenses/dummy-license.jpg";
      
      res.json({ licenseUrl });
    } catch (error: any) {
      console.error("License upload error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Admin routes for verification (simulated)
  app.post("/api/admin/verify-farmer/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.updateUserVerification(userId, true);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Verification error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Produce routes
  app.get("/api/produce", async (req, res) => {
    try {
      const produce = await storage.getAllActiveProduce();
      res.json(produce);
    } catch (error: any) {
      console.error("Get produce error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/produce/:id", async (req, res) => {
    try {
      const produceId = parseInt(req.params.id);
      const produce = await storage.getProduce(produceId);
      
      if (!produce) {
        return res.status(404).json({ message: "Produce not found" });
      }
      
      res.json(produce);
    } catch (error: any) {
      console.error("Get produce error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/farmers/:farmerId/produce", async (req, res) => {
    try {
      const farmerId = parseInt(req.params.farmerId);
      const produce = await storage.getProduceByFarmerId(farmerId);
      res.json(produce);
    } catch (error: any) {
      console.error("Get farmer produce error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/produce", isAuthenticated, checkUserType(userTypes.FARMER), async (req, res) => {
    try {
      const produceData = validateBody(insertProduceSchema, req.body);
      const user = req.user as any;
      
      // Ensure the farmerId matches the logged in user
      if (produceData.farmerId !== user.id) {
        return res.status(403).json({ message: "You can only create produce for yourself" });
      }
      
      const produce = await storage.createProduce(produceData);
      res.status(201).json(produce);
    } catch (error: any) {
      console.error("Create produce error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/produce/:id", isAuthenticated, checkUserType(userTypes.FARMER), async (req, res) => {
    try {
      const produceId = parseInt(req.params.id);
      const user = req.user as any;
      
      // Get existing produce
      const existingProduce = await storage.getProduce(produceId);
      if (!existingProduce) {
        return res.status(404).json({ message: "Produce not found" });
      }
      
      // Check if the user owns this produce
      if (existingProduce.farmerId !== user.id) {
        return res.status(403).json({ message: "You can only update your own produce" });
      }
      
      // Update produce
      const updatedProduce = await storage.updateProduce(produceId, req.body);
      res.json(updatedProduce);
    } catch (error: any) {
      console.error("Update produce error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Price history routes
  app.get("/api/produce/:produceId/price-history", async (req, res) => {
    try {
      const produceId = parseInt(req.params.produceId);
      const priceHistory = await storage.getPriceHistoryByProduceId(produceId);
      res.json(priceHistory);
    } catch (error: any) {
      console.error("Get price history error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Order routes
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      let orders;
      
      if (user.userType === userTypes.FARMER) {
        orders = await storage.getOrdersByFarmerId(user.id);
      } else if (user.userType === userTypes.VENDOR) {
        orders = await storage.getOrdersByVendorId(user.id);
      } else {
        return res.status(403).json({ message: "Invalid user type" });
      }
      
      res.json(orders);
    } catch (error: any) {
      console.error("Get orders error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user is allowed to view this order
      const user = req.user as any;
      if (order.farmerId !== user.id && order.vendorId !== user.id) {
        return res.status(403).json({ message: "You don't have access to this order" });
      }
      
      res.json(order);
    } catch (error: any) {
      console.error("Get order error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/orders", isAuthenticated, checkUserType(userTypes.VENDOR), async (req, res) => {
    try {
      const orderData = validateBody(insertOrderSchema, req.body);
      const user = req.user as any;
      
      // Ensure the vendorId matches the logged in user
      if (orderData.vendorId !== user.id) {
        return res.status(403).json({ message: "You can only create orders for yourself" });
      }
      
      // Get the produce to verify it exists and is active
      const produce = await storage.getProduce(orderData.produceId);
      if (!produce) {
        return res.status(404).json({ message: "Produce not found" });
      }
      
      if (!produce.isActive) {
        return res.status(400).json({ message: "This produce is not currently available" });
      }
      
      // Check if order quantity is at least the minimum
      if (orderData.quantity < produce.minOrderQuantity) {
        return res.status(400).json({ 
          message: `Minimum order quantity is ${produce.minOrderQuantity}kg` 
        });
      }
      
      // Check if enough quantity is available
      if (orderData.quantity > produce.availableQuantity) {
        return res.status(400).json({ 
          message: `Only ${produce.availableQuantity}kg available` 
        });
      }
      
      // Create the order
      const order = await storage.createOrder({
        ...orderData,
        farmerId: produce.farmerId,
        pricePerKg: produce.pricePerKg,
        totalAmount: produce.pricePerKg * orderData.quantity
      });
      
      res.status(201).json(order);
    } catch (error: any) {
      console.error("Create order error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/orders/:id/status", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !Object.values(orderStatuses).includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user is allowed to update this order
      const user = req.user as any;
      if (order.farmerId !== user.id && order.vendorId !== user.id) {
        return res.status(403).json({ message: "You don't have access to this order" });
      }
      
      // Only farmers can accept orders
      if (status === orderStatuses.ACCEPTED && user.userType !== userTypes.FARMER) {
        return res.status(403).json({ message: "Only farmers can accept orders" });
      }
      
      // Update order status
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      res.json(updatedOrder);
    } catch (error: any) {
      console.error("Update order status error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Negotiation routes
  app.get("/api/orders/:orderId/negotiations", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      
      // Get the order to verify access
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user is allowed to view negotiations for this order
      const user = req.user as any;
      if (order.farmerId !== user.id && order.vendorId !== user.id) {
        return res.status(403).json({ message: "You don't have access to this order" });
      }
      
      const negotiations = await storage.getNegotiationsByOrderId(orderId);
      res.json(negotiations);
    } catch (error: any) {
      console.error("Get negotiations error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/negotiations", isAuthenticated, async (req, res) => {
    try {
      const negotiationData = validateBody(insertNegotiationSchema, req.body);
      const user = req.user as any;
      
      // Get the order to verify access and details
      const order = await storage.getOrder(negotiationData.orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user is part of this order
      if (order.farmerId !== user.id && order.vendorId !== user.id) {
        return res.status(403).json({ message: "You don't have access to this order" });
      }
      
      // Check if the order is in negotiation status
      if (order.status !== orderStatuses.NEGOTIATION) {
        return res.status(400).json({ message: "This order is not in negotiation state" });
      }
      
      // Get existing negotiations for this order
      const existingNegotiations = await storage.getNegotiationsByOrderId(order.id);
      
      // Check if we've reached the max rounds (3)
      if (existingNegotiations.length >= 6) { // 3 rounds * 2 parties
        return res.status(400).json({ message: "Maximum negotiation rounds reached" });
      }
      
      // Determine the correct round number
      let round = 1;
      if (existingNegotiations.length > 0) {
        round = Math.floor(existingNegotiations.length / 2) + 1;
      }
      
      // Ensure the user is making the correct move in the negotiation
      const lastNegotiation = existingNegotiations[existingNegotiations.length - 1];
      
      if (lastNegotiation) {
        // If vendor started a round, next move should be from farmer
        if (lastNegotiation.vendorId === user.id && user.userType === userTypes.VENDOR) {
          return res.status(400).json({ message: "Waiting for farmer's response" });
        }
        
        // If farmer responded in a round, next move should start a new round from vendor
        if (lastNegotiation.farmerId === user.id && user.userType === userTypes.FARMER) {
          return res.status(400).json({ message: "Waiting for vendor's response" });
        }
      }
      
      // Create negotiation
      const negotiation = await storage.createNegotiation({
        ...negotiationData,
        round,
        vendorId: order.vendorId,
        farmerId: order.farmerId,
      });
      
      res.status(201).json(negotiation);
    } catch (error: any) {
      console.error("Create negotiation error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/negotiations/:id/status", isAuthenticated, async (req, res) => {
    try {
      const negotiationId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !Object.values(negotiationStatuses).includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Get negotiation
      const negotiation = await storage.getNegotiationById(negotiationId);
      if (!negotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }
      
      // Get the order to verify details
      const order = await storage.getOrder(negotiation.orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user is part of this negotiation
      const user = req.user as any;
      if (negotiation.farmerId !== user.id && negotiation.vendorId !== user.id) {
        return res.status(403).json({ message: "You don't have access to this negotiation" });
      }
      
      // Only the recipient can accept/reject a negotiation
      if (
        (user.userType === userTypes.VENDOR && negotiation.vendorId === user.id) ||
        (user.userType === userTypes.FARMER && negotiation.farmerId === user.id)
      ) {
        // The user who created the negotiation can't respond to it
        return res.status(403).json({ message: "You can't respond to your own negotiation" });
      }
      
      // Update negotiation status
      const updatedNegotiation = await storage.updateNegotiationStatus(negotiationId, status);
      
      // If accepted, update the order price and status
      if (status === negotiationStatuses.ACCEPTED) {
        await storage.updateProduce(order.produceId, {
          pricePerKg: negotiation.offeredPrice
        });
        
        await storage.updateOrder(order.id, {
          pricePerKg: negotiation.offeredPrice,
          totalAmount: negotiation.offeredPrice * order.quantity,
          status: orderStatuses.ACCEPTED
        });
      }
      
      res.json(updatedNegotiation);
    } catch (error: any) {
      console.error("Update negotiation status error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Review routes
  app.get("/api/users/:userId/reviews", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Verify the user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const reviews = await storage.getReviewsByRevieweeId(userId);
      res.json(reviews);
    } catch (error: any) {
      console.error("Get reviews error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/reviews", isAuthenticated, async (req, res) => {
    try {
      const reviewData = validateBody(insertReviewSchema, req.body);
      const user = req.user as any;
      
      // Ensure the reviewerId matches the logged in user
      if (reviewData.reviewerId !== user.id) {
        return res.status(403).json({ message: "You can only create reviews as yourself" });
      }
      
      // Get the order to verify details
      const order = await storage.getOrder(reviewData.orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user is part of this order
      if (order.farmerId !== user.id && order.vendorId !== user.id) {
        return res.status(403).json({ message: "You are not part of this order" });
      }
      
      // Check if the order is completed
      if (order.status !== orderStatuses.COMPLETED) {
        return res.status(400).json({ message: "Can only review completed orders" });
      }
      
      // Ensure the reviewee is the other party in the order
      const revieweeId = reviewData.revieweeId;
      if (
        (user.id === order.farmerId && revieweeId !== order.vendorId) ||
        (user.id === order.vendorId && revieweeId !== order.farmerId)
      ) {
        return res.status(403).json({ message: "Invalid reviewee" });
      }
      
      // Check if user has already reviewed this order
      const existingReviews = await storage.getReviewsByOrderId(order.id);
      const hasReviewed = existingReviews.some(review => review.reviewerId === user.id);
      
      if (hasReviewed) {
        return res.status(400).json({ message: "You have already reviewed this order" });
      }
      
      // Create review
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error: any) {
      console.error("Create review error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
