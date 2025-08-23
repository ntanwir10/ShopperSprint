const express = require("express");
const { Pool } = require("pg");
const app = express();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Initialize database table
async function initDatabase() {
  try {
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS waitlist_emails (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        verified BOOLEAN DEFAULT FALSE
      )
    `);
    client.release();
    console.log("✅ Database table initialized successfully");
  } catch (err) {
    console.error("❌ Database initialization error:", err);
  }
}

// Initialize database on startup
initDatabase();

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    // Test database connection
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();

    res.json({
      status: "ok",
      message: "ShopperSprint Coming Soon API is running!",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "API is running but database connection failed",
      database: "disconnected",
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Waitlist signup endpoint
app.post("/api/waitlist/join", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    // Check if email already exists
    const checkResult = await pool.query(
      "SELECT id FROM waitlist_emails WHERE email = $1",
      [email]
    );

    if (checkResult.rows.length > 0) {
      return res.json({
        success: true,
        message:
          "You're already on our waitlist! We'll notify you when we launch.",
      });
    }

    // Insert new email
    await pool.query("INSERT INTO waitlist_emails (email) VALUES ($1)", [
      email,
    ]);

    console.log(`✅ New waitlist signup stored: ${email}`);

    res.json({
      success: true,
      message: "Successfully joined waitlist! We'll notify you when we launch.",
    });
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to join waitlist. Please try again.",
    });
  }
});

// Admin endpoint to view waitlist emails (in production, add authentication)
app.get("/api/waitlist/emails", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT email, created_at, verified FROM waitlist_emails ORDER BY created_at DESC"
    );

    res.json({
      success: true,
      count: result.rows.length,
      emails: result.rows,
    });
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch waitlist emails.",
    });
  }
});

// Serve the coming soon page for all other routes
app.get("*", (req, res) => {
  res.sendFile("public/index.html", { root: __dirname });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 ShopperSprint Coming Soon server running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}`);
});
