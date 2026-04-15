import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { UsersProvider } from "./Context/Context-Users";
import { PetsProvider } from "./Context/Context-Pets";
import NavigationBar from "./components/NavBar";
import ErrorBoundary from "./components/ErrorBoundary";
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
import NotFound from "./Pages/NotFound";
import UserRoute from "./routes/userRoute";
import AdminRoute from "./routes/adminRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// App is now a pure layout/router — no state, no API calls, no context values.
// All state lives in UsersProvider and PetsProvider. The getServerUrl function
// is gone — the API layer (src/api/client.js) owns the server URL.
const App = () => (
  <UsersProvider>
    <PetsProvider>
      <div className="main-container">
        <BrowserRouter>
          <NavigationBar />
          <ToastContainer />
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/adoption-success" element={<AdoptionSuccess />} />
              <Route path="/search" element={<SearchPets />} />
              <Route path="/petcard" element={<PetCard />} />

              <Route element={<UserRoute />}>
                <Route path="/profile-Settings" element={<ProfileSettings />} />
                <Route path="/myPets" element={<MyPets />} />
              </Route>

              <Route element={<AdminRoute />}>
                <Route path="/admin-AddPet" element={<AdminAddPet />} />
                <Route path="/admin-EditPet" element={<AdminEditPet />} />
                <Route path="/admin-Dashboard" element={<AdminDashboard />} />
                <Route path="/admin-UserPets" element={<AdminUserPets />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </div>
    </PetsProvider>
  </UsersProvider>
);

export default App;
