import { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { UsersContext } from "../Context/Context-Users";

export default function AdminRoute() {
  const { isAdmin, authChecked } = useContext(UsersContext);
  // Wait for the initial getUserInfo() call to finish before deciding.
  // Without this, admin users get redirected to "/" on every page refresh
  // because isAdmin is false until the cookie is verified.
  if (!authChecked) return null;
  return isAdmin ? <Outlet /> : <Navigate to="/" />;
}
