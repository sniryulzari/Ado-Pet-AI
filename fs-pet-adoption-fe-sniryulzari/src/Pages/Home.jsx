import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SignupModal from "../components/SignupModal";
import LoginModal from "../components/LoginModal";
import { UsersContext } from "../Context/Context-Users";
import HomeWelcome from "../components/Home-Welcome";
import HomePhotoGallery from "../components/Home-Photo-Gallery";
import PetOfTheWeek from "../components/Home-PetOfTheWeek";
import HomeClientsTestimonials from "../components/Home-Clients-Testimonials";
import HomeStatsBar from "../components/Home-StatsBar";
import HomeTypeFilter from "../components/Home-TypeFilter";
import Footer from "../components/Footer";
import desktopImage from "../Images/dog-4310597_1280.jpg";
import mobileImage from "../Images/alvan-nee-ZCHj_2lJP00-unsplash.jpg";

const PET_TYPES = ["Dog", "Cat", "Horse", "Dolphin", "Tiger"];

// Inline SVG so CSS can control fill color via currentColor (dark mode support)
function HillsWave() {
  return (
    <svg
      className="hills"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M421.9,6.5c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.9,23.5,100.5,35.7
           c75.8,32.2,133.7,44.5,192.6,49.7c23.6,2.1,48.7,3.5,103.4-2.5
           c54.7-6,106.2-25.6,106.2-25.6V0H0v30.3c0,0,72,32.6,158.4,30.5
           c39.2-0.7,92.8-6.7,134-22.4c21.2-8.1,52.2-18.2,79.7-24.2
           C399.3,7.9,411.6,7.5,421.9,6.5z"
      />
    </svg>
  );
}

const fadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: "easeOut" },
  }),
};

const Home = () => {
  const [show, setShow]           = useState(false);
  const [loginShow, setLoginShow] = useState(false);
  const [heroType, setHeroType]   = useState("");
  const [heroName, setHeroName]   = useState("");

  const { isLoggedIn, setFirstName, setLastName } = useContext(UsersContext);
  const navigate = useNavigate();

  function handleHeroSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (heroType) params.set("type", heroType);
    if (heroName.trim()) params.set("name", heroName.trim());
    navigate(`/search${params.toString() ? `?${params}` : ""}`);
  }

  useEffect(() => {
    // Restore display name from localStorage on mount (set during login).
    // Names are not credentials so localStorage is acceptable here.
    const firstName = JSON.parse(localStorage.getItem("userFirstName"));
    const lastName  = JSON.parse(localStorage.getItem("userLastName"));
    if (firstName) setFirstName(firstName);
    if (lastName)  setLastName(lastName);
  }, [setFirstName, setLastName]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="home-container">
      <div className="home-top-container">
        <picture>
          <source media="(max-width: 699px)"  srcSet={mobileImage} />
          <source media="(min-width: 700px)"  srcSet={desktopImage} />
          <img src={desktopImage} alt="pet" />
        </picture>
        <HillsWave />

        {/*
          Removed four decorative SVG images that were loaded over plain HTTP
          from demo2.themelexus.com — a third-party domain. Those images were
          a supply chain risk (SVGs can embed JavaScript) and loaded over HTTP
          (MitM-vulnerable). Replace them with locally bundled SVGs if the
          decorations are needed in future.
        */}

        <div className="welcome-container">
          <span className="welcome-title-top">Two Is always Better Than One</span>
          <span className="welcome-title-bottom-start">AdoPet Your</span>
          <span className="welcome-title-bottom-end">New Best Friend</span>

          <form className="hero-quick-search" onSubmit={handleHeroSearch}>
            <select
              className="hero-qs-select"
              value={heroType}
              onChange={(e) => setHeroType(e.target.value)}
              aria-label="Pet type"
            >
              <option value="">Any Type</option>
              {PET_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <input
              className="hero-qs-input"
              type="text"
              placeholder="Pet name…"
              value={heroName}
              onChange={(e) => setHeroName(e.target.value)}
              aria-label="Pet name"
            />

            <button type="submit" className="hero-qs-btn">
              Find a Pet
            </button>
          </form>

          {!isLoggedIn && (
            <p className="hero-qs-login-hint">
              Already have an account?{" "}
              <button className="hero-qs-login-link" onClick={() => setLoginShow(true)}>
                Log in
              </button>
            </p>
          )}
        </div>

        <SignupModal show={show} handleClose={() => setShow(false)} handleLoginShow={() => setLoginShow(true)} />
        <LoginModal loginShow={loginShow} handleLoginClose={() => setLoginShow(false)} handleShow={() => setShow(true)} />
      </div>

      <HomeStatsBar />
      <HomeTypeFilter />

      {[HomeWelcome, HomePhotoGallery, PetOfTheWeek, HomeClientsTestimonials, Footer].map(
        (Section, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            <Section />
          </motion.div>
        )
      )}
    </div>
  );
};

export default Home;
