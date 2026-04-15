import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UsersContext } from "../Context/Context-Users";
import { logout } from "../api/users";
import { toast } from "react-toastify";
import logo from "../Images/logo.jpg";
import { Twirl as Hamburger } from "hamburger-react";

// Nav links extracted into a variable so the desktop and mobile menus share
// the same markup. Previously the entire link list was copy-pasted twice,
// meaning any nav change had to be made in two places.
function NavLinks({ isLoggedIn, isAdmin, firstName, lastName, onLogout }) {
  return (
    <>
      <li><Link className="link" to="/">Home</Link></li>
      <li><Link className="link" to="/search">Search</Link></li>

      {isLoggedIn && (
        <li><Link className="link" to="/mypets">My Pets</Link></li>
      )}
      {isLoggedIn && (
        <li><Link className="link" to="/profile-Settings">Profile Settings</Link></li>
      )}
      {isAdmin && (
        <li><Link className="link" to="/admin-Dashboard">Admin</Link></li>
      )}
      {isLoggedIn && (
        <div className="nav-logout-container">
          <li>
            <span className="nav-welcome-user">Welcome {firstName} {lastName}</span>
            <button className="logout" onClick={onLogout}>Logout</button>
          </li>
        </div>
      )}
    </>
  );
}

function NavigationBar() {
  const { isAdmin, isLoggedIn, setIsLoggedIn, setIsAdmin, firstName, lastName } =
    useContext(UsersContext);

  const [isOpen, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.clear();
      setIsLoggedIn(false);
      setIsAdmin(false);
      navigate("/");
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <nav className="navBar">
      <ul className="desktop_nav">
        <li>
          <a href="/" className="logo-link">
            <img src={logo} alt="logo" className="nav-bar-logo" />
            <span className="nav-bar-logo-text">Ado-Pet</span>
          </a>
        </li>
        <NavLinks
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          firstName={firstName}
          lastName={lastName}
          onLogout={handleLogout}
        />
      </ul>

      <ul className="mobile_nav">
        <li className="logo-container">
          <a href="/" className="logo-link">
            <img src={logo} alt="logo" className="nav-bar-logo" />
            <span className="nav-bar-logo-text">Ado-Pet</span>
          </a>
        </li>
        <li className="hamburger-container">
          {/* Removed redundant onToggle — toggle={setOpen} already handles state */}
          <Hamburger
            toggled={isOpen}
            toggle={setOpen}
            size={25}
            direction="left"
            rounded
          />
        </li>
        {isOpen && (
          <ul className="nav_links_container">
            <NavLinks
              isLoggedIn={isLoggedIn}
              isAdmin={isAdmin}
              firstName={firstName}
              lastName={lastName}
              onLogout={handleLogout}
            />
          </ul>
        )}
      </ul>
    </nav>
  );
}

export default NavigationBar;
