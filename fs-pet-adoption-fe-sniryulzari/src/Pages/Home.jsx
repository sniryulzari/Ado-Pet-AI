import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SignupModal from "../components/SignupModal";
import LoginModal from "../components/LoginModal";
import { UsersContext } from "../Context/Context-Users";
import HomeWelcome from "../components/Home-Welcome";
import HomePhotoGallery from "../components/Home-Photo-Gallery";
import PetOfTheWeek from "../components/Home-PetOfTheWeek";
import HomeClientsTestimonials from "../components/Home-Clients-Testimonials";
import Footer from "../components/Footer";
import desktopImage from "../Images/dog-4310597_1280.jpg";
import mobileImage from "../Images/alvan-nee-ZCHj_2lJP00-unsplash.jpg";
import hillsSvg from "../Images/hills.svg";

const Home = () => {
  const [show, setShow]           = useState(false);
  const [loginShow, setLoginShow] = useState(false);

  const { isLoggedIn, setFirstName, setLastName } = useContext(UsersContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Restore display name from localStorage on mount (set during login).
    // Names are not credentials so localStorage is acceptable here.
    const firstName = JSON.parse(localStorage.getItem("userFirstName"));
    const lastName  = JSON.parse(localStorage.getItem("userLastName"));
    if (firstName) setFirstName(firstName);
    if (lastName)  setLastName(lastName);
  }, []);

  return (
    <div className="home-container">
      <div className="home-top-container">
        <picture>
          <source media="(max-width: 699px)"  srcSet={mobileImage} />
          <source media="(min-width: 700px)"  srcSet={desktopImage} />
          <img src={desktopImage} alt="pet" />
        </picture>
        <img src={hillsSvg} alt="hills" className="hills" />

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
          {isLoggedIn ? (
            <button className="welcome-login-search-Button" onClick={() => navigate("/search")}>
              Search
            </button>
          ) : (
            <button className="welcome-login-search-Button" onClick={() => setLoginShow(true)}>
              LOGIN
            </button>
          )}
        </div>

        <SignupModal show={show} handleClose={() => setShow(false)} handleLoginShow={() => setLoginShow(true)} />
        <LoginModal loginShow={loginShow} handleLoginClose={() => setLoginShow(false)} handleShow={() => setShow(true)} />
      </div>

      <HomeWelcome />
      <HomePhotoGallery />
      <PetOfTheWeek />
      <HomeClientsTestimonials />
      <Footer />
    </div>
  );
};

export default Home;
