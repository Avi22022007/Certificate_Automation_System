jest.mock("../models/userModel", () => ({
  find: jest.fn()
}));

const request = require("supertest");
const User = require("../models/userModel");
const app = require("../app");

function createQuery(result) {
  const query = {
    sort: jest.fn(() => query),
    select: jest.fn(() => query),
    lean: jest.fn().mockResolvedValue(result)
  };

  return query;
}

describe("GET /api/admin/overview", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns users, certificate requirements, and advisory rule configuration", async () => {
    const users = [
      {
        _id: "user-1",
        name: "Test Applicant",
        email: "test@example.com",
        role: "applicant"
      }
    ];

    User.find.mockReturnValue(createQuery(users));

    const res = await request(app).get("/api/admin/overview");

    expect(res.statusCode).toBe(200);
    expect(res.body.users).toEqual(users);
    expect(res.body.certificateTypes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "EWS",
          requiredDocuments: ["aadhaar", "incomeProof"],
          requiresIncome: true
        }),
        expect.objectContaining({
          name: "Domicile",
          requiredDocuments: ["aadhaar"],
          requiresIncome: false
        })
      ])
    );
    expect(res.body.ruleConfiguration.weights.missingRequiredDocuments).toBe(
      40
    );
    expect(res.body.ruleConfiguration.ewsIncomeAssumedLimit).toBe(800000);
    expect(res.body.ruleConfiguration.ewsIncomeAssumedLimitLabel).toMatch(
      /Project assumption/
    );
    expect(User.find).toHaveBeenCalled();
  });

  it("returns an error if the user list cannot be loaded", async () => {
    const query = createQuery([]);
    query.lean.mockRejectedValue(new Error("Simulated database error"));
    User.find.mockReturnValue(query);

    const res = await request(app).get("/api/admin/overview");

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Failed to load admin overview");
  });
});