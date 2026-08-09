import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home/Home";
import Register from "../pages/auth/Register/Register";
import VerifyOtp from "../pages/auth/VerifyOtp/VerifyOtp";
import Layout from "../layouts/layout";
import Login from "../pages/auth/Login/Login";
import Profile from "../pages/user/Profile/Profile";
import CompleteProfile from "../pages/user/Profile/completeProfile";
import EditProfile from "../pages/user/Profile/EditProfile";
import AddLicence from "../pages/user/Licence/AddLicence";
import AddVehicle from "../pages/user/vehicle/AddVehicle";
import MyVehicle from "@/pages/user/vehicle/MyVehicle";
import VehicleDetail from "@/pages/user/vehicle/VehicleDetail";
import EditVehicle from "@/pages/user/vehicle/EditVehicle";
import AdminRoutes from "./AdminRoutes";
import ProtectedRoute from "./ProtectedRoute";
import Unauthorized from "@/pages/Unauthorized/Unauthorized";
import PublishRide from "@/pages/user/publishride/PublishRide";
import PublishRideDateTime from "@/pages/user/publishride/PublishRideDateTime";
import PublishRideVehicle from "@/pages/user/publishride/PublishRideVehicle";
import PublishRideSeats from "@/pages/user/publishride/PublishRideSeats";
import PublishRidePreferences from "@/pages/user/publishride/PublishRidePreferences";
import PublishRidePrice from "@/pages/user/publishride/PublishRidePrice";
import PublishRideReview from "@/pages/user/publishride/PublishRideReview";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
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
          ```
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
