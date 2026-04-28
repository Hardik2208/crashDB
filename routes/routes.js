const express = require("express");
const router = express.Router();
const Crash = require("../models/model");

/**
 * POST /api/crash
 * Handles incoming IoT data with FIXED coordinates
 */
router.post("/", async (req, res) => {
  try {
    const { deviceId, eventTimestamp, acceleration, status } = req.body;

    // 1. Validation: Removed latitude/longitude check since we're hardcoding them
    if (!deviceId || !eventTimestamp || acceleration === undefined || !status) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields (deviceId, eventTimestamp, acceleration, or status)" 
      });
    }

    // 2. Hardcoded coordinates as requested
    const fixedLat = 22.681819;
    const fixedLng = 75.878733;

    const crash = new Crash({
      deviceId,
      eventTimestamp,
      location: { 
        lat: fixedLat, 
        lng: fixedLng 
      },
      acceleration,
      status
    });

    await crash.save();
    console.log(`💾 Saved crash for ${deviceId} at fixed coordinates: ${fixedLat}, ${fixedLng}`);
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

module.exports = router;