import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import petImg2 from "../Images/petImg2.jpeg";
import { BsFillCheckCircleFill } from "react-icons/bs";

function HomeWelcome() {
  const [isMousedOver, setMouseOver] = useState(false);
  const navigate = useNavigate();

  function handleMouseOver() {
    setMouseOver(true);
  }

  function handleMouseOut() {
    setMouseOver(false);
  }

  return (
    <section className="home-welcome-container">
      <h1 className="home-welcome-heading">Welcome To </h1>
      <h1 className="home-welcome-heading">Ado-Pet Centre</h1>
      <div className="home-welcome-content">
        <div className="home-welcome-img">
          <div
            className="petImg3"
            style={{
              animationName: isMousedOver ? "petImg3-hover" : "petImg3-unhover",
            }}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          ></div>
          <img
            src={petImg2}
            alt="pet"
            className="petImg2"
            style={{
              animationName: isMousedOver ? "petImg2-hover" : "petImg2-unhover",
            }}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          />
        </div>
        <div className="home-welcome-text">
          <p className="home-welcome-text-top">
            Grooming & Supply provides grooming services for all dog and cat
            breeds. We are fully committed to the health and hygiene of your
            furry best friends. We offer free estimates and consultations to
            help your pet look and feel their best!
          </p>

          <ul className="home-welcome-text-middle">
            <li className="home-welcome-icon-text">
              <BsFillCheckCircleFill className="checkIcon" size="1em" />
              <span className="home-welcome-icon-text-line">
                CERTIFIED ADOPTION
              </span>
            </li>
            <li className="home-welcome-icon-text">
              <BsFillCheckCircleFill className="checkIcon" size="1em" />
              <span className="home-welcome-icon-text-line">
                20 YEARS OF EXPERIENCE
              </span>
            </li>
            <li className="home-welcome-icon-text">
              <BsFillCheckCircleFill className="checkIcon" size="1em" />
              <span className="home-welcome-icon-text-line">ANIMAL LOVER</span>
            </li>
            <li className="home-welcome-icon-text">
              <BsFillCheckCircleFill className="checkIcon" size="1em" />
              <span className="home-welcome-icon-text-line">
                PET PARENT OF 3 DOGS
              </span>
            </li>
          </ul>

          <div>
            <button className="learn-more-button" onClick={() => navigate("/about")}>LEARN MORE</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeWelcome;
