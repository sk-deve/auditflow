const Report = require("../models/Report");
const crypto = require("crypto");

function createReportId() {
  return crypto.randomBytes(6).toString("hex");
}

function buildShareMeta(reportId) {
  return {
    reportId,
    shareUrl: `/report/${reportId}`,
  };
}

// SAVE REPORT
exports.saveReport = async (req, res) => {
  try {
    const user = req.user;

    const { audit } = req.body;

    if (!audit) {
      return res.status(400).json({
        error: "Audit data required",
      });
    }

    const reportId = createReportId();
    const share = buildShareMeta(reportId);

    const report = await Report.create({
      user: user._id,
      reportId,
      url: audit.url,
      score: audit.score || 0,
      audit: {
        ...audit,
        share,
      },
    });

    return res.json({
      reportId,
      share,
      audit: report.audit,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Failed to save report",
    });
  }
};

// GET HISTORY
exports.getReportHistory = async (req, res) => {
  try {
    const user = req.user;

    const reports = await Report.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json({
      reports,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Failed to fetch history",
    });
  }
};

// GET SINGLE REPORT
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findOne({
      reportId: req.params.reportId,
    });

    if (!report) {
      return res.status(404).json({
        error: "Report not found",
      });
    }

    return res.json({
      reportId: report.reportId,
      audit: report.audit,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Failed to fetch report",
    });
  }
};