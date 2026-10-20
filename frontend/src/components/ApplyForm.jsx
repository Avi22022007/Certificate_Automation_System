import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Toast from "./Toast";

function formatLabel(type) {
  const spaced = type.replace(/([A-Z])/g, " $1");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function ApplyForm() {
  const navigate = useNavigate();

  const [config, setConfig] = useState({
    requiredDocuments: {},
    incomeCertificates: []
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [certificateType, setCertificateType] = useState("");
  const [income, setIncome] = useState("");
  const [files, setFiles] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const closeToast = useCallback(() => setToast(null), []);

  // Required documents come from the backend so both sides always agree
  useEffect(() => {
    api
      .get("/certificate-types")
      .then((res) => setConfig(res.data))
      .catch(() =>
        setToast({
          message: "Could not load certificate types. Is the backend running?",
          type: "error",
          id: Date.now()
        })
      );
  }, []);

  const certificateTypes = Object.keys(config.requiredDocuments);
  const requiredDocs = config.requiredDocuments[certificateType] || [];
  const needsIncome = config.incomeCertificates.includes(certificateType);

  const showToast = (message, type) =>
    setToast({ message, type, id: Date.now() });

  const handleCertificateChange = (value) => {
    setCertificateType(value);
    setFiles({});
    setIncome("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ageNumber = Number(age);
    if (!Number.isInteger(ageNumber) || ageNumber < 18 || ageNumber > 120) {
      showToast("Age must be between 18 and 120", "error");
      return;
    }

    for (const type of requiredDocs) {
      if (!files[type]) {
        showToast(`Please upload ${formatLabel(type)}`, "error");
        return;
      }
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("age", age);
    formData.append("certificateType", certificateType);
    if (needsIncome) {
      formData.append("income", income);
    }
    requiredDocs.forEach((type) => {
      formData.append("documentTypes", type);
      formData.append("documents", files[type]);
    });

    try {
      setSubmitting(true);
      await api.post("/applications", formData);
      showToast("Application submitted successfully", "success");
      setName("");
      setEmail("");
      setAge("");
      setCertificateType("");
      setIncome("");
      setFiles({});
    } catch (err) {
      showToast(
        err.response?.data?.error || "Application submission failed",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-center">
      <div className="glass large">
        <button className="btn-link" onClick={() => navigate("/")}>
          ← Back
        </button>
        <h2>Apply for Certificate</h2>
        <p className="subtitle">
          Fill in your details and upload the required documents.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="age">Age</label>
            <input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="certificateType">Certificate Type</label>
            <select
              id="certificateType"
              value={certificateType}
              onChange={(e) => handleCertificateChange(e.target.value)}
              required
            >
              <option value="">Select</option>
              {certificateTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {needsIncome && (
            <div className="form-field">
              <label htmlFor="income">Annual Income (₹)</label>
              <input
                id="income"
                type="number"
                min="0"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                required
              />
            </div>
          )}

          {requiredDocs.length > 0 && (
            <h3 className="section-title">Upload Required Documents</h3>
          )}

          {requiredDocs.map((type) => (
            <div className="form-field" key={`${certificateType}-${type}`}>
              <label htmlFor={type}>{formatLabel(type)}</label>
              <input
                id={type}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  setFiles({ ...files, [type]: e.target.files[0] })
                }
                required
              />
            </div>
          ))}

          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
}

export default ApplyForm;
