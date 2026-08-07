import api from "@/services/Api";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditVehicle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [vehicleImages, setVehicleImages] = useState([]);
  const [rcFrontImage, setRcFrontImage] = useState(null);
  const [rcBackImage, setRcBackImage] = useState(null);
  const [insuranceImage, setInsuranceImage] = useState(null);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [vehicleData, setVehicleData] = useState({
    vehicleTypeId: "",
    model: "",
    brand: "",
    manufactureYear: "",
    color: "",
    registrationNumber: "",
    fuelTypeId: "",
    seatingCapacity: "",
  });

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const vehicleRes = await api.get("/vehicle-type/list");
        setVehicleTypes(vehicleRes.data.data);

        const fuelRes = await api.get("/fuel-type/list");
        setFuelTypes(fuelRes.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchMasterData();
  }, []);
  const getVehicle = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/vehicle/${id}`);
      setVehicleData({
        vehicleTypeId: res.data.vehicle.vehicleTypeId?._id,
        model: res.data.vehicle.model,
        brand: res.data.vehicle.brand,
        manufactureYear: res.data.vehicle.manufactureYear,
        color: res.data.vehicle.color,
        registrationNumber: res.data.vehicle.registrationNumber,
        fuelTypeId: res.data.vehicle.fuelTypeId?._id,
        seatingCapacity: res.data.vehicle.seatingCapacity,
      });
      console.log(res.data);
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

  const handleChange = (e) => {
    setVehicleData({
      ...vehicleData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("vehicleTypeId", vehicleData.vehicleTypeId);
      formData.append("model", vehicleData.model);
      formData.append("brand", vehicleData.brand);
      formData.append("manufactureYear", vehicleData.manufactureYear);
      formData.append("color", vehicleData.color);
      formData.append("registrationNumber", vehicleData.registrationNumber);
      formData.append("fuelTypeId", vehicleData.fuelTypeId);
      formData.append("seatingCapacity", vehicleData.seatingCapacity);

      vehicleImages.forEach((image) => {
        formData.append("vehicleImages", image);
      });

      if (rcFrontImage) {
        formData.append("rcFrontImage", rcFrontImage);
      }
      if (rcBackImage) {
        formData.append("rcBackImage", rcBackImage);
      }
      if (insuranceImage) {
        formData.append("insuranceImage", insuranceImage);
      }

      const res = await api.put(`/vehicle/update/${id}`, formData);
      setSuccessMessage(res.data.message);
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-100 py-10">
      <div className="max-w-5xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Edit Vehicle</h1>
            <p className="text-blue-100 mt-2">Update your vehicle details.</p>
          </div>
          {errorMessage && (
            <div className="mb-4 rounded-lg bg-red-100 border border-red-400 text-red-700 px-4 py-3">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-lg bg-green-100 border border-green-400 text-green-700 px-4 py-3">
              {successMessage}
            </div>
          )}
          <div className="p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="font-semibold block mb-2">Vehicle Type</label>
                <select
                  name="vehicleTypeId"
                  value={vehicleData.vehicleTypeId}
                  onChange={handleChange}
                >
                  <option value="">Select Vehicle Type</option>

                  {vehicleTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-2">Brand</label>

                <input
                  type="text"
                  name="brand"
                  value={vehicleData.brand}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                />
              </div>

              <div>
                <label className="font-semibold block mb-2">Model</label>

                <input
                  type="text"
                  name="model"
                  value={vehicleData.model}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                />
              </div>

              <div>
                <label className="font-semibold block mb-2">
                  Manufacture Year
                </label>

                <input
                  type="number"
                  name="manufactureYear"
                  value={vehicleData.manufactureYear}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                />
              </div>

              <div>
                <label className="font-semibold block mb-2">Color</label>

                <input
                  type="text"
                  name="color"
                  value={vehicleData.color}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                />
              </div>

              <div>
                <label className="font-semibold block mb-2">
                  Registration Number
                </label>

                <input
                  type="text"
                  name="registrationNumber"
                  value={vehicleData.registrationNumber}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                />
              </div>

              <div>
                <label className="font-semibold block mb-2">Fuel Type</label>
                <select
                  name="fuelTypeId"
                  value={vehicleData.fuelTypeId}
                  onChange={handleChange}
                >
                  <option value="">Select Fuel Type</option>

                  {fuelTypes.map((fuel) => (
                    <option key={fuel._id} value={fuel._id}>
                      {fuel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-2">
                  Seating Capacity
                </label>

                <input
                  type="number"
                  name="seatingCapacity"
                  value={vehicleData.seatingCapacity}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                />
              </div>
            </div>
            <div className="border-t pt-8">
              <h2 className="text-xl font-bold mb-6">
                Replace Vehicle Documents
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="font-semibold block mb-2">
                    Vehicle Images
                  </label>

                  <input
                    type="file"
                    multiple
                    onChange={(e) =>
                      setVehicleImages(Array.from(e.target.files))
                    }
                    className="w-full border rounded-xl p-3"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-2">
                    RC Front Image
                  </label>

                  <input
                    type="file"
                    onChange={(e) => setRcFrontImage(e.target.files[0])}
                    className="w-full border rounded-xl p-3"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-2">
                    RC Back Image
                  </label>

                  <input
                    type="file"
                    onChange={(e) => setRcBackImage(e.target.files[0])}
                    className="w-full border rounded-xl p-3"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-2">
                    Insurance Image
                  </label>

                  <input
                    type="file"
                    onChange={(e) => setInsuranceImage(e.target.files[0])}
                    className="w-full border rounded-xl p-3"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold"
            >
              {loading ? "Updating..." : "Update Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditVehicle;
