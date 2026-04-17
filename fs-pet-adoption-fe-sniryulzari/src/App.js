import React from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { UsersProvider } from "./Context/Context-Users";
import { PetsProvider } from "./Context/Context-Pets";
import { ThemeProvider } from "./Context/ThemeContext";
import NavigationBar from "./components/NavBar";
import ErrorBoundary from "./components/ErrorBoundary";
import PageTransition from "./components/PageTransition";
import Home from "./Pages/Home";
import MyPets from "./Pages/MyPets";
import ProfileSettings from "./Pages/ProfileSettings";
import AdminAddPet from "./Pages/Admin-AddPet";
import AdminEditPet from "./Pages/Admin-EditPet";
import AdminDashboard from "./Pages/Admin-Dashboard";
import AdminUserPets from "./Pages/Admin-UserPets";
import SearchPets from "./Pages/Search";
import PetCard from "./components/Pet-Info";
import AboutUs from "./Pages/AboutUs";
import AdoptionSuccess from "./Pages/AdoptionSuccess";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import ContactUs from "./Pages/ContactUs";
import SavedPets from "./Pages/SavedPets";
import TermsOfUse from "./Pages/TermsOfUse";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import NotFound from "./Pages/NotFound";
import UserRoute from "./routes/userRoute";
import AdminRoute from "./routes/adminRoute";
import ToastNotifications from "./components/ToastNotifications";

// AnimatedRoutes must be a child of BrowserRouter so useLocation works.
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/about" element={<PageTransition><AboutUs /></PageTransition>} />
        <Route path="/adoption-success" element={<PageTransition><AdoptionSuccess /></PageTransition>} />
        <Route path="/search" element={<PageTransition><SearchPets /></PageTransition>} />
        <Route path="/petcard" element={<PageTransition><PetCard /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><ContactUs /></PageTransition>} />
        <Route path="/terms"   element={<PageTransition><TermsOfUse /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />

        <Route element={<UserRoute />}>
          <Route path="/profile-Settings" element={<PageTransition><ProfileSettings /></PageTransition>} />
          <Route path="/myPets" element={<PageTransition><MyPets /></PageTransition>} />
          <Route path="/saved-pets" element={<PageTransition><SavedPets /></PageTransition>} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin-AddPet" element={<PageTransition><AdminAddPet /></PageTransition>} />
          <Route path="/admin-EditPet" element={<PageTransition><AdminEditPet /></PageTransition>} />
          <Route path="/admin-Dashboard" element={<PageTransition><AdminDashboard /></PageTransition>} />
          <Route path="/admin-UserPets" element={<PageTransition><AdminUserPets /></PageTransition>} />
        </Route>

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

// App is now a pure layout/router — no state, no API calls, no context values.
const App = () => (
  <ThemeProvider>
    <UsersProvider>
      <PetsProvider>
        <div className="main-container">
          <BrowserRouter>
            <NavigationBar />
            <ToastNotifications />
            <ErrorBoundary>
              <AnimatedRoutes />
            </ErrorBoundary>
          </BrowserRouter>
        </div>
      </PetsProvider>
    </UsersProvider>
  </ThemeProvider>
);

export default App;
