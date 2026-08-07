import api from "@/services/Api";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  BadgeCheck,
  CircleX,
  Clock3,
  CalendarDays,
  CarFront,
  Fuel,
  Users,
  Palette,
  Hash,
  ImageIcon,
} from "lucide-react";

function VehicleDetail() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);

  const getVehicle = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/vehicle/${id}`);
      setVehicle(res.data.vehicle);
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getVehicle();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">Loading...</div>
    );
  }
  if (errorMessage) {
    return <div className="text-center text-red-600 py-10">{errorMessage}</div>;
  }
  if (!vehicle) {
    return <div className="text-center py-10">Vehicle not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="text-center text-xl font-semibold">Loading...</div>
        ) : !vehicle ? (
          <div className="text-center text-red-500 text-xl">
            Vehicle not found
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <div>
                <div className="flex items-center gap-3">
                  <CarFront className="w-8 h-8 text-blue-600" />
                  <h2 className="text-3xl font-bold">
                    {vehicle.brand} {vehicle.model}
                  </h2>
                </div>

                <p className="flex items-center gap-2 text-gray-500 mt-3">
                  <Hash className="w-5 h-5" />
                  {vehicle.registrationNumber}
                </p>
              </div>

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

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl shadow p-6">
                <div className="relative">
                  <img
                    src={`http://localhost:8081/${vehicle.vehicleImages?.[selectedImage]}`}
                    alt={vehicle.brand}
                    className="w-full h-[420px] rounded-3xl object-cover"
                  />

                  <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    {selectedImage + 1}/{vehicle.vehicleImages?.length || 0}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mt-5">
                  {vehicle.vehicleImages?.map((image, index) => (
                    <img
                      key={index}
                      src={`http://localhost:8081/${image}`}
                      onClick={() => setSelectedImage(index)}
                      className={`h-24 w-full object-cover rounded-xl cursor-pointer border-2 transition duration-300

                     ${
                       selectedImage === index
                         ? "border-blue-600 scale-105"
                         : "border-transparent hover:border-blue-300 hover:scale-105"
                     }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5 mt-8">
                <div className="bg-slate-50 rounded-2xl p-5 flex items-center gap-4">
                  <CarFront className="text-blue-600" />
                  <div>
                    <p className="text-gray-500 text-sm">Vehicle Type</p>
                    <p className="font-semibold">
                      {vehicle.vehicleTypeId?.name}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 flex items-center gap-4">
                  <Fuel className="text-orange-500" />
                  <div>
                    <p className="text-gray-500 text-sm">Fuel Type</p>
                    <p className="font-semibold">{vehicle.fuelTypeId?.name}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 flex items-center gap-4">
                  <CalendarDays className="text-purple-600" />
                  <div>
                    <p className="text-gray-500 text-sm">Manufacture Year</p>
                    <p className="font-semibold">{vehicle.manufactureYear}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 flex items-center gap-4">
                  <Users className="text-green-600" />
                  <div>
                    <p className="text-gray-500 text-sm">Seats</p>
                    <p className="font-semibold">
                      {vehicle.seatingCapacity} Seats
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 flex items-center gap-4">
                  <Palette className="text-pink-600" />
                  <div>
                    <p className="text-gray-500 text-sm">Color</p>
                    <p className="font-semibold">{vehicle.color}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl shadow p-8 mt-10">
              <h2 className="text-2xl font-bold mb-6">Vehicle Documents</h2>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">RC Front</h3>

                  <img
                    src={`http://localhost:8081/${vehicle.rcFrontImage}`}
                    className="rounded-xl h-64 w-full object-cover border"
                    alt=""
                  />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">RC Back</h3>

                  <img
                    src={`http://localhost:8081/${vehicle.rcBackImage}`}
                    className="rounded-xl h-64 w-full object-cover border"
                    alt=""
                  />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Insurance</h3>

                  <img
                    src={`http://localhost:8081/${vehicle.insuranceImage}`}
                    className="rounded-xl h-64 w-full object-cover border"
                    alt=""
                  />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl shadow p-8 mt-10 flex flex-col md:flex-row justify-between items-center">
              <div>
                <p className="text-gray-500">Created:</p>
                <p>{new Date(vehicle.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-4 mt-6 md:mt-0">
                <Link
                  to={`/edit-vehicle/${vehicle._id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
                >
                  Edit Vehicle
                </Link>

                <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl">
                  Delete Vehicle
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default VehicleDetail;
