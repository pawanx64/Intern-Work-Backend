const Task = require("../models/Task");
const Health = require("../models/Health");
const scoring = require("../services/scoringService");

// Substitution rules
const substitutionRules = {
  water: {
    primary: "Drink 0.5L water.",
    micro: "Take 3 sips now.",
    alternative: "Eat a water-rich fruit.",
    category: "hydration",
  },
  sleep: {
    primary: "Sleep 8 hours.",
    micro: "Take a 10 min nap.",
    alternative: "Try 5 min meditation before bed.",
    category: "rest",
  },
  steps: {
    primary: "Walk 2000 steps.",
    micro: "Stand and stretch for 2 mins.",
    alternative: "Take stairs once today.",
    category: "movement",
  },
  mood: {
    primary: "Journal 5 minutes.",
    micro: "Pick an emoji for your mood.",
    alternative: "Say one thing you’re grateful for.",
    category: "mental",
  },
};

// Stage order
const stageOrder = ["primary", "micro", "alternative"];

// ✅ Get top 4 recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const tasks = await Task.find({});
    const health = await Health.findOne(); // single doc schema

    if (!health) {
      return res.json([]);
    }

    // Snapshot of progress
    const snapshot = {
      water_progress: health.water_intake.progress || 0,
      water_target: health.water_intake.target || 0,
      steps_progress: health.steps.progress || 0,
      steps_target: health.steps.target || 0,
      sleep_progress: health.sleep.progress || 0,
      sleep_target: health.sleep.target || 0,
      screen_time_progress: health.screen_time.progress || 0,
      screen_time_target: health.screen_time.target || 0,
      mood_progress: health.mood.progress || null,
    };

    // Let scoring engine pick top 4
    const recs = scoring.recommendations(tasks, snapshot);
    res.json(recs);
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
};

// ✅ Dismiss & substitute logic
exports.dismissGoal = async (req, res) => {
  const { goalId } = req.params;

  try {
    const rules = substitutionRules[goalId];
    if (!rules) {
      return res.status(404).json({ error: "No substitution rules for this goal" });
    }

    let task = await Task.findOne({ metric: goalId });
    if (!task) {
      task = new Task({
        metric: goalId,
        title: rules.primary,
        dismissCount: 0,
        substitutionStage: "primary",
        category: rules.category,
        effort_min: 1,
        impact_weight: 1,
      });
    }

    task.dismissCount = (task.dismissCount || 0) + 1;

    // Rotate stage after 3 dismissals
    if (task.dismissCount >= 3) {
      const currentIndex = stageOrder.indexOf(task.substitutionStage || "primary");
      const nextIndex = (currentIndex + 1) % stageOrder.length;
      const nextStage = stageOrder[nextIndex];

      task.substitutionStage = nextStage;
      task.title = rules[nextStage];
      task.dismissCount = 0;
    }

    await task.save();

    res.json({
      message: `Goal '${goalId}' updated successfully`,
      task,
    });
  } catch (err) {
    console.error("Error dismissing goal:", err);
    res.status(500).json({ error: "Failed to dismiss goal" });
  }
};
