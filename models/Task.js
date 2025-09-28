const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true }, // hydration, movement, sleep, etc.
  impact_weight: { type: Number, required: true },
  effort_min: { type: Number, required: true },
  micro_alt: { type: String, default: null },
  ignores: { type: Number, default: 0 },
  completedToday: { type: Boolean, default: false },
  time_gate: { type: String, default: null } // morning, day, evening
});

module.exports = mongoose.model("Task", taskSchema);
