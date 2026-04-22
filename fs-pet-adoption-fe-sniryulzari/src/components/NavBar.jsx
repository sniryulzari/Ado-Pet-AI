import React, { useContext, useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { UsersContext } from "../Context/Context-Users";
import { ThemeContext } from "../Context/ThemeContext";
import { logout } from "../api/users";
import { toast } from "../utils/toast";
import logo from "../Images/logo.jpg";
import { Twirl as Hamburger } from "hamburger-react";
import { FaSun, FaMoon } from "react-icons/fa";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";

function NavigationBar() {
  const { isAdmin, isLoggedIn, setIsLoggedIn, setIsAdmin, firstName, lastName, profileImage, setProfileImage, setSavedPetIds } =
    useContext(UsersContext);
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);

  const [menuOpen, setMenuOpen]       = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loginShow, setLoginShow]     = useState(false);
  const [signupShow, setSignupShow]   = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close avatar dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.clear();
      setIsLoggedIn(false);
      setIsAdmin(false);
      setProfileImage("");
      setSavedPetIds(new Set());
      setDropdownOpen(false);
      setMenuOpen(false);
      navigate("/");
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  const linkClass = ({ isActive }) =>
    isActive ? "nb-link nb-link--active" : "nb-link";

  return (
    <>
      <nav className="nb-nav">
        {/* ── Logo ── */}
        <a href="/" className="nb-logo">
          <img src={logo} alt="logo" className="nb-logo-img" />
          <span className="nb-logo-text">Ado-Pet</span>
        </a>

        {/* ── Desktop links (center) ── */}
        <ul className="nb-links">
          <li><NavLink className={linkClass} to="/" end>Home</NavLink></li>
          <li><NavLink className={linkClass} to="/search">Search</NavLink></li>
          <li><NavLink className={linkClass} to="/contact">Contact Us</NavLink></li>
          {isAdmin && (
            <li><NavLink className={linkClass} to="/admin-Dashboard">Admin</NavLink></li>
          )}
        </ul>

        {/* ── Desktop right section ── */}
        <div className="nb-right">
          <button
            className="nb-theme-btn"
            onClick={() => setIsDarkMode((p) => !p)}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <FaSun size="1.1em" /> : <FaMoon size="1.1em" />}
          </button>

          {isLoggedIn ? (
            /* Avatar + dropdown */
            <div className="nb-avatar-wrap" ref={dropdownRef}>
              <button
                className="nb-avatar-btn"
                onClick={() => setDropdownOpen((p) => !p)}
                aria-label="User menu"
                aria-expanded={dropdownOpen}
              >
                {profileImage ? (
                  <img src={profileImage} alt="profile" className="nb-avatar" />
                ) : (
                  <span className="nb-avatar nb-avatar--initials">
                    {firstName ? firstName[0].toUpperCase() : "?"}
                  </span>
                )}
              </button>

              {dropdownOpen && (
                <div className="nb-dropdown">
                  <div className="nb-dropdown-header">
                    {firstName} {lastName}
                  </div>
                  <NavLink
                    className="nb-dropdown-item"
                    to="/profile-Settings"
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Profile
                  </NavLink>
                  <NavLink
                    className="nb-dropdown-item"
                    to="/mypets"
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Pets
                  </NavLink>
                  <NavLink
                    className="nb-dropdown-item"
                    to="/saved-pets"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Saved Pets
                  </NavLink>
                  <NavLink
                    className="nb-dropdown-item"
                    to="/recommendations"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Recommendations
                  </NavLink>
                  <NavLink
                    className="nb-dropdown-item"
                    to="/my-visits"
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Visits
                  </NavLink>
                  <button
                    className="nb-dropdown-item nb-dropdown-logout"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Login / Register pill buttons */
            <div className="nb-auth-btns">
              <button className="nb-btn nb-btn--ghost" onClick={() => setLoginShow(true)}>
                Login
              </button>
              <button className="nb-btn nb-btn--fill" onClick={() => setSignupShow(true)}>
                Register
              </button>
            </div>
          )}
        </div>

        {/* ── Mobile: theme toggle + hamburger ── */}
        <div className="nb-hamburger">
          <button
            className="nb-theme-btn"
            onClick={() => setIsDarkMode((p) => !p)}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <FaSun size="1.1em" /> : <FaMoon size="1.1em" />}
          </button>
          <Hamburger
            toggled={menuOpen}
            toggle={setMenuOpen}
            size={22}
            direction="left"
            rounded
          />
        </div>

        {/* ── Mobile menu panel ── */}
        {menuOpen && (
          <div className="nb-mobile-menu">
            <NavLink className={linkClass} to="/" end onClick={() => setMenuOpen(false)}>
              Home
            </NavLink>
            <NavLink className={linkClass} to="/search" onClick={() => setMenuOpen(false)}>
              Search
            </NavLink>
            <NavLink className={linkClass} to="/contact" onClick={() => setMenuOpen(false)}>
              Contact Us
            </NavLink>
            {isAdmin && (
              <NavLink className={linkClass} to="/admin-Dashboard" onClick={() => setMenuOpen(false)}>
                Admin
              </NavLink>
            )}
            {isLoggedIn ? (
              <>
                <NavLink className={linkClass} to="/profile-Settings" onClick={() => setMenuOpen(false)}>
                  My Profile
                </NavLink>
                <NavLink className={linkClass} to="/mypets" onClick={() => setMenuOpen(false)}>
                  My Pets
                </NavLink>
                <NavLink className={linkClass} to="/saved-pets" onClick={() => setMenuOpen(false)}>
                  Saved Pets
                </NavLink>
                <NavLink className={linkClass} to="/recommendations" onClick={() => setMenuOpen(false)}>
                  Recommendations
                </NavLink>
                <NavLink className={linkClass} to="/my-visits" onClick={() => setMenuOpen(false)}>
                  My Visits
                </NavLink>
                <button className="nb-link nb-link--logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <div className="nb-mobile-auth">
                <button
                  className="nb-btn nb-btn--ghost"
                  onClick={() => { setLoginShow(true); setMenuOpen(false); }}
                >
                  Login
                </button>
                <button
                  className="nb-btn nb-btn--fill"
                  onClick={() => { setSignupShow(true); setMenuOpen(false); }}
                >
                  Register
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Modals — mounted here so navbar pills work on every page */}
      <LoginModal
        loginShow={loginShow}
        handleLoginClose={() => setLoginShow(false)}
        handleShow={() => { setLoginShow(false); setSignupShow(true); }}
      />
      <SignupModal
        show={signupShow}
        handleClose={() => setSignupShow(false)}
        handleLoginShow={() => { setSignupShow(false); setLoginShow(true); }}
      />
    </>
  );
}

export default NavigationBar;
