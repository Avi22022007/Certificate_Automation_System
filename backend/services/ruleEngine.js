const { REQUIRED_DOCUMENTS } = require("./certificateConfig");

// Project assumptions for an advisory score; these are not official policy.
const RULE_WEIGHTS = {
  underMinimumAge: 60,
  missingEwsIncome: 50,
  ewsIncomeAboveAssumedLimit: 50,
  missingIncomeCertificateIncome: 30,
  missingRequiredDocuments: 40,
  duplicateApplication: 30
};

const EWS_INCOME_ASSUMED_LIMIT = 800000;

function getProvidedDocumentTypes(application) {
  if (Array.isArray(application.documents)) {
    return application.documents
      .map((document) => document && document.type)
      .filter(Boolean);
  }

  if (Array.isArray(application.documentTypes)) {
    return application.documentTypes.filter(Boolean);
  }

  return [];
}

function assessApplication(application = {}, options = {}) {
  const findings = [];
  let score = 0;

  if (Number(application.age) < 18) {
    score += RULE_WEIGHTS.underMinimumAge;
    findings.push("Applicant age is below 18");
  }

  const hasIncome =
    application.income !== undefined &&
    application.income !== null &&
    application.income !== "";

  if (application.certificateType === "EWS") {
    if (!hasIncome) {
      score += RULE_WEIGHTS.missingEwsIncome;
      findings.push("EWS income information is missing");
    } else if (Number(application.income) > EWS_INCOME_ASSUMED_LIMIT) {
      score += RULE_WEIGHTS.ewsIncomeAboveAssumedLimit;
      findings.push(
        `EWS income exceeds the project-assumption threshold of ₹${EWS_INCOME_ASSUMED_LIMIT.toLocaleString("en-IN")}`
      );
    }
  }

  if (application.certificateType === "Income" && !hasIncome) {
    score += RULE_WEIGHTS.missingIncomeCertificateIncome;
    findings.push("Income information is missing");
  }

  const requiredDocuments =
    REQUIRED_DOCUMENTS[application.certificateType] || [];
  const providedDocuments = new Set(getProvidedDocumentTypes(application));
  const missingDocuments = requiredDocuments.filter(
    (type) => !providedDocuments.has(type)
  );

  if (missingDocuments.length > 0) {
    score += RULE_WEIGHTS.missingRequiredDocuments;
    findings.push(`Missing required documents: ${missingDocuments.join(", ")}`);
  }

  if (options.isDuplicate === true) {
    score += RULE_WEIGHTS.duplicateApplication;
    findings.push(
      "A possible duplicate application exists for this email and certificate type"
    );
  }

  return {
    riskScore: Math.min(score, 100),
    remarks: findings.length > 0 ? findings.join(". ") : "No risk factors detected"
  };
}

module.exports = {
  assessApplication,
  RULE_WEIGHTS,
  EWS_INCOME_ASSUMED_LIMIT
};