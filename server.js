require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Routes
const crashRoutes = require("./routes/routes");

const app = express();

/* =========================
   🔹 CORE MIDDLEWARE
========================= */

// Enable CORS (restrict in production)
app.use(cors());

// Parse JSON
app.use(express.json());

// Basic request logger (don’t skip visibility)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


/* =========================
   🔹 DATABASE CONNECTION
========================= */

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "crashDB", // enforce DB name explicitly
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ DB Connection Failed:", err.message);
    process.exit(1);
  }
};

connectDB();


/* =========================
   🔹 ROUTES
========================= */

// Health check (important for deployment)
app.get("/", (req, res) => {
  res.send("🚀 Crash Detection Backend Running");
});

// Main API
app.use("/api/crash", crashRoutes);


/* =========================
   🔹 GLOBAL ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);

  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});


/* =========================
   🔹 SERVER START
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});