const express = require("express");
const { Pool } = require("pg");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static("frontend/dist"));

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
    await pool.query(`
      CREATE TABLE IF NOT EXISTS waitlist_emails (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        source VARCHAR(100) DEFAULT 'coming_soon_page'
      )
    `);
    console.log("✅ Database table initialized successfully");
  } catch (err) {
    console.error("❌ Database initialization error:", err);
  }
}

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      success: true,
      message: "Server is healthy",
      timestamp: result.rows[0].now,
      database: "connected",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// Waitlist subscribe endpoint
app.post("/api/waitlist/subscribe", async (req, res) => {
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
        message: "You are already on our waitlist!",
        alreadySubscribed: true,
      });
    }

    // Insert new email
    await pool.query(
      "INSERT INTO waitlist_emails (email, source) VALUES ($1, $2)",
      [email, "coming_soon_page"]
    );

    console.log(`✅ New waitlist signup: ${email}`);

    res.status(201).json({
      success: true,
      message: "Successfully joined the waitlist!",
      alreadySubscribed: false,
    });
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to join waitlist. Please try again.",
    });
  }
});

// Waitlist stats endpoint
app.get("/api/waitlist/stats", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) as count FROM waitlist_emails"
    );
    const count = parseInt(result.rows[0].count);

    res.json({
      success: true,
      data: {
        currentlySubscribed: count,
        totalEverSubscribed: count,
      },
    });
  } catch (err) {
    console.error("❌ Stats error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
    });
  }
});

// Serve the React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 ShopperSprint Coming Soon server running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}`);

  // Initialize database
  await initDatabase();
});
