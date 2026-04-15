import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-card">
        <span className="not-found-paw" role="img" aria-label="paw print">🐾</span>
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">This page ran away</h2>
        <p className="not-found-text">
          Looks like this page went on an adventure without us. Let&rsquo;s get
          you back to the pets that are waiting for a loving home!
        </p>
        <button className="not-found-button" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    </div>
  );
}
