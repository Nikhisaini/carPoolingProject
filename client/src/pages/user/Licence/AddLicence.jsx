import api from "@/services/Api";
import React, { useEffect, useRef, useState } from "react";

function AddLicence() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [licenceCategories, setLicenceCategories] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);
  const [formData, setFormData] = useState({
    licenceNumber: "",
    // holderName: "",
    // dob: "",
    // issueDate: "",
    // expiryDate: "",
    categories: [],
  });
  const today = new Date().toISOString().split("T")[0];
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setbackImage] = useState(null);

  useEffect(() => {
    getLicenceCategories();
  }, []);

  const getLicenceCategories = async () => {
    try {
      const res = await api.get("/licence-category");
      console.log(res.data);
      setLicenceCategories(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      categories: checked
        ? [...prev.categories, value]
        : prev.categories.filter((id) => id !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    try {
      setLoading(true);
      const data = new FormData();
      data.append("licenceNumber", formData.licenceNumber);
      // data.append("holderName", formData.holderName);
      // data.append("dob", formData.dob);
      // data.append("issueDate", formData.issueDate);
      // data.append("expiryDate", formData.expiryDate);
      formData.categories.forEach((category) => {
        data.append("categories", category);
      });

      if (!frontImage) {
        setErrorMessage("Please upload front image.");
        return;
      }

      if (!backImage) {
        setErrorMessage("Please upload back image.");
        return;
      }

      if (formData.categories.length === 0) {
        setErrorMessage("Please select at least one category.");
        return;
      }
      data.append("frontImage", frontImage);
      data.append("backImage", backImage);
      const res = await api.post("/licence/add", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccessMessage(res.data.message);

      setFormData({
        licenceNumber: "",
        // holderName: "",
        // dob: "",
        // issueDate: "",
        // expiryDate: "",
        categories: [],
      });
      setFrontImage(null);
      setbackImage(null);
      frontInputRef.current.value = "";
      backInputRef.current.value = "";
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-10 py-8">
            <h1 className="text-3xl font-bold text-white">
              Driving Licence Verification
            </h1>
            <p className="text-blue-100 mt-2">
              Upload your driving licence for quick verification.
            </p>
          </div>

          <div className="p-8 space-y-8">
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
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Licence Number
                </label>
                <input
                  type="text"
                  name="licenceNumber"
                  value={formData.licenceNumber}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Enter licence number"
                />
              </div>

              {/* <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Holder Name
                </label>
                <input
                  type="text"
                  name="holderName"
                  value={formData.holderName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Enter holder name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  max={today}
                  value={formData.dob}
                  required
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Issue Date
                </label>
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div> */}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Vehicle Categories
              </h2>

              <div className="flex flex-wrap gap-4">
                {licenceCategories.map((item) => (
                  <label
                    key={item._id}
                    className="flex items-center gap-3 px-5 py-3 border rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition"
                  >
                    <input
                      type="checkbox"
                      value={item._id}
                      checked={formData.categories.includes(item._id)}
                      onChange={handleCategoryChange}
                      className="h-5 w-5 text-blue-600 rounded"
                    />

                    <span className="font-medium">{item.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition">
                <h3 className="font-semibold text-lg mb-3">Front Image</h3>

                <input
                  type="file"
                  ref={frontInputRef}
                  onChange={(e) => setFrontImage(e.target.files[0])}
                />

                {frontImage && (
                  <p className="mt-3 text-sm text-green-600">
                    {frontImage.name}
                  </p>
                )}
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition">
                <h3 className="font-semibold text-lg mb-3">Back Image</h3>

                <input
                  type="file"
                  ref={backInputRef}
                  onChange={(e) => setbackImage(e.target.files[0])}
                />

                {backImage && (
                  <p className="mt-3 text-sm text-green-600">
                    {backImage.name}
                  </p>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl text-lg font-semibold shadow-lg hover:scale-[1.02] hover:shadow-xl transition duration-300"
            >
              {loading ? "Submitting..." : "Submit for Verification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddLicence;
