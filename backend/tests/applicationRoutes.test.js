const request = require("supertest");
const app = require("../app");

describe("GET /api/certificate-types", () => {
  it("returns required documents for each certificate", async () => {
    const res = await request(app).get("/api/certificate-types");
    expect(res.statusCode).toBe(200);
    expect(res.body.requiredDocuments.Domicile).toEqual(["aadhaar"]);
    expect(res.body.requiredDocuments.EWS).toEqual(["aadhaar", "incomeProof"]);
  });
});

describe("POST /api/applications validation", () => {
  it("rejects an applicant under 18 before touching the database", async () => {
    const res = await request(app)
      .post("/api/applications")
      .field("name", "Test User")
      .field("email", "test@example.com")
      .field("age", "16")
      .field("certificateType", "Income")
      .field("income", "20000");

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Age/);
  });

  it("rejects an invalid certificate type", async () => {
    const res = await request(app)
      .post("/api/applications")
      .field("name", "Test User")
      .field("email", "test@example.com")
      .field("age", "30")
      .field("certificateType", "Fake");

    expect(res.statusCode).toBe(400);
  });
});