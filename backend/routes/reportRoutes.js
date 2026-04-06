const express = require("express");
const router = express.Router();

const {
  saveReport,
  getReportHistory,
  getReportById,
} = require("../controllers/reportController");

const { protect } = require("../middleware/authMiddleware");

// Protected routes
router.post("/save", protect, saveReport);
router.get("/history", protect, getReportHistory);

// Public route (share link)
router.get("/:reportId", getReportById);

module.exports = router;