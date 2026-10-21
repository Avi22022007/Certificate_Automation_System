const mongoose = require("mongoose");

const verificationRecordSchema = new mongoose.Schema(
  {
    certificate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certificate",
      required: true
    },
    decision: {
      type: String,
      enum: ["APPROVED", "REJECTED"],
      required: true
    },
    // Project assumption: this demo has no officer authentication.
    officer: {
      type: String,
      required: true,
      default: "Local demo officer (unverified)",
      trim: true
    },
    riskScoreAtDecision: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    remarks: {
      type: String,
      required: true,
      default: ""
    },
    decidedAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    collection: "verificationrecords",
    versionKey: false
  }
);

verificationRecordSchema.index({ decidedAt: -1 });

module.exports = mongoose.model(
  "VerificationRecord",
  verificationRecordSchema,
  "verificationrecords"
);