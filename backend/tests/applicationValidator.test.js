const { validateApplication } = require("../services/applicationValidator");

const valid = {
  name: "Test User",
  email: "test@example.com",
  age: "25",
  certificateType: "Domicile"
};

describe("validateApplication", () => {
  it("accepts a valid Domicile application", () => {
    const { errors } = validateApplication(valid);
    expect(errors).toHaveLength(0);
  });

  it("rejects age below 18", () => {
    const { errors } = validateApplication({ ...valid, age: "16" });
    expect(errors.join()).toMatch(/Age/);
  });

  it("rejects age above 120", () => {
    const { errors } = validateApplication({ ...valid, age: "130" });
    expect(errors.join()).toMatch(/Age/);
  });

  it("rejects an invalid certificate type", () => {
    const { errors } = validateApplication({ ...valid, certificateType: "Fake" });
    expect(errors.join()).toMatch(/certificate type/);
  });

  it("requires income for EWS", () => {
    const { errors } = validateApplication({ ...valid, certificateType: "EWS" });
    expect(errors.join()).toMatch(/income/);
  });

  it("accepts EWS with income", () => {
    const { errors, data } = validateApplication({
      ...valid,
      certificateType: "EWS",
      income: "600000"
    });
    expect(errors).toHaveLength(0);
    expect(data.income).toBe(600000);
  });

  it("rejects an invalid email", () => {
    const { errors } = validateApplication({ ...valid, email: "not-an-email" });
    expect(errors.join()).toMatch(/email/);
  });
});