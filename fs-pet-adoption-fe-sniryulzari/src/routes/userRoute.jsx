import { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { UsersContext } from "../Context/Context-Users";

export default function UserRoute() {
  const { isLoggedIn, authChecked } = useContext(UsersContext);
  // Wait for the initial getUserInfo() call to finish before deciding.
  // Without this, the route redirects to "/" on every page refresh because
  // isLoggedIn is false for the brief moment before the cookie is verified.
  if (!authChecked) return null;
  return isLoggedIn ? <Outlet /> : <Navigate to="/" />;
}
