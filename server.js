const express = require("express");
const app = express();

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "ShopperSprint Coming Soon API is running!",
  });
});

// Waitlist signup endpoint
app.post("/api/waitlist/join", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  // For now, just return success (in production, you'd save to database)
  console.log(`New waitlist signup: ${email}`);

  res.json({
    success: true,
    message: "Successfully joined waitlist! We'll notify you when we launch.",
  });
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
