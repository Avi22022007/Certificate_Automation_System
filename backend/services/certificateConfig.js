const CERTIFICATE_TYPES = ["Income", "EWS", "Community", "Residence", "Domicile"];

const REQUIRED_DOCUMENTS = {
  Income: ["aadhaar", "incomeProof"],
  EWS: ["aadhaar", "incomeProof"],
  Community: ["aadhaar", "communityProof"],
  Residence: ["aadhaar", "residenceProof"],
  Domicile: ["aadhaar"]
};

// Certificate types that need an annual income value
const INCOME_CERTIFICATES = ["Income", "EWS"];

module.exports = {
  CERTIFICATE_TYPES,
  REQUIRED_DOCUMENTS,
  INCOME_CERTIFICATES
};