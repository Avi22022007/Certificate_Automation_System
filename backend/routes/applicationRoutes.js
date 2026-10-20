const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const User = require("../models/userModel");
const Certificate = require("../models/certificateModel");
const {
  REQUIRED_DOCUMENTS,
  INCOME_CERTIFICATES
} = require("../services/certificateConfig");
const { validateApplication } = require("../services/applicationValidator");

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = crypto.randomBytes(6).toString("hex");
    cb(null, `${Date.now()}-${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: 5 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPG and PNG files are allowed"));
    }
  }
});

function removeFiles(files = []) {
  files.forEach((f) => fs.unlink(f.path, () => {}));
}

// Tells the frontend which documents each certificate needs
router.get("/certificate-types", (req, res) => {
  res.json({
    requiredDocuments: REQUIRED_DOCUMENTS,
    incomeCertificates: INCOME_CERTIFICATES
  });
});

// Submit a new application
router.post(
  "/applications",
  (req, res, next) => {
    upload.array("documents", 5)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    const files = req.files || [];

    try {
      const { errors, data } = validateApplication(req.body);

      const documentTypes = [].concat(req.body.documentTypes || []);
      if (documentTypes.length !== files.length) {
        errors.push("Each uploaded file needs a matching document type");
      }

      const allowedTypes = REQUIRED_DOCUMENTS[data.certificateType] || [];
      const invalidTypes = documentTypes.filter(
        (t) => !allowedTypes.includes(t)
      );
      if (invalidTypes.length > 0) {
        errors.push(`Invalid document type(s): ${invalidTypes.join(", ")}`);
      }

      if (errors.length > 0) {
        removeFiles(files);
        return res.status(400).json({ error: errors.join(". "), errors });
      }

      const applicant = await User.findOneAndUpdate(
        { email: data.email },
        { $set: { name: data.name }, $setOnInsert: { role: "applicant" } },
        { upsert: true, new: true }
      );

      const certificate = await Certificate.create({
        applicant: applicant._id,
        name: data.name,
        email: data.email,
        age: data.age,
        certificateType: data.certificateType,
        income: data.income,
        documents: files.map((f, i) => ({
          type: documentTypes[i],
          originalName: f.originalname,
          filename: f.filename
        }))
      });

      res.status(201).json({
        message: "Application submitted successfully",
        id: certificate._id
      });
    } catch (err) {
      console.error(err);
      removeFiles(files);
      res.status(500).json({ error: "Failed to submit application" });
    }
  }
);

module.exports = router;