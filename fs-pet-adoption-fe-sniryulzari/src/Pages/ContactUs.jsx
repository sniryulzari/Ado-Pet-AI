import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { MdEmail, MdPhone, MdAccessTime, MdLocationOn } from "react-icons/md";
import { toast } from "../utils/toast";
import { sendContactMessage } from "../api/contact";

const SUBJECTS = [
  "Adoption Inquiry",
  "Foster Program",
  "General Question",
  "Report an Issue",
  "Partnership",
];

const INITIAL_FORM = { fullName: "", email: "", subject: "", message: "" };

export default function ContactUs() {
  const navigate = useNavigate();
  const [form, setForm]       = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.subject) {
      setError("Please select a subject.");
      return;
    }
    if (form.message.length < 20) {
      setError("Message must be at least 20 characters.");
      return;
    }

    setLoading(true);
    try {
      await sendContactMessage(form);
      toast.success("Message sent! We'll get back to you within 24 hours 🐾", {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
      setForm(INITIAL_FORM);
    } catch {
      setError("Failed to send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-container">
      {/* Back button */}
      <button className="back-button contact-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
        <IoArrowBack size="1.1em" />
      </button>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="contact-hero">
        <span className="contact-hero-tag">We'd love to hear from you</span>
        <h1 className="contact-hero-title">Get in Touch with Ado-Pet</h1>
        <p className="contact-hero-subtitle">
          Whether you're curious about adopting, want to become a foster, or just have a question
          about our shelter — we're here for you. Send us a message and we'll respond within 24 hours.
        </p>
      </section>

      {/* ── Main content ──────────────────────────────────── */}
      <section className="contact-main-section">

        {/* Contact form */}
        <div className="contact-form-card">
          <h2 className="contact-card-title">Send Us a Message</h2>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form-row">
              <div className="contact-field">
                <label className="contact-label" htmlFor="cf-name">Full Name *</label>
                <input
                  id="cf-name"
                  className="contact-input"
                  type="text"
                  name="fullName"
                  placeholder="Jane Smith"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="contact-field">
                <label className="contact-label" htmlFor="cf-email">Email Address *</label>
                <input
                  id="cf-email"
                  className="contact-input"
                  type="email"
                  name="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="contact-field">
              <label className="contact-label" htmlFor="cf-subject">Subject *</label>
              <select
                id="cf-subject"
                className="contact-input contact-select"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
              >
                <option value="">— Select a subject —</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="contact-field">
              <label className="contact-label" htmlFor="cf-message">
                Message * <span className="contact-char-hint">(min 20 chars · {form.message.length})</span>
              </label>
              <textarea
                id="cf-message"
                className="contact-input contact-textarea"
                name="message"
                placeholder="Tell us how we can help…"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
              />
            </div>

            {error && <p className="contact-error">{error}</p>}

            <button className="contact-submit-btn" type="submit" disabled={loading}>
              {loading ? "Sending…" : "Send Message"}
            </button>
          </form>
        </div>

        {/* Info panel */}
        <div className="contact-info-panel">
          <h2 className="contact-card-title">Contact Information</h2>
          <ul className="contact-info-list">
            <li className="contact-info-item">
              <MdLocationOn className="contact-info-icon" size="1.3em" />
              <span>121 Menachem Begin Rd, Tel Aviv, 61st Floor</span>
            </li>
            <li className="contact-info-item">
              <MdEmail className="contact-info-icon" size="1.3em" />
              <a href="mailto:contact@ado-pet.com" className="contact-info-link">
                contact@ado-pet.com
              </a>
            </li>
            <li className="contact-info-item">
              <MdPhone className="contact-info-icon" size="1.3em" />
              <a href="tel:+972500000000" className="contact-info-link">
                +972-50-000-0000
              </a>
            </li>
            <li className="contact-info-item">
              <MdAccessTime className="contact-info-icon" size="1.3em" />
              <span>
                Sun–Thu: 9:00–18:00<br />
                Fri: 9:00–13:00
              </span>
            </li>
          </ul>

          {/* Social media */}
          <div className="contact-social-section">
            <p className="contact-social-label">Follow Us</p>
            <div className="contact-social-icons">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="contact-social-link contact-social-fb" aria-label="Facebook">
                <FaFacebook size="1.4em" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="contact-social-link contact-social-ig" aria-label="Instagram">
                <FaInstagram size="1.4em" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="contact-social-link contact-social-tw" aria-label="Twitter">
                <FaTwitter size="1.4em" />
              </a>
            </div>
          </div>

          {/* OpenStreetMap embed — no API key required */}
          <div className="contact-map-wrapper">
            <iframe
              title="Ado-Pet location — Tel Aviv"
              src="https://www.openstreetmap.org/export/embed.html?bbox=34.7,32.0,35.0,32.1&layer=mapnik"
              width="100%"
              height="220"
              style={{ border: 0, borderRadius: "12px" }}
              allowFullScreen=""
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
