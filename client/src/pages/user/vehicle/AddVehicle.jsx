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
  const [licenceApproved, setLicenceApproved] = useState(false);
  const [checkingLicence, setCheckingLicence] = useState(true);
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
    const checkLicenceAndFetchData = async () => {
      try {
        setCheckingLicence(true);

        // check licence approval
        const licenceRes = await api.get("/licence/check-approved");

        if (!licenceRes.data.success) {
          setLicenceApproved(false);
          return;
        }

        setLicenceApproved(true);

        // fetch master data only if licence approved
        const [vehicleRes, fuelRes] = await Promise.all([
          api.get("/vehicle-type/list"),
          api.get("/fuel-type/list"),
        ]);

        setVehicleTypes(vehicleRes.data.data);
        setFuelTypes(fuelRes.data.data);
      } catch (error) {
        console.log("Licence Check Error", error);
        setLicenceApproved(false);
      } finally {
        setCheckingLicence(false);
      }
    };

    checkLicenceAndFetchData();
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
    <>
      {checkingLicence ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <h2 className="text-xl font-semibold">
            Checking licence approval...
          </h2>
        </div>
      ) : !licenceApproved ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
            <h2 className="text-2xl font-bold text-red-600">
              Driving Licence Approval Pending
            </h2>

            <p className="mt-4 text-gray-600">
              Your driving licence is not approved yet. Please wait for admin
              approval before adding a vehicle.
            </p>

            <div className="mt-5 bg-yellow-100 text-yellow-800 p-3 rounded-lg">
              You can add your vehicle after licence approval.
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-100 py-10">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg">
            {/* Header */}

            <div className="bg-blue-600 text-white p-8 rounded-t-2xl">
              <h1 className="text-3xl font-bold">Add Your Vehicle</h1>

              <p className="text-blue-100 mt-2">
                Add your vehicle details for verification.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {errorMessage && (
                <div className="m-6 rounded-lg bg-red-100 border border-red-400 text-red-700 px-4 py-3">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="m-6 rounded-lg bg-green-100 border border-green-400 text-green-700 px-4 py-3">
                  {successMessage}
                </div>
              )}

              <div className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Vehicle Type */}

                  <div>
                    <label className="block mb-2 font-semibold">
                      Vehicle Type
                    </label>

                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleChange}
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

                  {/* Brand */}

                  <div>
                    <label className="block mb-2 font-semibold">Brand</label>

                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="Hyundai"
                      className="w-full border rounded-xl p-3"
                    />
                  </div>

                  {/* Model */}

                  <div>
                    <label className="block mb-2 font-semibold">Model</label>

                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      placeholder="i20"
                      className="w-full border rounded-xl p-3"
                    />
                  </div>

                  {/* Manufacture Year */}

                  <div>
                    <label className="block mb-2 font-semibold">
                      Manufacture Year
                    </label>

                    <input
                      type="number"
                      name="manufactureYear"
                      value={formData.manufactureYear}
                      onChange={handleChange}
                      className="w-full border rounded-xl p-3"
                    />
                  </div>

                  {/* Color */}

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

                  {/* Registration */}

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

                  {/* Fuel */}

                  <div>
                    <label className="block mb-2 font-semibold">
                      Fuel Type
                    </label>

                    <select
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleChange}
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

                  {/* Seating */}

                  <div>
                    <label className="block mb-2 font-semibold">
                      Seating Capacity
                    </label>

                    <input
                      type="number"
                      name="seatingCapacity"
                      value={formData.seatingCapacity}
                      onChange={handleChange}
                      className="w-full border rounded-xl p-3"
                    />
                  </div>
                </div>

                {/* Images */}

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
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-semibold"
                >
                  {loading ? "Submitting..." : "Add Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AddVehicle;
