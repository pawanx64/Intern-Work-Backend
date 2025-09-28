const express = require("express");
const router = express.Router();
const healthController = require("../controllers/healthcontroller");

// ✅ Get all health data
router.get("/", healthController.getHealth);

// ✅ Bulk: set/update ALL targets at once
router.post("/targets", healthController.setAllTargets);

// ✅ Bulk: update ALL progress at once
router.put("/progress", healthController.updateAllProgress);
router.put("/mood/progress", healthController.updateMood);

module.exports = router;
