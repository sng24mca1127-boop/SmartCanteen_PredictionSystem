const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const path = require("path");

// Open SQLite database
async function openDb() {
  try {
    const db = await open({
      filename: path.join(__dirname, "database.sqlite"),
      driver: sqlite3.Database,
    });
    console.log("✅ Database connection established");
    return db;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}

// Initialize the database and create tables if not exists
async function initDb() {
  try {
    const db = await openDb();
    
    // Create users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        user_id TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('student', 'faculty', 'admin', 'kitchen')),
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create orders table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        items TEXT NOT NULL,
        amount REAL NOT NULL,
        payment_type TEXT NOT NULL CHECK(payment_type IN ('instant', 'monthly')),
        payment_status TEXT NOT NULL DEFAULT 'pending' CHECK(payment_status IN ('pending', 'completed', 'failed', 'refunded')),
        order_status TEXT NOT NULL DEFAULT 'preparing' CHECK(order_status IN ('preparing', 'partially_completed', 'ready_to_serve', 'completed')),
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (user_id)
      )
    `);

    // Create indexes for better performance
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_orders_token ON orders(token);
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `);

    // Insert sample data for testing (optional)
    try {
      // Check if we already have users
      const userCount = await db.get("SELECT COUNT(*) as count FROM users");
      if (userCount.count === 0) {
        console.log("📝 Inserting sample data...");
        
        const hashedPassword = await require('bcryptjs').hash('password123', 10);
        
        // Insert sample users
        await db.run(
          "INSERT INTO users (name, email, user_id, role, password) VALUES (?, ?, ?, ?, ?)",
          ["Admin User", "admin@admin.sngce.ac.in", "ADM001", "admin", hashedPassword]
        );
        
        await db.run(
          "INSERT INTO users (name, email, user_id, role, password) VALUES (?, ?, ?, ?, ?)",
          ["John Student", "john@gmail.com", "STU001", "student", hashedPassword]
        );
        
        await db.run(
          "INSERT INTO users (name, email, user_id, role, password) VALUES (?, ?, ?, ?, ?)",
          ["Dr. Smith", "smith@faculty.sngce.ac.in", "FAC001", "faculty", hashedPassword]
        );
        
        await db.run(
          "INSERT INTO users (name, email, user_id, role, password) VALUES (?, ?, ?, ?, ?)",
          ["Kitchen Staff", "staff@kitchen.sngce.ac.in", "KIT001", "kitchen", hashedPassword]
        );

        console.log("✅ Sample data inserted");
      }
    } catch (sampleError) {
      console.log("ℹ Sample data already exists or error inserting:", sampleError.message);
    }

    console.log("✅ Database tables initialized");
    return db;
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}

module.exports = { openDb, initDb };