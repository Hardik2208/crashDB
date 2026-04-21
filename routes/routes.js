const express = require("express");
const router = express.Router();

const Crash = require("../models/model");

/**
 * POST /api/crash
 * Insert crash event
 */
router.post("/", async (req, res) => {
  try {
    const {
      deviceId,
      eventTimestamp,
      latitude,
      longitude,
      acceleration,
      status
    } = req.body;

    // 🔴 Strict validation
    if (
      !deviceId ||
      !eventTimestamp ||
      latitude === undefined ||
      longitude === undefined ||
      acceleration === undefined ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    if (eventTimestamp > Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid timestamp"
      });
    }

    const crash = new Crash({
      deviceId,
      eventTimestamp,
      serverTimestamp: Date.now(),
      location: {
        lat: latitude,
        lng: longitude
      },
      acceleration,
      status
    });

    await crash.save();

    return res.status(201).json({
      success: true,
      id: crash._id
    });

  } catch (error) {
    console.error("❌ Error saving crash:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


/**
 * GET /api/crash
 * Fetch crashes with filters
 */
router.get("/", async (req, res) => {
  try {
    const { deviceId, status, limit = 50 } = req.query;

    let query = {};

    if (deviceId) query.deviceId = deviceId;
    if (status) query.status = status;

    const crashes = await Crash.find(query)
      .sort({ eventTimestamp: -1 })
      .limit(Number(limit));

    return res.json({
      success: true,
      count: crashes.length,
      data: crashes
    });

  } catch (error) {
    console.error("❌ Error fetching crashes:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;