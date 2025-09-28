const mongoose = require("mongoose");

// Schema for each metric (except mood)
const metricSchema = new mongoose.Schema({
  target: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
});

// Main Health schema
const healthSchema = new mongoose.Schema({
  water_intake: { type: metricSchema, default: () => ({}) },
  steps: { type: metricSchema, default: () => ({}) },
  sleep: { type: metricSchema, default: () => ({}) },
  screen_time: { type: metricSchema, default: () => ({}) },
  mood: {
    progress: { type: Number, default: null }, // mood tracks only progress
  },
});

module.exports = mongoose.model("Health", healthSchema);
