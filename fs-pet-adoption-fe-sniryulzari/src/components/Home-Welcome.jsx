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
            Every pet in our centre has a story — and every story deserves a
            happy ending. At Ado-Pet, we connect rescue animals with warm,
            loving families who give them the second chance they deserve.
            Over <strong>500+ pets</strong> have already found their forever
            homes with us, and we're just getting started. Could your family
            be next?
          </p>

          <ul className="home-welcome-text-middle">
            <li className="home-welcome-icon-text">
              <BsFillCheckCircleFill className="checkIcon" size="1em" />
              <span className="home-welcome-icon-text-line">
                CERTIFIED ADOPTION CENTRE
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
              <span className="home-welcome-icon-text-line">500+ PETS REHOMED</span>
            </li>
            <li className="home-welcome-icon-text">
              <BsFillCheckCircleFill className="checkIcon" size="1em" />
              <span className="home-welcome-icon-text-line">
                LIFELONG ADOPTION SUPPORT
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
