import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import Toast from "./Toast";

function OfficerView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pendingDecision, setPendingDecision] = useState(null);
  const [toast, setToast] = useState(null);

  const closeToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    let active = true;

    async function loadApplication() {
      try {
        const response = await api.get(`/officer/applications/${id}`);
        if (active) {
          setApplication(response.data.application);
        }
      } catch (error) {
        if (active) {
          setToast({
            message:
              error.response?.data?.error || "Could not load this application",
            type: "error"
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadApplication();

    return () => {
      active = false;
    };
  }, [id]);

  const submitDecision = async () => {
    if (!pendingDecision) return;

    try {
      setSubmitting(true);
      const response = await api.post(
        `/officer/applications/${id}/decision`,
        { decision: pendingDecision }
      );

      setApplication((current) => ({
        ...current,
        status: response.data.application.status
      }));
      setPendingDecision(null);
      setToast({
        message: response.data.message,
        type: "success"
      });

      window.setTimeout(() => navigate("/officer"), 1200);
    } catch (error) {
      setToast({
        message:
          error.response?.data?.error || "Could not save the decision",
        type: "error"
      });
      setPendingDecision(null);
    } finally {
      setSubmitting(false);
    }
  };

  const apiBaseUrl = api.defaults.baseURL.replace(/\/$/, "");

  return (
    <div className="page-center">
      <main className="glass officer-card officer-detail-card">
        <button className="btn-link" onClick={() => navigate("/officer")}>
          ← Back to review queue
        </button>

        {loading ? (
          <p className="officer-message">Loading application...</p>
        ) : !application ? (
          <div className="officer-message">
            <h1>Application unavailable</h1>
            <button
              className="btn-primary"
              onClick={() => navigate("/officer")}
            >
              Return to review queue
            </button>
          </div>
        ) : (
          <>
            <div className="officer-heading">
              <div>
                <h1>Application Review</h1>
                <p className="subtitle">
                  Review the information and documents before making a decision.
                </p>
              </div>
              <span
                className={`status-pill ${
                  application.status === "UNDER_REVIEW"
                    ? "status-review"
                    : application.status === "APPROVED"
                      ? "status-approved"
                      : "status-rejected"
                }`}
              >
                {application.status.replaceAll("_", " ")}
              </span>
            </div>

            <section className="officer-detail-section">
              <h2>Applicant Information</h2>
              <dl className="officer-details">
                <div>
                  <dt>Name</dt>
                  <dd>{application.name}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{application.email}</dd>
                </div>
                <div>
                  <dt>Age</dt>
                  <dd>{application.age}</dd>
                </div>
                <div>
                  <dt>Certificate Type</dt>
                  <dd>{application.certificateType}</dd>
                </div>
                {application.income !== null &&
                  application.income !== undefined && (
                    <div>
                      <dt>Annual Income</dt>
                      <dd>₹{Number(application.income).toLocaleString("en-IN")}</dd>
                    </div>
                  )}
                <div>
                  <dt>Submitted</dt>
                  <dd>
                    {application.createdAt
                      ? new Date(application.createdAt).toLocaleString()
                      : "Date unavailable"}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="officer-detail-section">
              <h2>Advisory Assessment</h2>
              <p className="officer-risk-score">
                Risk score: <strong>{application.riskScore} / 100</strong>
              </p>
              <p className="officer-assessment-note">
                This score and its remarks are advisory. The officer makes the
                final decision.
              </p>
              <p className="officer-assessment-remarks">
                {application.remarks || "No risk factors detected"}
              </p>
            </section>

            <section className="officer-detail-section">
              <h2>Uploaded Documents</h2>
              {application.documents?.length ? (
                <ul className="officer-document-list">
                  {application.documents.map((document) => (
                    <li key={document.filename}>
                      <span>
                        <strong>{document.type}</strong>
                        <span className="officer-document-name">
                          {document.originalName}
                        </span>
                      </span>
                      <a
                        className="btn-link officer-document-link"
                        href={`${apiBaseUrl}/officer/applications/${id}/documents/${encodeURIComponent(document.filename)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open document
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="officer-message">
                  No documents were uploaded with this application.
                </p>
              )}
            </section>

            {application.status === "UNDER_REVIEW" && (
              <div className="officer-decision-actions">
                <button
                  className="btn-success"
                  onClick={() => setPendingDecision("APPROVED")}
                >
                  Approve
                </button>
                <button
                  className="btn-danger"
                  onClick={() => setPendingDecision("REJECTED")}
                >
                  Reject
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {pendingDecision && (
        <div className="popup-overlay">
          <section
            className="glass decision-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="decision-title"
          >
            <h2 id="decision-title">Confirm decision</h2>
            <p>
              Are you sure you want to{" "}
              <strong>{pendingDecision.toLowerCase()}</strong> this application?
              This decision cannot be changed through the review portal.
            </p>
            <div className="decision-popup-actions">
              <button
                className="btn-link"
                onClick={() => setPendingDecision(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className={
                  pendingDecision === "APPROVED" ? "btn-success" : "btn-danger"
                }
                onClick={submitDecision}
                disabled={submitting}
              >
                {submitting ? "Saving..." : `Confirm ${pendingDecision}`}
              </button>
            </div>
          </section>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
}

export default OfficerView;