jest.mock("../models/certificateModel", () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findOneAndUpdate: jest.fn(),
  updateOne: jest.fn()
}));

jest.mock("../models/verificationRecordModel", () => ({
  find: jest.fn(),
  create: jest.fn()
}));

const request = require("supertest");
const Certificate = require("../models/certificateModel");
const VerificationRecord = require("../models/verificationRecordModel");
const app = require("../app");

const VALID_ID = "507f1f77bcf86cd799439011";

function createQuery(result) {
  const query = {
    sort: jest.fn(() => query),
    select: jest.fn(() => query),
    populate: jest.fn(() => query),
    lean: jest.fn().mockResolvedValue(result)
  };

  return query;
}

describe("Officer routes", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("GET /api/officer/review-queue", () => {
    it("returns applications that the route queried as UNDER_REVIEW", async () => {
      const applications = [
        {
          _id: VALID_ID,
          name: "Test Applicant",
          certificateType: "EWS",
          status: "UNDER_REVIEW",
          riskScore: 0,
          remarks: "No risk factors detected"
        }
      ];

      Certificate.find.mockReturnValue(createQuery(applications));

      const res = await request(app).get("/api/officer/review-queue");

      expect(res.statusCode).toBe(200);
      expect(res.body.applications).toEqual(applications);
      expect(Certificate.find).toHaveBeenCalledWith({
        status: "UNDER_REVIEW"
      });
    });
  });

  describe("GET /api/officer/history", () => {
    it("returns verification records with populated certificate details", async () => {
      const records = [
        {
          decision: "APPROVED",
          officer: "Local demo officer (unverified)",
          riskScoreAtDecision: 0,
          remarks: "No risk factors detected",
          certificate: {
            name: "Test Applicant",
            certificateType: "EWS"
          }
        }
      ];

      VerificationRecord.find.mockReturnValue(createQuery(records));

      const res = await request(app).get("/api/officer/history");

      expect(res.statusCode).toBe(200);
      expect(res.body.records).toEqual(records);
      expect(VerificationRecord.find).toHaveBeenCalled();
    });
  });

  describe("GET /api/officer/applications/:id", () => {
    it("returns an application's details", async () => {
      const application = {
        _id: VALID_ID,
        name: "Test Applicant",
        certificateType: "EWS",
        documents: [{ type: "aadhaar", filename: "test-file.pdf" }]
      };

      Certificate.findById.mockReturnValue(createQuery(application));

      const res = await request(app).get(
        `/api/officer/applications/${VALID_ID}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.application).toEqual(application);
    });

    it("rejects an invalid application id", async () => {
      const res = await request(app).get(
        "/api/officer/applications/not-an-id"
      );

      expect(res.statusCode).toBe(400);
      expect(Certificate.findById).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/officer/applications/:id/documents/:filename", () => {
    it("does not serve a file that is not attached to the application", async () => {
      Certificate.findById.mockReturnValue(
        createQuery({
          documents: [{ type: "aadhaar", filename: "attached-file.pdf" }]
        })
      );

      const res = await request(app).get(
        `/api/officer/applications/${VALID_ID}/documents/other-file.pdf`
      );

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Document not found");
    });
  });

  describe("POST /api/officer/applications/:id/decision", () => {
    it("rejects a decision value other than APPROVED or REJECTED", async () => {
      const res = await request(app)
        .post(`/api/officer/applications/${VALID_ID}/decision`)
        .send({ decision: "PENDING" });

      expect(res.statusCode).toBe(400);
      expect(Certificate.findOneAndUpdate).not.toHaveBeenCalled();
      expect(VerificationRecord.create).not.toHaveBeenCalled();
    });

    it("saves the officer decision and a verification record", async () => {
      Certificate.findOneAndUpdate.mockReturnValue(
        createQuery({
          _id: VALID_ID,
          status: "APPROVED",
          riskScore: 25,
          remarks: "Example advisory remark"
        })
      );
      VerificationRecord.create.mockResolvedValue({});

      const res = await request(app)
        .post(`/api/officer/applications/${VALID_ID}/decision`)
        .send({ decision: "APPROVED" });

      expect(res.statusCode).toBe(200);
      expect(res.body.application.status).toBe("APPROVED");
      expect(Certificate.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: VALID_ID, status: "UNDER_REVIEW" },
        { $set: { status: "APPROVED" } },
        { new: true, runValidators: true }
      );
      expect(VerificationRecord.create).toHaveBeenCalledWith(
        expect.objectContaining({
          certificate: VALID_ID,
          decision: "APPROVED",
          officer: "Local demo officer (unverified)",
          riskScoreAtDecision: 25,
          remarks: "Example advisory remark"
        })
      );
    });

    it("locks a decision when the application is no longer under review", async () => {
      Certificate.findOneAndUpdate.mockReturnValue(createQuery(null));
      Certificate.findById.mockReturnValue(
        createQuery({ status: "APPROVED" })
      );

      const res = await request(app)
        .post(`/api/officer/applications/${VALID_ID}/decision`)
        .send({ decision: "REJECTED" });

      expect(res.statusCode).toBe(409);
      expect(res.body.error).toMatch(/Decision is locked/);
      expect(VerificationRecord.create).not.toHaveBeenCalled();
    });

    it("returns 404 when the application does not exist", async () => {
      Certificate.findOneAndUpdate.mockReturnValue(createQuery(null));
      Certificate.findById.mockReturnValue(createQuery(null));

      const res = await request(app)
        .post(`/api/officer/applications/${VALID_ID}/decision`)
        .send({ decision: "REJECTED" });

      expect(res.statusCode).toBe(404);
    });

    it("restores UNDER_REVIEW if the verification record cannot be saved", async () => {
      Certificate.findOneAndUpdate.mockReturnValue(
        createQuery({
          _id: VALID_ID,
          status: "REJECTED",
          riskScore: 30,
          remarks: "Example remark"
        })
      );
      VerificationRecord.create.mockRejectedValue(
        new Error("Simulated history write failure")
      );
      Certificate.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const res = await request(app)
        .post(`/api/officer/applications/${VALID_ID}/decision`)
        .send({ decision: "REJECTED" });

      expect(res.statusCode).toBe(500);
      expect(Certificate.updateOne).toHaveBeenCalledWith(
        { _id: VALID_ID, status: "REJECTED" },
        { $set: { status: "UNDER_REVIEW" } }
      );
    });
  });
});