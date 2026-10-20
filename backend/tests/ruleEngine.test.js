const {
  assessApplication,
  EWS_INCOME_ASSUMED_LIMIT
} = require("../services/ruleEngine");

describe("advisory application rule engine", () => {
  it("gives a valid EWS application with income of 6 lakh no risk points", () => {
    const result = assessApplication({
      age: 30,
      certificateType: "EWS",
      income: 600000,
      documents: [{ type: "aadhaar" }, { type: "incomeProof" }]
    });

    expect(result).toEqual({
      riskScore: 0,
      remarks: "No risk factors detected"
    });
  });

  it("adds 50 points when EWS income exceeds the project-assumption threshold", () => {
    const result = assessApplication({
      age: 30,
      certificateType: "EWS",
      income: 1000000,
      documents: [{ type: "aadhaar" }, { type: "incomeProof" }]
    });

    expect(EWS_INCOME_ASSUMED_LIMIT).toBe(800000);
    expect(result.riskScore).toBe(50);
    expect(result.remarks).toContain("project-assumption threshold");
  });

  it("adds 50 points when EWS income is missing", () => {
    const result = assessApplication({
      age: 30,
      certificateType: "EWS",
      documents: [{ type: "aadhaar" }, { type: "incomeProof" }]
    });

    expect(result.riskScore).toBe(50);
    expect(result.remarks).toContain("EWS income information is missing");
  });

  it("adds 30 points when Income certificate income is missing", () => {
    const result = assessApplication({
      age: 30,
      certificateType: "Income",
      documents: [{ type: "aadhaar" }, { type: "incomeProof" }]
    });

    expect(result.riskScore).toBe(30);
    expect(result.remarks).toContain("Income information is missing");
  });

  it("adds 40 points and names a missing required document", () => {
    const result = assessApplication({
      age: 30,
      certificateType: "EWS",
      income: 600000,
      documents: [{ type: "incomeProof" }]
    });

    expect(result.riskScore).toBe(40);
    expect(result.remarks).toContain("Missing required documents: aadhaar");
  });

  it("adds 30 points for a possible duplicate application", () => {
    const result = assessApplication(
      {
        age: 30,
        certificateType: "EWS",
        income: 600000,
        documents: [{ type: "aadhaar" }, { type: "incomeProof" }]
      },
      { isDuplicate: true }
    );

    expect(result.riskScore).toBe(30);
    expect(result.remarks).toContain("possible duplicate application");
  });

  it("adds 60 points for an applicant under 18 as a defensive check", () => {
    const result = assessApplication({
      age: 17,
      certificateType: "Domicile",
      documents: [{ type: "aadhaar" }]
    });

    expect(result.riskScore).toBe(60);
    expect(result.remarks).toContain("Applicant age is below 18");
  });

  it("caps combined risk factors at 100", () => {
    const result = assessApplication(
      {
        age: 17,
        certificateType: "EWS",
        income: 1000000,
        documents: []
      },
      { isDuplicate: true }
    );

    expect(result.riskScore).toBe(100);
    expect(result.remarks).toContain("Applicant age is below 18");
    expect(result.remarks).toContain("Missing required documents");
    expect(result.remarks).toContain("possible duplicate application");
  });

  it("does not apply an upper income limit to Income certificates", () => {
    const result = assessApplication({
      age: 30,
      certificateType: "Income",
      income: 50000000,
      documents: [{ type: "aadhaar" }, { type: "incomeProof" }]
    });

    expect(result).toEqual({
      riskScore: 0,
      remarks: "No risk factors detected"
    });
  });
});