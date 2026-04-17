import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../Images/logo.jpg";
import { GrTwitter } from "react-icons/gr";
import { RiFacebookFill } from "react-icons/ri";
import { AiOutlineInstagram } from "react-icons/ai";
import { GrYoutube } from "react-icons/gr";
import { FaPhoneAlt } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { MdLocationOn } from "react-icons/md";
import { toast } from "../utils/toast";
import { subscribeNewsletter } from "../api/newsletter";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubscribe = async () => {
    const trimmed = email.trim();

    if (!trimmed) {
      toast.error("Please enter your email address.");
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await subscribeNewsletter(trimmed);
      toast.success("Thank you! Check your inbox 🐾");
      setEmail("");
    } catch (err) {
      const status = err?.response?.status;
      if (status === 429) {
        toast.error("Too many attempts. Please try again later.");
      } else if (status === 503) {
        toast.error("Email service is not configured yet. Check back soon!");
      } else {
        toast.error("Subscription failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubscribe();
  };

  return (
    <footer className="footer-container">
      <div className="footer-main">
        <div className="footer-social-media">
          <div className="footer-social-media-top">
            <img src={logo} className="footer-logo" alt="logo" />
            <span className="social-media-header">Ado-Pet</span>
          </div>
          <p className="footer-social-media-text">
            Finding loving homes for every pet. Because every animal deserves a family.
          </p>
          <div className="footer-social-media-links">
            <GrTwitter size="2em" className="twitter-link" />
            <RiFacebookFill size="2em" className="facebook-link" />
            <AiOutlineInstagram size="2em" className="instagram-link" />
            <GrYoutube size="2em" className="youTube-link" />
          </div>
        </div>

        <div className="footer-contact-us">
          <h2 className="contact-us-header">Contact Us</h2>
          <div className="contact-us-info-container">
            <div className="contact-us-contact">
              <span className="contact-us-logo">
                <FaPhoneAlt size="1.1em" />
              </span>
              <span className="contact-us-info">(+972)3-1234-567</span>
            </div>
            <div className="contact-us-contact">
              <span className="contact-us-logo">
                <HiOutlineMail size="1.3em" />
              </span>
              <span className="contact-us-info">Ado-Pet@PetLover.com</span>
            </div>
            <div className="contact-us-contact">
              <span className="contact-us-logo">
                <MdLocationOn size="1.3em" />
              </span>
              <span className="contact-us-info">
                121 Menachem Begin Rd, Tel Aviv, 61st Floor
              </span>
            </div>
          </div>
        </div>

        <div className="footer-working-hours">
          <h2 className="working-hours-header">Working Hours</h2>
          <span className="working-hours-text">Monday to Friday</span>
          <span className="working-hours-text">Open from 9am – 6pm</span>
          <span className="working-hours-text">Holidays/Weekends – Closed</span>
        </div>

        <div className="footer-newsletter">
          <h2 className="newsletter-header">Newsletter</h2>
          <input
            className="newsletter-input"
            placeholder="Your Email..."
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="newsletter-button"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? "SENDING..." : "SUBSCRIBE"}
          </button>
        </div>
      </div>

      <div className="footer-bottom">
        <hr className="footer-bottom-breaking-line" />
        <div className="footer-bottom-copyright">
          <Link to="/terms" className="footer-copyright-text terms-of-use">Terms of Use</Link>
          <Link to="/privacy" className="footer-copyright-text privacy-policy">Privacy Policy</Link>
          <span className="footer-copyright-text">
            Copyright © {currentYear} Ado-Pet LTD. All rights reserved.
          </span>
          <span className="footer-copyright-text">Made by Snir Yulzari</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
