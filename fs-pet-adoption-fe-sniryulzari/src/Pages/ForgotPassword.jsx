import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/users";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-page-container">
        <div className="auth-page-card">
          <div className="auth-page-icon">📬</div>
          <h1 className="auth-page-title">Check your inbox</h1>
          <p className="auth-page-subtitle">
            If <strong>{email}</strong> is registered with Ado-Pet, you'll receive
            a password reset link shortly. Check your spam folder if you don't see it.
          </p>
          <Link to="/" className="auth-page-link">Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-container">
      <div className="auth-page-card">
        <div className="auth-page-icon">🔑</div>
        <h1 className="auth-page-title">Forgot Password?</h1>
        <p className="auth-page-subtitle">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <form className="auth-page-form" onSubmit={handleSubmit}>
          <div className="auth-page-field">
            <label className="auth-page-label" htmlFor="fp-email">Email Address</label>
            <input
              id="fp-email"
              className="auth-page-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <p className="auth-page-error">{error}</p>}
          <button className="auth-page-btn" type="submit" disabled={loading}>
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        </form>
        <Link to="/" className="auth-page-link">Back to home</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
