const express = require("express");

const User = require("../models/userModel");
const {
  CERTIFICATE_TYPES,
  REQUIRED_DOCUMENTS,
  INCOME_CERTIFICATES
} = require("../services/certificateConfig");
const {
  RULE_WEIGHTS,
  EWS_INCOME_ASSUMED_LIMIT
} = require("../services/ruleEngine");

const router = express.Router();

// Read-only local demo overview. This project currently has no authentication.
router.get("/overview", async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select("name email role createdAt")
      .lean();

    const certificateTypes = CERTIFICATE_TYPES.map((name) => ({
      name,
      requiredDocuments: REQUIRED_DOCUMENTS[name] || [],
      requiresIncome: INCOME_CERTIFICATES.includes(name)
    }));

    return res.json({
      users,
      certificateTypes,
      ruleConfiguration: {
        weights: RULE_WEIGHTS,
        ewsIncomeAssumedLimit: EWS_INCOME_ASSUMED_LIMIT,
        ewsIncomeAssumedLimitLabel: "Project assumption; not official policy"
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load admin overview" });
  }
});

module.exports = router;