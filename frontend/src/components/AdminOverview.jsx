import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Toast from "./Toast";

const RULE_LABELS = {
  underMinimumAge: "Applicant age below 18",
  missingEwsIncome: "Missing EWS income",
  ewsIncomeAboveAssumedLimit: "EWS income above assumed threshold",
  missingIncomeCertificateIncome: "Missing Income certificate income",
  missingRequiredDocuments: "Missing required documents",
  duplicateApplication: "Possible duplicate application"
};

function formatCurrency(value) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function AdminOverview() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadOverview() {
      try {
        const response = await api.get("/admin/overview");
        if (active) {
          setOverview(response.data);
        }
      } catch (error) {
        if (active) {
          setToast({
            message:
              error.response?.data?.error ||
              "Could not load the admin overview. Is the backend running?",
            type: "error"
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadOverview();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page-center">
      <main className="glass officer-card">
        <button className="btn-link" onClick={() => navigate("/")}>
          ← Back to role selection
        </button>
        <h1>System Administrator Overview</h1>
        <p className="subtitle">
          Read-only view of users, certificate types, and advisory rules.
        </p>
        <p className="admin-demo-note">
          Local demo view. User identities are not authenticated in this
          project.
        </p>

        {loading ? (
          <p className="officer-message">Loading system overview...</p>
        ) : overview ? (
          <div className="admin-sections">
            <section className="officer-detail-section">
              <h2>User Accounts</h2>
              {overview.users?.length ? (
                <div className="admin-user-list">
                  {overview.users.map((user) => (
                    <article className="admin-user" key={user._id}>
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                      <span className="status-pill status-review">
                        {user.role}
                      </span>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="officer-message">No user accounts found.</p>
              )}
            </section>

            <section className="officer-detail-section">
              <h2>Certificate Types</h2>
              <div className="admin-certificate-list">
                {(overview.certificateTypes || []).map((certificate) => (
                  <article
                    className="admin-certificate"
                    key={certificate.name}
                  >
                    <h3>{certificate.name}</h3>
                    <p>
                      <strong>Required documents:</strong>{" "}
                      {certificate.requiredDocuments.length
                        ? certificate.requiredDocuments.join(", ")
                        : "None configured"}
                    </p>
                    <p>
                      <strong>Income field:</strong>{" "}
                      {certificate.requiresIncome ? "Required" : "Not used"}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="officer-detail-section">
              <h2>Advisory Rule Weights</h2>
              <p className="officer-assessment-note">
                These weights are project assumptions used to assist officer
                review. They do not approve or reject applications.
              </p>
              <ul className="admin-rule-list">
                {Object.entries(overview.ruleConfiguration?.weights || {}).map(
                  ([key, weight]) => (
                    <li key={key}>
                      <span>{RULE_LABELS[key] || key}</span>
                      <strong>+{weight}</strong>
                    </li>
                  )
                )}
              </ul>
              <p className="admin-assumption">
                <strong>EWS income threshold:</strong>{" "}
                {formatCurrency(
                  overview.ruleConfiguration?.ewsIncomeAssumedLimit || 0
                )}
                <br />
                <span>
                  {overview.ruleConfiguration?.ewsIncomeAssumedLimitLabel}
                </span>
              </p>
              <p className="officer-assessment-note">
                Final decisions remain with the officer.
              </p>
            </section>
          </div>
        ) : (
          <p className="officer-message">System overview is unavailable.</p>
        )}
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default AdminOverview;