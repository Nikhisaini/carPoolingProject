import api from "@/services/Api";
import {
  BadgeCheck,
  Car,
  CircleX,
  Clock3,
  Eye,
  Fuel,
  Hash,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MyVehicle() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLodaing] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const getMyVehicle = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    try {
      setLodaing(true);
      const res = await api.get("/vehicle/my-vehicles");
      setVehicles(res.data.vehicles);
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      setErrorMessage(message);
    } finally {
      setLodaing(false);
    }
  };

  useEffect(() => {
    getMyVehicle();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you suer you want to delete this vehicle?",
    );

    if (!confirmDelete) return;
    try {
      const res = await api.delete(`/vehicle/delete/${id}`);
      setSuccessMessage(res.data.message);
      setVehicles((prev) => prev.filter((vehicle) => vehicle._id !== id));
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong.",
      );
    }
  };
  return (
    <div className="min-h-screen bg-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4">
        {errorMessage && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-green-700">
            {successMessage}
          </div>
        )}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Car className="w-7 h-7 text-blue-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">My Vehicles</h1>
              <p className="text-gray-500">
                Manage all your registered vehicles.
              </p>
            </div>
          </div>

          <Link
            to="/add-vehicle"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl"
          >
            <Plus className="w-5 h-5" /> Add Vehicle
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-lg">Loading...</div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <h2 className="text-2xl font-bold">No Vehicles Added</h2>

            <p className="text-gray-500 mt-2">
              Add your first vehicle to start publishing rides.
            </p>

            <Link
              to="/add-vehicle"
              className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
            >
              Add Vehicle
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className="bg-white rounded-3xl shadow-md overflow-hidden hover:shadow-xl transition"
              >
                <img
                  src={`http://localhost:8081/${vehicle.vehicleImages?.[0]}`}
                  alt=""
                  className="w-full h-56 object-cover"
                />

                <div className="p-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">
                      {vehicle.brand} {vehicle.model}
                    </h2>

                    <span
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold
                      ${
                        vehicle.verificationStatus === "Approved"
                          ? "bg-green-100 text-green-700"
                          : vehicle.verificationStatus === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {vehicle.verificationStatus === "Approved" ? (
                        <BadgeCheck className="w-4 h-4" />
                      ) : vehicle.verificationStatus === "Rejected" ? (
                        <CircleX className="w-4 h-4" />
                      ) : (
                        <Clock3 className="w-4 h-4" />
                      )}

                      {vehicle.verificationStatus}
                    </span>
                  </div>

                  <div className="mt-5 space-y-2 text-gray-600">
                    <p className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-blue-600" />
                      {vehicle.vehicleTypeId?.name}
                    </p>
                    <p className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-gray-600" />
                      {vehicle.registrationNumber}
                    </p>
                    <p className="flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-orange-500" />
                      {vehicle.fuelTypeId?.name}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-600" />
                      {vehicle.seatingCapacity} Seats
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <Link
                      to={`/vehicle/${vehicle._id}`}
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>

                    <button
                      onClick={() => handleDelete(vehicle._id)}
                      className="flex items-center justify-center gap-2 bg-red-600 text-white rounded-lg py-2"
                    >
                      {" "}
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyVehicle;
