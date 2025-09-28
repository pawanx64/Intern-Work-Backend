const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

router.post("/dismiss", taskController.dismissTask);
router.post("/complete", taskController.completeTask);
router.post("/seed", taskController.seedTasks);

module.exports = router;
