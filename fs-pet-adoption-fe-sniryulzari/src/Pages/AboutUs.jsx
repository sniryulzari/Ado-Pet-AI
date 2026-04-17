import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { searchPets } from "../api/pets";
import Spinner from "../components/Spinner";

const PET_TYPES = ["Dog", "Cat", "Horse", "Dolphin", "Tiger"];

const ADOPTION_STEPS = [
  {
    title: "Browse & Fall in Love",
    desc: "Explore our listings by type, breed, or personality. Every profile tells a story — take your time finding the one that speaks to you.",
  },
  {
    title: "Submit an Application",
    desc: "Fill out a short form about your home and lifestyle. We match pets to families thoughtfully, not just quickly.",
  },
  {
    title: "Meet & Greet",
    desc: "Come in for a supervised visit. Watch how you and your potential pet interact — magic usually happens fast.",
  },
  {
    title: "Approval & Agreement",
    desc: "Once approved, you'll sign an adoption agreement and pay a small fee that covers vaccinations and microchipping.",
  },
  {
    title: "Welcome Home!",
    desc: "Pack the car, prepare the welcome corner, and bring your new family member home. Your life just got better.",
  },
];

const FOSTER_STEPS = [
  {
    title: "Apply to Foster",
    desc: "No need to own your home — renters, families, and singles are all welcome. Tell us a little about your space.",
  },
  {
    title: "Orientation & Training",
    desc: "We walk you through feeding schedules, behavior basics, and what to expect. It's easier than you think.",
  },
  {
    title: "Pick Up Your Foster Pet",
    desc: "We supply food, bedding, and initial veterinary care. All you need to bring is warmth and patience.",
  },
  {
    title: "Ongoing Support",
    desc: "Our team checks in regularly. Have a question at 11pm? We're here. Fostering shouldn't feel lonely.",
  },
  {
    title: "Help Find Their Forever Family",
    desc: "Your updates, photos, and stories are what help us find the perfect permanent home. You're part of the team.",
  },
];

export default function AboutUs() {
  const navigate = useNavigate();
  const [petCounts, setPetCounts] = useState({});
  const [totalPets, setTotalPets] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setLoading(true);
    searchPets({})
      .then((res) => {
        const all = res.data ?? [];
        setTotalPets(all.length);
        const counts = {};
        PET_TYPES.forEach((type) => {
          counts[type] = all.filter((p) => p.type === type).length;
        });
        setPetCounts(counts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="about-container">
      <button
        className="back-button about-back-button"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        <IoArrowBack size="1.1em" />
      </button>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="about-hero">
        <span className="about-hero-tag">Our Mission</span>
        <h1 className="about-hero-title">Every Pet Deserves a&nbsp;Forever&nbsp;Home</h1>
        <p className="about-hero-text">
          Ado-Pet was founded on one simple belief: no animal should spend its life waiting for
          someone to care. We're a passionate team of animal lovers, volunteers, and advocates
          dedicated to connecting rescue pets with warm, loving families. Since our founding, we've
          helped thousands of dogs, cats, and exotic animals begin new chapters — and we're just
          getting started.
        </p>
        <div className="about-hero-badges">
          {[
            "Certified Adoption Centre",
            "20 Years of Experience",
            "Animal Welfare Advocates",
            "Rescue & Rehome Network",
          ].map((badge) => (
            <span key={badge} className="about-hero-badge">
              <BsFillCheckCircleFill size="0.85em" style={{ marginRight: "0.4rem" }} />
              {badge}
            </span>
          ))}
        </div>
      </section>

      {/* ── Pet Counts ───────────────────────────────────── */}
      <section className="about-counts-section">
        <h2 className="about-section-title">Who's Waiting for You</h2>
        {loading ? (
          <Spinner />
        ) : (
          <>
            <p className="about-section-subtitle">
              Right now,{" "}
              <strong style={{ color: "#ff4880" }}>{totalPets}</strong> incredible
              animals are ready to meet their match.
            </p>
            <div className="about-counts-grid">
              {PET_TYPES.map((type) => (
                <div key={type} className="about-count-card">
                  <span className="about-count-number">{petCounts[type] ?? 0}</span>
                  <span className="about-count-label">{type}s</span>
                </div>
              ))}
            </div>
          </>
        )}
        <button className="about-cta-button" onClick={() => navigate("/search")}>
          Browse All Pets
        </button>
      </section>

      {/* ── Adoption Process ─────────────────────────────── */}
      <section className="about-process-section about-process-pink">
        <h2 className="about-section-title about-section-title--light">How Adoption Works</h2>
        <p className="about-section-subtitle about-section-subtitle--light">
          Bringing a pet into your family is one of the most rewarding decisions you'll ever make.
          Here's how we make the process simple and joyful.
        </p>
        <div className="about-steps">
          {ADOPTION_STEPS.map((step, i) => (
            <div key={i} className="about-step">
              <div className="about-step-number">{i + 1}</div>
              <div className="about-step-content">
                <h3 className="about-step-title">{step.title}</h3>
                <p className="about-step-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          className="about-cta-button about-cta-button--outline"
          onClick={() => navigate("/search")}
        >
          Find Your Pet →
        </button>
      </section>

      {/* ── Foster Process ───────────────────────────────── */}
      <section className="about-process-section">
        <h2 className="about-section-title">How Fostering Works</h2>
        <p className="about-section-subtitle">
          Not ready for a permanent commitment? Fostering gives a pet safety and love while they
          wait — and it might just change your life too.
        </p>
        <div className="about-steps">
          {FOSTER_STEPS.map((step, i) => (
            <div key={i} className="about-step">
              <div className="about-step-number about-step-number--yellow">{i + 1}</div>
              <div className="about-step-content">
                <h3 className="about-step-title">{step.title}</h3>
                <p className="about-step-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="about-cta-button" onClick={() => navigate("/search")}>
          Become a Foster →
        </button>
      </section>
    </div>
  );
}
