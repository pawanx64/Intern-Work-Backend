const Health = require("../models/Health");

// ✅ Get health data
exports.getHealth = async (req, res) => {
  try {
    let health = await Health.findOne();
    if (!health) {
      health = new Health();
      await health.save();
    }
    res.json(health);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Bulk: Set/Update all targets
exports.setAllTargets = async (req, res) => {
  try {
    const updates = req.body; // { steps: { target: 8000 }, sleep: { target: 8 } }

    let health = await Health.findOne();
    if (!health) {
      health = new Health();
    }

    for (let metric in updates) {
      if (health[metric]) {
        health[metric].target = updates[metric].target;
        health[metric].progress = 0; // reset when setting new target
      }
    }

    await health.save();
    res.json(health);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Bulk: Update all progress
exports.updateAllProgress = async (req, res) => {
  try {
    const updates = req.body; // { steps: { progress: 3000 }, mood: { progress: 2 } }

    let health = await Health.findOne();
    if (!health) {
      return res.status(404).json({ error: "No health record found" });
    }

    for (let metric in updates) {
      if (health[metric]) {
        const value = updates[metric].progress;

        if (metric === "mood") {
          if (value < 1 || value > 5) {
            return res.status(400).json({ error: "Mood must be between 1 and 5" });
          }
          health.mood.progress = value;
        } else {
          const target = health[metric].target || 0;
          if (value < 0 || value > target) {
            return res.status(400).json({
              error: `${metric} progress must be between 0 and target (${target})`,
            });
          }
          health[metric].progress = value;
        }
      }
    }

    await health.save();
    res.json(health);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMood = async (req, res) => {
  try {
    const { progress } = req.body;

    let health = await Health.findOne();
    if (!health) {
      health = new Health({
        water_intake: { target: 0, progress: 0 },
        steps: { target: 0, progress: 0 },
        sleep: { target: 0, progress: 0 },
        screen_time: { target: 0, progress: 0 },
        mood: { progress: null },
      });
    }

    health.mood.progress = progress;
    await health.save();

    res.json(health.mood);
  } catch (err) {
    console.error("Error updating mood:", err);
    res.status(500).json({ error: "Failed to update mood" });
  }
};
