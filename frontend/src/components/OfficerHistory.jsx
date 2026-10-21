import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Toast from "./Toast";

function OfficerHistory() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const closeToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      try {
        const response = await api.get("/officer/history");
        if (active) {
          setRecords(response.data.records || []);
        }
      } catch (error) {
        if (active) {
          setToast({
            message:
              error.response?.data?.error ||
              "Could not load decision history. Is the backend running?",
            type: "error"
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page-center">
      <main className="glass officer-card">
        <div className="officer-heading">
          <div>
            <button className="btn-link" onClick={() => navigate("/officer")}>
              ← Pending applications
            </button>
            <h1>Decision History</h1>
            <p className="subtitle">
              Read-only record of officer decisions and advisory assessments.
            </p>
          </div>
          <button
            className="btn-primary officer-refresh"
            onClick={() => navigate("/officer")}
          >
            Review Queue
          </button>
        </div>

        {loading ? (
          <p className="officer-message">Loading decision history...</p>
        ) : records.length === 0 ? (
          <p className="officer-message">No decisions have been recorded yet.</p>
        ) : (
          <div className="officer-table-scroll">
            <div
              className="officer-grid history-grid"
              role="table"
              aria-label="Decision history"
            >
              <div className="officer-grid-header" role="row">
                <div role="columnheader">Applicant</div>
                <div role="columnheader">Certificate</div>
                <div role="columnheader">Decision</div>
                <div role="columnheader">Officer</div>
                <div role="columnheader">Risk Score</div>
                <div role="columnheader">Remarks</div>
              </div>

              {records.map((record) => (
                <div
                  className="officer-grid-row"
                  role="row"
                  key={record._id}
                >
                  <div className="officer-cell" role="cell">
                    <span className="officer-mobile-label">Applicant</span>
                    <span>{record.certificate?.name || "Application record"}</span>
                  </div>

                  <div className="officer-cell" role="cell">
                    <span className="officer-mobile-label">Certificate</span>
                    <span>
                      {record.certificate?.certificateType || "Unavailable"}
                    </span>
                  </div>

                  <div className="officer-cell" role="cell">
                    <span className="officer-mobile-label">Decision</span>
                    <span
                      className={`status-pill ${
                        record.decision === "APPROVED"
                          ? "status-approved"
                          : "status-rejected"
                      }`}
                    >
                      {record.decision}
                    </span>
                  </div>

                  <div className="officer-cell" role="cell">
                    <span className="officer-mobile-label">Officer</span>
                    <span>{record.officer}</span>
                  </div>

                  <div className="officer-cell" role="cell">
                    <span className="officer-mobile-label">Risk Score</span>
                    <strong>{record.riskScoreAtDecision} / 100</strong>
                  </div>

                  <div className="officer-cell officer-remarks" role="cell">
                    <span className="officer-mobile-label">Remarks</span>
                    <span>
                      {record.remarks || "No risk factors detected"}
                      <small className="history-date">
                        {record.decidedAt
                          ? new Date(record.decidedAt).toLocaleString()
                          : "Decision time unavailable"}
                      </small>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

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

export default OfficerHistory;