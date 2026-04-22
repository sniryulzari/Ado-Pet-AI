import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

const LAST_UPDATED = "April 16, 2026";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="legal-page">
      <button className="back-button legal-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
        <IoArrowBack size="1.1em" />
      </button>

      <div className="legal-hero">
        <span className="legal-tag">Legal</span>
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-meta">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="legal-body">

        <section className="legal-section">
          <h2 className="legal-section-title">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us when you create an account, submit
            a form, or otherwise communicate with us. This includes:
          </p>
          <ul className="legal-list">
            <li><strong>Account information:</strong> your name, email address, phone number, and profile photo.</li>
            <li><strong>Profile data:</strong> bio, pet preferences, and adoption or foster history.</li>
            <li><strong>Communications:</strong> messages or emails you send us through the contact form.</li>
          </ul>
          <p>
            We also automatically collect certain information when you use the Service, such as:
          </p>
          <ul className="legal-list">
            <li>Log data (IP address, browser type, pages visited, timestamps).</li>
            <li>Device information (hardware model, operating system).</li>
            <li>Cookies and similar tracking technologies (see Section 3).</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="legal-list">
            <li>Create and manage your account and authenticate your identity.</li>
            <li>Process and manage pet adoption and fostering requests.</li>
            <li>Send you transactional emails (adoption confirmations, password resets).</li>
            <li>Send newsletter updates if you have opted in (you may unsubscribe at any time).</li>
            <li>Improve and personalize your experience on the Service.</li>
            <li>Monitor and analyse usage patterns to improve the Service.</li>
            <li>Comply with legal obligations and enforce our Terms of Use.</li>
          </ul>
          <p>
            We do not sell, rent, or lease your personal information to third parties for their
            marketing purposes without your explicit consent.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">3. Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to operate the Service. A cookie is a
            small text file stored on your device that helps us recognize you and remember your
            preferences.
          </p>
          <p>We use the following types of cookies:</p>
          <ul className="legal-list">
            <li>
              <strong>Essential cookies:</strong> Required for authentication and session management
              (e.g., our HTTP-only JWT token cookie). These cannot be disabled.
            </li>
            <li>
              <strong>Preference cookies:</strong> Remember your settings, such as dark mode.
            </li>
            <li>
              <strong>Analytics cookies:</strong> Help us understand how visitors use the Service.
              You may opt out by adjusting your browser settings.
            </li>
          </ul>
          <p>
            Most browsers allow you to refuse cookies or alert you when cookies are being sent.
            Note that disabling essential cookies may prevent you from logging in.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">4. Data Sharing</h2>
          <p>
            We may share your information with third parties only in the following circumstances:
          </p>
          <ul className="legal-list">
            <li>
              <strong>Service providers:</strong> We use trusted third-party services to operate the
              platform, including Cloudinary (image hosting), MongoDB Atlas (database), and Render
              (hosting). These providers are contractually obligated to protect your data.
            </li>
            <li>
              <strong>Legal requirements:</strong> We may disclose your information if required by
              law, court order, or governmental authority.
            </li>
            <li>
              <strong>Business transfers:</strong> In the event of a merger, acquisition, or sale of
              assets, your information may be transferred as part of that transaction.
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">5. Data Security</h2>
          <p>
            We take the security of your personal information seriously and implement appropriate
            technical and organisational measures to protect it:
          </p>
          <ul className="legal-list">
            <li>Passwords are hashed using bcrypt before storage and are never stored in plain text.</li>
            <li>Authentication tokens are stored in HTTP-only cookies to prevent client-side access.</li>
            <li>All data is transmitted over HTTPS using TLS encryption.</li>
            <li>Database access is restricted to authorised services only.</li>
          </ul>
          <p>
            Despite these measures, no method of transmission over the internet or electronic
            storage is 100% secure. We cannot guarantee absolute security.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">6. Your Rights</h2>
          <p>
            Depending on your location, you may have the following rights regarding your personal
            information:
          </p>
          <ul className="legal-list">
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Correction:</strong> Request that we correct any inaccurate or incomplete data.</li>
            <li><strong>Deletion:</strong> Request that we delete your personal data ("right to be forgotten").</li>
            <li><strong>Portability:</strong> Request your data in a structured, machine-readable format.</li>
            <li><strong>Objection:</strong> Object to the processing of your data for direct marketing purposes.</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us using the details below. We will
            respond to all requests within 30 days.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">7. Contact</h2>
          <p>
            If you have any questions about this Privacy Policy or how we handle your data, please
            contact us:
          </p>
          <ul className="legal-list">
            <li><strong>Email:</strong> privacy@ado-pet.com</li>
            <li><strong>Address:</strong> 121 Menachem Begin Rd, Tel Aviv, 61st Floor</li>
            <li><strong>Phone:</strong> (+972) 3-1234-567</li>
          </ul>
        </section>

      </div>
    </div>
  );
}
