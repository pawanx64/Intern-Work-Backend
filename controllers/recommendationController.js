const Task = require("../models/Task");
const Health = require("../models/Health");
const scoring = require("../services/scoringService");

exports.getRecommendations = async (req,res)=>{
  const tasks = await Task.find({});
  const health = await Health.find({});
  const metrics = Object.fromEntries(health.map(h=>[h.metric,h]));

  // Convert health into snapshot format for scoring
  const snapshot = {
    water_ml: (metrics.water_intake?.progress||0)*1000,
    steps: metrics.steps?.progress||0,
    sleep_hours: metrics.sleep?.progress||0,
    screen_time_min: metrics.screen_time?.progress||0,
    mood_1to5: metrics.mood?.progress||null
  };

  res.json(scoring.recommendations(tasks, snapshot));
};
