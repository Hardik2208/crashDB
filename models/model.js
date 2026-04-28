const mongoose = require("mongoose");

const crashSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, trim: true, index: true },
    eventTimestamp: { type: Number, required: true, index: true },
    serverTimestamp: { type: Number, default: () => Date.now() },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    acceleration: { type: Number, required: true },
    status: { type: String, enum: ["NORMAL", "CRASH"], required: true },
    workflowStatus: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "RESOLVED", "ESCALATED"],
      default: "PENDING",
      index: true
    }
  },
  { timestamps: true, versionKey: false }
);

// Optimize for Distributed Log Analysis queries
crashSchema.index({ deviceId: 1, eventTimestamp: -1 });

module.exports = mongoose.model("Crash", crashSchema);