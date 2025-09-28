const Task = require("../models/Task");

// Dismiss task
exports.dismissTask = async (req,res)=>{
  const {id} = req.body;
  if(!id) return res.status(400).json({error:"id required"});
  const task = await Task.findByIdAndUpdate(id, { $inc: { ignores:1 } }, { new:true });
  if(!task) return res.status(404).json({error:"Task not found"});
  res.json(task);
};

// Complete task
exports.completeTask = async (req,res)=>{
  const {id} = req.body;
  if(!id) return res.status(400).json({error:"id required"});
  const task = await Task.findByIdAndUpdate(id, { $set:{ completedToday:true } }, { new:true });
  if(!task) return res.status(404).json({error:"Task not found"});
  res.json(task);
};

// (Optional) Seed tasks
exports.seedTasks = async (req,res)=>{
  await Task.deleteMany({});
  const defaults = [
    { title:"Drink 500 ml water", category:"hydration", impact_weight:4, effort_min:5, micro_alt:null },
    { title:"Walk 1,000 steps", category:"movement", impact_weight:4, effort_min:10, micro_alt:null },
    { title:"Take a 10-min screen break", category:"screen", impact_weight:4, effort_min:10 },
    { title:"15-min wind-down routine", category:"sleep", impact_weight:5, effort_min:15, time_gate:"evening" },
    { title:"Quick mood check-in", category:"mood", impact_weight:2, effort_min:3 }
  ];
  const seeded = await Task.insertMany(defaults);
  res.json(seeded);
};
