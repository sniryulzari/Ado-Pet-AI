import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/users";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="auth-page-container">
        <div className="auth-page-card">
          <div className="auth-page-icon">❌</div>
          <h1 className="auth-page-title">Invalid Link</h1>
          <p className="auth-page-subtitle">
            This password reset link is missing a token. Please request a new one.
          </p>
          <Link to="/forgot-password" className="auth-page-btn" style={{ display: "inline-block", textDecoration: "none" }}>
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      const msg = err?.response?.data;
      if (typeof msg === "string" && msg.includes("expired")) {
        setError("This reset link has expired. Please request a new one.");
      } else if (typeof msg === "string" && msg.includes("Invalid")) {
        setError("This reset link is invalid. Please request a new one.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page-container">
        <div className="auth-page-card">
          <div className="auth-page-icon">✅</div>
          <h1 className="auth-page-title">Password Updated!</h1>
          <p className="auth-page-subtitle">
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <Link to="/" className="auth-page-btn" style={{ display: "inline-block", textDecoration: "none" }}>
            Back to Home & Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-container">
      <div className="auth-page-card">
        <div className="auth-page-icon">🔒</div>
        <h1 className="auth-page-title">Set New Password</h1>
        <p className="auth-page-subtitle">
          Choose a strong password — at least 6 characters.
        </p>
        <form className="auth-page-form" onSubmit={handleSubmit}>
          <div className="auth-page-field">
            <label className="auth-page-label" htmlFor="rp-password">New Password</label>
            <input
              id="rp-password"
              className="auth-page-input"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="auth-page-field">
            <label className="auth-page-label" htmlFor="rp-confirm">Confirm Password</label>
            <input
              id="rp-confirm"
              className="auth-page-input"
              type="password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          {error && <p className="auth-page-error">{error}</p>}
          <button className="auth-page-btn" type="submit" disabled={loading}>
            {loading ? "Saving…" : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
