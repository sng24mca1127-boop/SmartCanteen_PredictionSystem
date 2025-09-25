const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { initDb, openDb } = require("./db");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global database instance
let db;

// Initialize database and start server
async function startServer() {
  try {
    db = await initDb();
    
    console.log("✅ Database initialized successfully");

    // ------------------- TEST ROUTE -------------------
    app.get("/", (req, res) => {
      res.json({ 
        message: "SNGCE Canteen Server is running ✅", 
        timestamp: new Date().toISOString(),
        endpoints: [
          "/register - POST - User registration",
          "/login - POST - User login",
          "/api/orders - POST - Create order",
          "/api/admin/orders - GET - Get all orders (admin)",
          "/api/user/orders/:userId - GET - Get user orders",
          "/api/queue/:token - GET - Get queue status",
          "/api/orders/:id/status - PUT - Update order status"
        ]
      });
    });

    // ------------------- REGISTER ROUTE -------------------
    app.post("/register", async (req, res) => {
      try {
        const { name, email, role, userId, password, confirmPassword } = req.body;

        // Validation
        if (!name || !email || !role || !userId || !password) {
          return res.status(400).json({ error: "All fields are required" });
        }

        if (password !== confirmPassword) {
          return res.status(400).json({ error: "Passwords do not match" });
        }

        if (password.length < 6) {
          return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        // Email validation based on role
        const isEmail = email.includes("@");
        if (isEmail) {
          const studentRegex = /^[A-Za-z0-9._%+-]+@gmail\.com$/i;
          const facultyRegex = /^[A-Za-z0-9._%+-]+@faculty\.sngce\.ac\.in$/i;
          const adminRegex = /^[A-Za-z0-9._%+-]+@admin\.sngce\.ac\.in$/i;
          const kitchenRegex = /^[A-Za-z0-9._%+-]+@kitchen\.sngce\.ac\.in$/i;

          if (role === "student" && !studentRegex.test(email)) {
            return res.status(400).json({ error: "Students must use an @gmail.com email." });
          }
          if (role === "faculty" && !facultyRegex.test(email)) {
            return res.status(400).json({ error: "Faculty must use an @faculty.sngce.ac.in email." });
          }
          if (role === "admin" && !adminRegex.test(email)) {
            return res.status(400).json({ error: "Admins must use an @admin.sngce.ac.in email." });
          }
          if (role === "kitchen" && !kitchenRegex.test(email)) {
            return res.status(400).json({ error: "Kitchen staff must use an @kitchen.sngce.ac.in email." });
          }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.run(
          "INSERT INTO users (name, email, role, user_id, password) VALUES (?, ?, ?, ?, ?)",
          [name, email, role, userId, hashedPassword]
        );

        res.status(201).json({ success: true, message: "✅ Registration successful" });
      } catch (err) {
        console.error("Registration error:", err);
        if (err.message.includes("UNIQUE constraint failed: users.email")) {
          return res.status(400).json({ error: "Email already registered" });
        } else if (err.message.includes("UNIQUE constraint failed: users.user_id")) {
          return res.status(400).json({ error: "User ID already registered" });
        }
        res.status(500).json({ error: "Server error. Try again later." });
      }
    });

    // ------------------- LOGIN ROUTE -------------------
    app.post("/login", async (req, res) => {
      try {
        const { emailOrId, password, role } = req.body;

        if (!emailOrId || !password || !role) {
          return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Find user by email or user_id
        const user = await db.get(
          "SELECT * FROM users WHERE (email = ? OR user_id = ?) AND role = ?",
          [emailOrId, emailOrId, role]
        );

        if (!user) {
          return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Return user data (without password)
        const { password: _, ...userWithoutPassword } = user;
        res.json({
          success: true,
          message: "Login successful",
          user: userWithoutPassword
        });

      } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, message: "Server error" });
      }
    });

    // ------------------- ORDER ROUTES -------------------
    
    // Create new order
    app.post("/api/orders", async (req, res) => {
      try {
        const { user_id, user_name, items, amount, payment_type } = req.body;
        
        if (!user_id || !user_name || !items || !amount || !payment_type) {
          return res.status(400).json({ success: false, message: "All order fields are required" });
        }

        if (!Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ success: false, message: "Order items are required" });
        }

        const token = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit token

        await db.run(
          `INSERT INTO orders (token, user_id, user_name, items, amount, payment_type, payment_status, order_status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [token, user_id, user_name, JSON.stringify(items), amount, payment_type, 'completed', 'preparing']
        );

        res.json({ 
          success: true, 
          token, 
          message: "Order placed successfully",
          order: {
            token,
            user_id,
            user_name,
            items,
            amount,
            payment_type,
            payment_status: 'completed',
            order_status: 'preparing'
          }
        });
      } catch (err) {
        console.error("Order creation error:", err);
        res.status(500).json({ success: false, message: "Failed to place order" });
      }
    });

    // Get all orders for admin
    app.get("/api/admin/orders", async (req, res) => {
      try {
        const orders = await db.all("SELECT * FROM orders ORDER BY order_date DESC");
        
        // Parse items from JSON string
        const ordersWithParsedItems = orders.map(order => ({
          ...order,
          items: JSON.parse(order.items)
        }));

        res.json({ success: true, orders: ordersWithParsedItems });
      } catch (err) {
        console.error("Get orders error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch orders" });
      }
    });

    // ------------------- GET USER ORDER HISTORY -------------------
    app.get("/api/user/orders/:userId", async (req, res) => {
      try {
        const { userId } = req.params;
        
        const orders = await db.all(
          "SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC",
          [userId]
        );
        
        // Parse items from JSON string
        const ordersWithParsedItems = orders.map(order => ({
          ...order,
          items: JSON.parse(order.items)
        }));

        res.json({ success: true, orders: ordersWithParsedItems });
      } catch (err) {
        console.error("Get user orders error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch user orders" });
      }
    });

    // Get order by token (for queue status)
    app.get("/api/orders/token/:token", async (req, res) => {
      try {
        const { token } = req.params;
        const order = await db.get("SELECT * FROM orders WHERE token = ?", [token]);
        
        if (!order) {
          return res.json({ success: false, message: "Order not found" });
        }

        // Parse items from JSON string
        order.items = JSON.parse(order.items);
        res.json({ success: true, order });
      } catch (err) {
        console.error("Get order by token error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch order" });
      }
    });

    // Get queue status
    app.get("/api/queue/:token", async (req, res) => {
      try {
        const { token } = req.params;
        const order = await db.get("SELECT order_status FROM orders WHERE token = ?", [token]);
        
        if (!order) {
          return res.json({ success: false, status: "not_found", message: "Token not found" });
        }

        res.json({ success: true, status: order.order_status });
      } catch (err) {
        console.error("Queue status error:", err);
        res.status(500).json({ success: false, message: "Failed to get queue status" });
      }
    });

    // Update order status
    app.put("/api/orders/:id/status", async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
          return res.status(400).json({ success: false, message: "Status is required" });
        }

        const validStatuses = ['preparing', 'partially_completed', 'ready_to_serve', 'completed'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const result = await db.run("UPDATE orders SET order_status = ? WHERE id = ?", [status, id]);
        
        if (result.changes === 0) {
          return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.json({ success: true, message: "Order status updated successfully" });
      } catch (err) {
        console.error("Update status error:", err);
        res.status(500).json({ success: false, message: "Failed to update status" });
      }
    });

    // Get user profile
    app.get("/api/user/:userId", async (req, res) => {
      try {
        const { userId } = req.params;
        const user = await db.get("SELECT id, name, email, user_id, role, created_at FROM users WHERE user_id = ?", [userId]);
        
        if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, user });
      } catch (err) {
        console.error("Get user error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch user" });
      }
    });

    // Get statistics for admin dashboard
    app.get("/api/admin/statistics", async (req, res) => {
      try {
        const totalOrders = await db.get("SELECT COUNT(*) as count FROM orders");
        const totalRevenue = await db.get("SELECT SUM(amount) as total FROM orders WHERE payment_status = 'completed'");
        const pendingOrders = await db.get("SELECT COUNT(*) as count FROM orders WHERE order_status != 'completed'");
        const completedOrders = await db.get("SELECT COUNT(*) as count FROM orders WHERE order_status = 'completed'");

        res.json({
          success: true,
          statistics: {
            totalOrders: totalOrders.count,
            totalRevenue: totalRevenue.total || 0,
            pendingOrders: pendingOrders.count,
            completedOrders: completedOrders.count
          }
        });
      } catch (err) {
        console.error("Get statistics error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch statistics" });
      }
    });

    // Delete order (admin only)
    app.delete("/api/orders/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const result = await db.run("DELETE FROM orders WHERE id = ?", [id]);
        
        if (result.changes === 0) {
          return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.json({ success: true, message: "Order deleted successfully" });
      } catch (err) {
        console.error("Delete order error:", err);
        res.status(500).json({ success: false, message: "Failed to delete order" });
      }
    });

    // Update payment status
    app.put("/api/orders/:id/payment", async (req, res) => {
      try {
        const { id } = req.params;
        const { payment_status } = req.body;

        if (!payment_status) {
          return res.status(400).json({ success: false, message: "Payment status is required" });
        }

        const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
        if (!validStatuses.includes(payment_status)) {
          return res.status(400).json({ success: false, message: "Invalid payment status" });
        }

        const result = await db.run("UPDATE orders SET payment_status = ? WHERE id = ?", [payment_status, id]);
        
        if (result.changes === 0) {
          return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.json({ success: true, message: "Payment status updated successfully" });
      } catch (err) {
        console.error("Update payment status error:", err);
        res.status(500).json({ success: false, message: "Failed to update payment status" });
      }
    });

    // ------------------- ERROR HANDLING MIDDLEWARE -------------------
    app.use((err, req, res, next) => {
      console.error("Unhandled error:", err);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    // 404 handler for undefined routes
    app.use('*', (req, res) => {
      res.status(404).json({ 
        success: false, 
        message: "Endpoint not found",
        availableEndpoints: [
          "POST /register",
          "POST /login", 
          "POST /api/orders",
          "GET /api/admin/orders",
          "GET /api/user/orders/:userId",
          "GET /api/queue/:token",
          "PUT /api/orders/:id/status"
        ]
      });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Database: SQLite`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  if (db) {
    await db.close();
    console.log('✅ Database connection closed');
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Server termination signal received...');
  if (db) {
    await db.close();
    console.log('✅ Database connection closed');
  }
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;
