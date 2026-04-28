require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); 

// Debug Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Database Schema
const crashSchema = new mongoose.Schema({
  deviceId: String,
  eventTimestamp: Number,
  location: { lat: Number, lng: Number },
  acceleration: Number,
  status: String,
  workflowStatus: { type: String, default: "PENDING" }
});
const Crash = mongoose.model("Crash", crashSchema);

// Main POST Route
app.post("/api/crash", async (req, res) => {
  try {
    const { deviceId, eventTimestamp, latitude, longitude, acceleration, status } = req.body;
    
    const crash = new Crash({
      deviceId,
      eventTimestamp,
      location: { lat: latitude, lng: longitude },
      acceleration,
      status
    });

    await crash.save();
    console.log("💾 Crash Log Saved to MongoDB");
    res.status(201).json({ success: true, id: crash._id });
  } catch (error) {
    console.error("❌ Save Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET Route for testing
app.get("/api/crash", async (req, res) => {
  const data = await Crash.find().sort({ _id: -1 }).limit(10);
  res.json({ success: true, data });
});

// Start on Port 4000 to avoid AirPlay/System conflicts
const PORT = 4000; 
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("✅ MongoDB Connected");
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});