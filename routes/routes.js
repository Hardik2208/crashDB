const express = require("express");
const router = express.Router();
const Crash = require("../models/model");

/**
 * POST /api/crash
 * Handles incoming IoT data
 */
router.post("/", async (req, res) => {
  try {
    const { deviceId, eventTimestamp, latitude, longitude, acceleration, status } = req.body;

    // Validation
    if (!deviceId || !eventTimestamp || latitude === undefined || 
        longitude === undefined || acceleration === undefined || !status) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }

    const crash = new Crash({
      deviceId,
      eventTimestamp,
      location: { lat: latitude, lng: longitude },
      acceleration,
      status
    });

    await crash.save();
    return res.status(201).json({ success: true, id: crash._id });
  } catch (error) {
    console.error("❌ Save error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/crash
 * Logic for Distributed Log-Analyser
 */
router.get("/", async (req, res) => {
  try {
    const crashes = await Crash.find().sort({ eventTimestamp: -1 }).limit(50);
    return res.json({ success: true, data: crashes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router; // Ensure this export is at the end