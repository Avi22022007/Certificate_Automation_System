const { CERTIFICATE_TYPES, INCOME_CERTIFICATES } = require("./certificateConfig");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateApplication(body = {}) {
  const errors = [];

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const age = Number(body.age);
  const certificateType = body.certificateType;

  if (name.length < 2) {
    errors.push("Name must be at least 2 characters");
  }

  if (!EMAIL_PATTERN.test(email)) {
    errors.push("A valid email is required");
  }

  if (!Number.isInteger(age) || age < 18 || age > 120) {
    errors.push("Age must be a whole number between 18 and 120");
  }

  if (!CERTIFICATE_TYPES.includes(certificateType)) {
    errors.push("Invalid certificate type");
  }

  let income = null;
  if (INCOME_CERTIFICATES.includes(certificateType)) {
    income = Number(body.income);
    const missing = body.income === undefined || body.income === "";
    if (missing || !Number.isFinite(income) || income < 0) {
      errors.push("Annual income must be a non-negative number");
    }
  }

  return {
    errors,
    data: { name, email, age, certificateType, income }
  };
}

module.exports = { validateApplication };