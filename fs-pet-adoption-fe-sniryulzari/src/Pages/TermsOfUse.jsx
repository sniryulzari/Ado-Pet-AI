import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

const LAST_UPDATED = "April 16, 2026";

export default function TermsOfUse() {
  const navigate = useNavigate();

  return (
    <div className="legal-page">
      <button className="back-button legal-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
        <IoArrowBack size="1.1em" />
      </button>

      <div className="legal-hero">
        <span className="legal-tag">Legal</span>
        <h1 className="legal-title">Terms of Use</h1>
        <p className="legal-meta">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="legal-body">

        <section className="legal-section">
          <h2 className="legal-section-title">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Ado-Pet platform ("Service"), you agree to be bound by these
            Terms of Use ("Terms"). If you do not agree to all the Terms, you may not use the Service.
            These Terms apply to all visitors, users, and others who access or use the Service.
          </p>
          <p>
            We reserve the right to update these Terms at any time. Continued use of the Service
            after changes are posted constitutes your acceptance of the revised Terms.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">2. Use of Service</h2>
          <p>You agree to use the Service only for lawful purposes and in a manner that does not:</p>
          <ul className="legal-list">
            <li>Infringe the rights of others or violate any applicable laws or regulations.</li>
            <li>Transmit spam, unsolicited messages, or any harmful or misleading content.</li>
            <li>Attempt to gain unauthorized access to any part of the Service or its systems.</li>
            <li>Scrape, harvest, or collect data from the Service without written permission.</li>
            <li>Use the Service for any commercial purpose not explicitly permitted by Ado-Pet.</li>
          </ul>
          <p>
            We reserve the right to terminate or restrict your access to the Service at our
            discretion, without notice, for conduct that we believe violates these Terms.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">3. User Accounts</h2>
          <p>
            To access certain features of the Service, you must register for an account. You are
            responsible for maintaining the confidentiality of your account credentials and for all
            activities that occur under your account.
          </p>
          <p>
            You agree to provide accurate, current, and complete information during registration and
            to update such information to keep it accurate. You must notify us immediately of any
            unauthorized use of your account.
          </p>
          <p>
            We reserve the right to refuse service, terminate accounts, or remove content at our
            sole discretion.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">4. Pet Adoption Policy</h2>
          <p>
            Ado-Pet is a platform that facilitates connections between prospective adopters and
            rescue animals. By initiating an adoption or foster request through our Service, you
            acknowledge that:
          </p>
          <ul className="legal-list">
            <li>
              You are at least 18 years of age and legally capable of entering into binding agreements.
            </li>
            <li>
              You will provide a safe, loving, and appropriate environment for any animal you adopt or
              foster.
            </li>
            <li>
              Adoption and fostering is subject to review and approval by Ado-Pet staff. We reserve
              the right to deny any application.
            </li>
            <li>
              Pets listed as "Fostered" or "Adopted" are no longer available and cannot be requested
              until their status changes.
            </li>
            <li>
              Any misrepresentation in your application may result in immediate cancellation of your
              adoption and legal action.
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">5. Intellectual Property</h2>
          <p>
            All content on the Service — including but not limited to text, graphics, logos, images,
            and software — is the property of Ado-Pet or its content suppliers and is protected by
            applicable intellectual property laws.
          </p>
          <p>
            You may not reproduce, distribute, modify, create derivative works of, publicly display,
            or otherwise exploit any part of the Service without our prior written consent.
          </p>
          <p>
            By uploading photos or other content to the Service, you grant Ado-Pet a non-exclusive,
            worldwide, royalty-free license to use, reproduce, and display that content in connection
            with operating the Service.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">6. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by applicable law, Ado-Pet and its officers, employees,
            agents, and licensors shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages arising out of your use of, or inability to use,
            the Service.
          </p>
          <p>
            Ado-Pet does not warrant that the Service will be uninterrupted, error-free, or free of
            viruses or other harmful components. You use the Service at your own risk.
          </p>
          <p>
            Our total liability to you for any claim arising out of or relating to these Terms or
            the Service shall not exceed the amount you paid us (if any) in the twelve months
            preceding the claim.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">7. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will provide notice of
            significant changes by updating the "Last updated" date at the top of this page and,
            where appropriate, by sending you an email notification.
          </p>
          <p>
            Your continued use of the Service after any changes to these Terms constitutes your
            acceptance of the new Terms. If you do not agree to the new Terms, please stop using
            the Service.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">8. Contact</h2>
          <p>If you have questions about these Terms, please contact us:</p>
          <ul className="legal-list">
            <li><strong>Email:</strong> legal@ado-pet.com</li>
            <li><strong>Address:</strong> 121 Menachem Begin Rd, Tel Aviv, 61st Floor</li>
            <li><strong>Phone:</strong> (+972) 3-1234-567</li>
          </ul>
        </section>

      </div>
    </div>
  );
}
