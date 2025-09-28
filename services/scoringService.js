const WEIGHTS = { W_urgency: 0.5, W_impact: 0.3, W_effort: 0.15, W_tod: 0.15, W_penalty: 0.2 };

function inverseEffort(mins) {
  return 1 / Math.log2(Math.max(1, mins) + 2);
}
function timeOfDayFactor(time_gate, now = new Date()) {
  if (!time_gate) return 1;
  const h = now.getHours();
  const gates = { morning: [5,11], day: [12,17], evening: [18,23] };
  const [min,max] = gates[time_gate] || [0,23];
  return h >= min && h <= max ? 1 : 0.2;
}
function urgencyContribution(task, metrics) {
  switch (task.category) {
    case "hydration": return Math.min(1, Math.max(0, (2000 - (metrics.water_ml||0)) / 2000));
    case "movement": return Math.min(1, Math.max(0, (8000 - (metrics.steps||0)) / 8000));
    case "sleep": return (metrics.sleep_hours||0) < 7 ? 1 : 0;
    case "screen": return (metrics.screen_time_min||0) >= 120 ? 1 : 0;
    case "mood": return (metrics.mood_1to5||0) <= 2 ? 1 : 0.3;
    default: return 0;
  }
}
function round4(n) { return Math.round(n*10000)/10000; }

function recommendations(tasks, metrics, now=new Date()) {
  const scored = tasks.filter(t=>!t.completedToday).map(task=>{
    const u = urgencyContribution(task, metrics);
    const invEff = inverseEffort(task.effort_min);
    const tod = timeOfDayFactor(task.time_gate, now);
    const score = WEIGHTS.W_urgency*u + WEIGHTS.W_impact*task.impact_weight + WEIGHTS.W_effort*invEff + WEIGHTS.W_tod*tod - WEIGHTS.W_penalty*(task.ignores||0);
    return { id: task.id, title: task.title, category: task.category, score: round4(score) };
  });
  return scored.sort((a,b)=> b.score - a.score).slice(0,4);
}

module.exports = { recommendations };
