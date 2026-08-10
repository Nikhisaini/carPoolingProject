import { Route, Routes } from "react-router-dom";
import Register from "../pages/auth/Register/Register";
import VerifyOtp from "../pages/auth/VerifyOtp/VerifyOtp";
import Layout from "../layouts/layout";
import Login from "../pages/auth/Login/Login";
import Profile from "../pages/user/Profile/Profile";
import CompleteProfile from "../pages/user/Profile/completeProfile";
import EditProfile from "../pages/user/Profile/EditProfile";
import AddLicence from "../pages/user/Licence/AddLicence";
import MyVehicle from "@/pages/user/Vehicle/MyVehicle";
import VehicleDetail from "@/pages/user/Vehicle/VehicleDetail";
import EditVehicle from "@/pages/user/Vehicle/EditVehicle";
import AdminRoutes from "./AdminRoutes";
import ProtectedRoute from "./ProtectedRoute";
import PublishRide from "@/pages/user/Publishride/PublishRide";
import PublishRideDateTime from "@/pages/user/Publishride/PublishRideDateTime";
import PublishRideVehicle from "@/pages/user/Publishride/PublishRideVehicle";
import PublishRideSeats from "@/pages/user/Publishride/PublishRideSeats";
import PublishRidePreferences from "@/pages/user/Publishride/PublishRidePreferences";
import PublishRidePrice from "@/pages/user/Publishride/PublishRidePrice";
import PublishRideReview from "@/pages/user/Publishride/PublishRideReview";
import AddVehicle from "@/pages/user/Vehicle/AddVehicle";
import MyRides from "@/pages/user/MyRides/MyRides";
import SearchRides from "@/pages/searchRides/SearchRides";
import Home from "@/pages/home/Home";
import Unauthorized from "@/pages/unauthorized/Unauthorized";
import RideResults from "@/pages/searchRides/RideResults";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/search" element={<SearchRides />} />
        <Route path="search/ride/results" element={<RideResults />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/add-licence" element={<AddLicence />} />
          <Route path="/add-vehicle" element={<AddVehicle />} />
          <Route path="/my-vehicle" element={<MyVehicle />} />
          <Route path="/vehicle/:id" element={<VehicleDetail />} />
          <Route path="/edit-vehicle/:id" element={<EditVehicle />} />
          <Route path="/publish-ride" element={<PublishRide />} />
          <Route
            path="/publish-ride/date-time"
            element={<PublishRideDateTime />}
          />{" "}
          <Route
            path="/publish-ride/vehicle"
            element={<PublishRideVehicle />}
          />
          <Route path="/publish-ride/seats" element={<PublishRideSeats />} />
          <Route
            path="/publish-ride/preferences"
            element={<PublishRidePreferences />}
          />
          <Route path="/publish-ride/price" element={<PublishRidePrice />} />
          <Route path="/publish-ride/review" element={<PublishRideReview />} />
          <Route path="/my-rides" element={<MyRides />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
