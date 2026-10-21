const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const Certificate = require("../models/certificateModel");
const VerificationRecord = require("../models/verificationRecordModel");

const router = express.Router();
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
const DEMO_OFFICER_LABEL = "Local demo officer (unverified)";

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Lists only applications awaiting an officer's decision.
router.get("/review-queue", async (req, res) => {
  try {
    const applications = await Certificate.find({ status: "UNDER_REVIEW" })
      .sort({ createdAt: 1 })
      .select("name email certificateType riskScore remarks status createdAt")
      .lean();

    return res.json({ applications });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load review queue" });
  }
});

// Lists recorded officer decisions, newest first.
router.get("/history", async (req, res) => {
  try {
    const records = await VerificationRecord.find()
      .sort({ decidedAt: -1 })
      .populate({
        path: "certificate",
        select: "name email certificateType"
      })
      .lean();

    return res.json({ records });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load decision history" });
  }
});

// Returns the details and document metadata for one application.
router.get("/applications/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "Invalid application id" });
  }

  try {
    const application = await Certificate.findById(req.params.id).lean();

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    return res.json({ application });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load application" });
  }
});

// Serves a file only when it belongs to the specified application.
router.get("/applications/:id/documents/:filename", async (req, res) => {
  const { id, filename } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid application id" });
  }

  try {
    const application = await Certificate.findById(id)
      .select("documents")
      .lean();

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    const document = (application.documents || []).find(
      (item) => item.filename === filename
    );

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    const filePath = path.join(UPLOAD_DIR, document.filename);
    return res.sendFile(filePath, (err) => {
      if (err && !res.headersSent) {
        console.error(err);
        res.status(err.statusCode === 404 ? 404 : 500).json({
          error:
            err.statusCode === 404
              ? "Document file not found"
              : "Failed to open document"
        });
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to open document" });
  }
});

// The officer submits the final decision; advisory scores never decide automatically.
router.post("/applications/:id/decision", async (req, res) => {
  const { id } = req.params;
  const { decision } = req.body || {};

  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid application id" });
  }

  if (!["APPROVED", "REJECTED"].includes(decision)) {
    return res.status(400).json({
      error: 'Decision must be either "APPROVED" or "REJECTED"'
    });
  }

  try {
    // The status condition makes the decision update a one-time operation.
    const application = await Certificate.findOneAndUpdate(
      { _id: id, status: "UNDER_REVIEW" },
      { $set: { status: decision } },
      { new: true, runValidators: true }
    ).lean();

    if (!application) {
      const existing = await Certificate.findById(id)
        .select("status")
        .lean();

      if (!existing) {
        return res.status(404).json({ error: "Application not found" });
      }

      return res.status(409).json({
        error:
          "Decision is locked because this application is no longer under review"
      });
    }

    try {
      await VerificationRecord.create({
        certificate: application._id,
        decision,
        officer: DEMO_OFFICER_LABEL,
        riskScoreAtDecision: application.riskScore || 0,
        remarks: application.remarks || "",
        decidedAt: new Date()
      });
    } catch (recordError) {
      // Compensate if history could not be stored so the decision is not left
      // without its required audit record.
      try {
        await Certificate.updateOne(
          { _id: application._id, status: decision },
          { $set: { status: "UNDER_REVIEW" } }
        );
      } catch (rollbackError) {
        console.error("Could not restore review status:", rollbackError);
      }

      throw recordError;
    }

    return res.json({
      message: `Application ${decision.toLowerCase()}`,
      application: {
        id: application._id,
        status: application.status
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to save decision and history" });
  }
});

module.exports = router;