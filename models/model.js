const mongoose = require("mongoose");

const crashSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    eventTimestamp: {
      type: Number, // from ESP32 (UTC Unix)
      required: true,
      index: true
    },

    serverTimestamp: {
      type: Number,
      default: () => Date.now()
    },

    location: {
      lat: {
        type: Number,
        required: true,
        min: -90,
        max: 90
      },
      lng: {
        type: Number,
        required: true,
        min: -180,
        max: 180
      }
    },

    acceleration: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: ["NORMAL", "CRASH"],
      required: true,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/* 🔴 INDEXES (critical for real usage) */

// Fast query: device history
crashSchema.index({ deviceId: 1, eventTimestamp: -1 });

// Fast query: recent crashes
crashSchema.index({ status: 1, eventTimestamp: -1 });

module.exports = mongoose.model("Crash", crashSchema);