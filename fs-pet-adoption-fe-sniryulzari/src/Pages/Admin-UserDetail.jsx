import { useLocation, useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { FaEnvelope, FaPhone, FaUser } from "react-icons/fa";

function AdminUserDetail() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const user      = state?.user;

  if (!user) {
    return (
      <div className="admin-user-detail-container">
        <button className="back-button" onClick={() => navigate(-1)}><IoArrowBack size="1.1em" /></button>
        <p>No user data found.</p>
      </div>
    );
  }

  return (
    <div className="admin-user-detail-container">
      <button className="back-button" onClick={() => navigate(-1)}><IoArrowBack size="1.1em" /></button>

      <div className="admin-user-detail-card">
        <div className="admin-user-detail-avatar-wrap">
          {user.profileImage ? (
            <img src={user.profileImage} alt={user.firstName} className="admin-user-detail-avatar" />
          ) : (
            <div className="admin-user-detail-avatar-placeholder">
              <FaUser size={48} />
            </div>
          )}
        </div>

        <h2 className="admin-user-detail-name">{user.firstName} {user.lastName}</h2>

        <div className="admin-user-detail-info">
          <div className="admin-user-detail-row">
            <FaEnvelope className="admin-user-detail-icon" />
            <span>{user.email}</span>
          </div>
          <div className="admin-user-detail-row">
            <FaPhone className="admin-user-detail-icon" />
            <span>{user.phoneNumber || "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUserDetail;
