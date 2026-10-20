import { useNavigate } from "react-router-dom";
import "../role.css";

function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="page-center">
      <div className="glass role-card">
        <h1>Certificate Automation and Verification System</h1>
        <p className="subtitle">Select your role to continue</p>

        <div className="role-buttons">
          <button className="btn-primary" onClick={() => navigate("/user")}>
            👤 User Portal
          </button>

          <button className="btn-success" disabled>
            🛡 Officer Portal
          </button>
          <p className="role-note">Officer Portal arrives in release v1.1.0</p>
        </div>
      </div>
    </div>
  );
}

export default RoleSelect;