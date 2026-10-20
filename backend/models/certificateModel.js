const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    originalName: { type: String, required: true },
    filename: { type: String, required: true }
  },
  { _id: false }
);

const certificateSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    age: { type: Number, required: true, min: 18, max: 120 },
    certificateType: {
      type: String,
      enum: ["Income", "EWS", "Community", "Residence", "Domicile"],
      required: true
    },
    income: { type: Number, default: null },
    documents: { type: [documentSchema], default: [] },
    status: {
      type: String,
      enum: ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"],
      default: "SUBMITTED"
    },
    riskScore: { type: Number, default: 0 },
    remarks: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certificate", certificateSchema);