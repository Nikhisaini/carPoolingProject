import { Route, Routes } from "react-router-dom";
import Register from "../pages/Auth/Register/Register";
import VerifyOtp from "../pages/Auth/VerifyOtp/VerifyOtp";
import Layout from "../layouts/layout";
import Login from "../pages/Auth/Login/Login";
import Profile from "../pages/User/Profile/Profile";
import CompleteProfile from "../pages/User/Profile/completeProfile";
import EditProfile from "../pages/User/Profile/EditProfile";
import AddLicence from "../pages/User/Licence/AddLicence";
import MyVehicle from "@/pages/User/Vehicle/MyVehicle";
import VehicleDetail from "@/pages/User/Vehicle/VehicleDetail";
import EditVehicle from "@/pages/User/Vehicle/EditVehicle";
import AdminRoutes from "./AdminRoutes";
import ProtectedRoute from "./ProtectedRoute";
import PublishRide from "@/pages/User/Publishride/PublishRide";
import PublishRideDateTime from "@/pages/User/Publishride/PublishRideDateTime";
import PublishRideVehicle from "@/pages/User/Publishride/PublishRideVehicle";
import PublishRideSeats from "@/pages/User/Publishride/PublishRideSeats";
import PublishRidePreferences from "@/pages/User/Publishride/PublishRidePreferences";
import PublishRidePrice from "@/pages/User/Publishride/PublishRidePrice";
import PublishRideReview from "@/pages/User/Publishride/PublishRideReview";
import AddVehicle from "@/pages/User/Vehicle/AddVehicle";
import MyRides from "@/pages/User/MyRides/MyRides";
import SearchRides from "@/pages/Rides/SearchRides";
import Home from "@/pages/Home/Home";
import Unauthorized from "@/pages/Unauthorized/Unauthorized";
import RideResults from "@/pages/Rides/RideResults";
import MyLicence from "@/pages/User/Licence/MyLicence";
import RideDetail from "@/pages/Rides/RideDetail";
import MyBookings from "@/pages/User/MyBookings/MyBookings";
import ManageRide from "@/pages/User/MyRides/ManageRide";

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
        <Route path="/ride/results" element={<RideResults />} />
        <Route element={<ProtectedRoute allowedRoles={["User"]} />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/add-licence" element={<AddLicence />} />
          <Route path="/my-licence" element={<MyLicence />} />
          <Route path="/add-vehicle" element={<AddVehicle />} />
          <Route path="/my-vehicles" element={<MyVehicle />} />
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
          <Route path="/my-rides/:rideId/manage" element={<ManageRide />} />
          <Route path="/ride/:rideId" element={<RideDetail />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
