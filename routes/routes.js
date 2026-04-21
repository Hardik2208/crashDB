const express = require("express");
const router = express.Router();

const Crash = require("../models/model");

/**
 * POST /api/crash
 * Insert crash event (from device)
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

    // 🔴 Validation
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
      status,
      workflowStatus: "PENDING" // 🔴 default
    });

    await crash.save();

    return res.status(201).json({
      success: true,
      id: crash._id
    });

  } catch (error) {
    console.error("❌ POST error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


/**
 * GET /api/crash
 * Fetch crashes with filters
 * Example:
 * ?deviceId=bike_1
 * ?workflowStatus=PENDING
 * ?status=CRASH
 */
router.get("/", async (req, res) => {
  try {
    const { deviceId, status, workflowStatus, limit = 50 } = req.query;

    let query = {};

    if (deviceId) query.deviceId = deviceId;
    if (status) query.status = status;
    if (workflowStatus) query.workflowStatus = workflowStatus;

    const crashes = await Crash.find(query)
      .sort({ eventTimestamp: -1 })
      .limit(Number(limit));

    return res.json({
      success: true,
      count: crashes.length,
      data: crashes
    });

  } catch (error) {
    console.error("❌ GET error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PUT /api/crash/:id/status
 * Update workflow status (using PUT)
 */
router.put("/:id/status", async (req, res) => {
  try {
    const { workflowStatus } = req.body;

    const validStatuses = [
      "PENDING",
      "IN_PROGRESS",
      "RESOLVED",
      "ESCALATED"
    ];

    // 🔴 Validation
    if (!workflowStatus || !validStatuses.includes(workflowStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing workflow status"
      });
    }

    // 🔴 Update
    const updated = await Crash.findByIdAndUpdate(
      req.params.id,
      { workflowStatus },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Crash not found"
      });
    }

    return res.json({
      success: true,
      data: updated
    });

  } catch (error) {
    console.error("❌ PUT error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


module.exports = router;