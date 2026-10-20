import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Toast from "./Toast";

function OfficerDashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const closeToast = useCallback(() => setToast(null), []);

  const loadApplications = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get("/officer/review-queue");
      setApplications(response.data.applications || []);
    } catch (error) {
      setToast({
        message:
          error.response?.data?.error ||
          "Could not load the review queue. Is the backend running?",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  return (
    <div className="page-center">
      <main className="glass officer-card">
        <div className="officer-heading">
          <div>
            <button className="btn-link" onClick={() => navigate("/")}>
              ← Back to role selection
            </button>
            <h1>Officer Review Queue</h1>
            <p className="subtitle">
              Review application details and advisory findings before deciding.
            </p>
          </div>

          <button
            className="btn-primary officer-refresh"
            onClick={loadApplications}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p className="officer-message">Loading applications...</p>
        ) : applications.length === 0 ? (
          <p className="officer-message">
            There are no applications waiting for review.
          </p>
        ) : (
          <div className="officer-table-scroll">
            <div className="officer-grid" role="table" aria-label="Review queue">
              <div className="officer-grid-header" role="row">
                <div role="columnheader">Name</div>
                <div role="columnheader">Certificate</div>
                <div role="columnheader">Risk Score</div>
                <div role="columnheader">Status</div>
                <div role="columnheader">Remarks</div>
                <div role="columnheader">Action</div>
              </div>

              {applications.map((application) => (
                <div className="officer-grid-row" role="row" key={application._id}>
                  <div className="officer-cell" role="cell">
                    <span className="officer-mobile-label">Name</span>
                    <span>{application.name}</span>
                  </div>

                  <div className="officer-cell" role="cell">
                    <span className="officer-mobile-label">Certificate</span>
                    <span>{application.certificateType}</span>
                  </div>

                  <div className="officer-cell" role="cell">
                    <span className="officer-mobile-label">Risk Score</span>
                    <strong>{application.riskScore} / 100</strong>
                  </div>

                  <div className="officer-cell" role="cell">
                    <span className="officer-mobile-label">Status</span>
                    <span className="status-pill status-review">
                      {application.status.replaceAll("_", " ")}
                    </span>
                  </div>

                  <div className="officer-cell officer-remarks" role="cell">
                    <span className="officer-mobile-label">Remarks</span>
                    <span>{application.remarks || "No remarks"}</span>
                  </div>

                  <div className="officer-cell officer-action" role="cell">
                    <span className="officer-mobile-label">Action</span>
                    <button
                      className="btn-primary"
                      onClick={() =>
                        navigate(`/officer/view/${application._id}`)
                      }
                    >
                      Review
                    </button>
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

export default OfficerDashboard;