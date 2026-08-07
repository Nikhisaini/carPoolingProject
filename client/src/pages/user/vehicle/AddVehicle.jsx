import React, { useEffect, useRef, useState } from "react";
import api from "../../../services/Api";

function AddVehicle() {
  const [formData, setFormData] = useState({
    vehicleType: "",
    model: "",
    brand: "",
    manufactureYear: "",
    color: "",
    registrationNumber: "",
    fuelType: "",
    seatingCapacity: "",
  });
  const [vehicleImages, setVehicleImages] = useState([]);
  const [rcFrontImage, setRcFrontImage] = useState(null);
  const [rcBackImage, setRcBackImage] = useState(null);
  const [insuranceImage, setInsuranceImage] = useState(null);
  const [loading, setloading] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const vehicleImagesRef = useRef(null);
  const rcFrontRef = useRef(null);
  const rcBackRef = useRef(null);
  const insuranceRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [vehicleRes, fuelRes] = await Promise.all([
          api.get("/vehicle-type/list"),
          api.get("/fuel-type/list"),
        ]);

        setVehicleTypes(vehicleRes.data.data);
        setFuelTypes(fuelRes.data.data);
      } catch (error) {
        console.log("Master Data Error", error);
      }
    };
    fetchMasterData();
  }, []);

  const handleVehicleImages = (e) => {
    setVehicleImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (
        !formData.vehicleType ||
        !formData.brand ||
        !formData.model ||
        !formData.manufactureYear ||
        !formData.color ||
        !formData.registrationNumber ||
        !formData.fuelType ||
        !formData.seatingCapacity
      ) {
        setErrorMessage("Please fill all required fields.");
        return;
      }

      if (vehicleImages.length === 0) {
        setErrorMessage("Please upload at least one vehicle image.");
        return;
      }

      if (!rcFrontImage || !rcBackImage || !insuranceImage) {
        setErrorMessage("Please upload all required document images.");
        return;
      }
      setloading(true);

      const data = new FormData();
      data.append("vehicleTypeId", formData.vehicleType);
      data.append("model", formData.model);
      data.append("brand", formData.brand);
      data.append("manufactureYear", formData.manufactureYear);
      data.append("color", formData.color);
      data.append(
        "registrationNumber",
        formData.registrationNumber.trim().toUpperCase(),
      );
      data.append("fuelTypeId", formData.fuelType);
      data.append("seatingCapacity", formData.seatingCapacity);

      vehicleImages.forEach((image) => {
        data.append("vehicleImages", image);
      });

      if (rcFrontImage) {
        data.append("rcFrontImage", rcFrontImage);
      }
      if (rcBackImage) {
        data.append("rcBackImage", rcBackImage);
      }
      if (insuranceImage) {
        data.append("insuranceImage", insuranceImage);
      }

      const res = await api.post("/vehicle/add", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccessMessage(res.data.message);

      setFormData({
        vehicleType: "",
        model: "",
        brand: "",
        manufactureYear: "",
        color: "",
        registrationNumber: "",
        fuelType: "",
        seatingCapacity: "",
      });

      setVehicleImages([]);
      setRcFrontImage(null);
      setRcBackImage(null);
      setInsuranceImage(null);
      vehicleImagesRef.current.value = "";
      rcFrontRef.current.value = "";
      rcBackRef.current.value = "";
      insuranceRef.current.value = "";
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      setErrorMessage(message);
    } finally {
      setloading(false);
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
            <h1 className="text-3xl font-bold text-white">Add Your Vehicle</h1>

            <p className="text-blue-100 mt-2">
              Add your vehicle details for verification.
            </p>
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
          <div className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-semibold">Vehicle Type</label>

                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl p-3"
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
                <label className="block mb-2 font-semibold">Brand</label>

                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                  placeholder="Hyundai"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">Model</label>

                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                  placeholder="i20"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">
                  Manufacture Year
                </label>

                <input
                  type="number"
                  name="manufactureYear"
                  value={formData.manufactureYear}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  required
                  className="w-full border rounded-xl p-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">Color</label>

                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">
                  Registration Number
                </label>

                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">Fuel Type</label>

                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl p-3"
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
                <label className="block mb-2 font-semibold">
                  Seating Capacity
                </label>

                <input
                  type="number"
                  name="seatingCapacity"
                  value={formData.seatingCapacity}
                  onChange={handleChange}
                  min="1"
                  required
                  className="w-full border rounded-xl p-3"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-semibold">
                  Vehicle Images
                </label>

                <input
                  ref={vehicleImagesRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleVehicleImages}
                  className="w-full border rounded-xl p-3"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">
                  RC Front Image
                </label>

                <input
                  ref={rcFrontRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setRcFrontImage(e.target.files[0])}
                  className="w-full border rounded-xl p-3"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">
                  RC Back Image
                </label>

                <input
                  ref={rcBackRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setRcBackImage(e.target.files[0])}
                  className="w-full border rounded-xl p-3"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">
                  Insurance Image
                </label>

                <input
                  ref={insuranceRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setInsuranceImage(e.target.files[0])}
                  className="w-full border rounded-xl p-3"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-semibold transition"
            >
              {loading ? "Submitting..." : "Add Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddVehicle;
