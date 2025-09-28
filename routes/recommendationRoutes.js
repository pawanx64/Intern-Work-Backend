const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");

router.get("/", recommendationController.getRecommendations);
router.post("/dismiss/:goalId", recommendationController.dismissGoal);

module.exports = router;
