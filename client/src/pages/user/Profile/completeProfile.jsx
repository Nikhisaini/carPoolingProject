import api from "@/services/Api";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function CompleteProfile() {
  const naviage = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const handleImageChnage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    if (!gender) {
      setErrorMessage("Please select gender.");
      return;
    }
    if (!dob) {
      setErrorMessage("Please select date of birth.");
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }
      formData.append("gender", gender);
      formData.append("dob", dob);
      const res = await api.put("/profile/update", formData);
      setSuccessMessage(res.data.message);

      naviage("/profile");
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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8"
      >
        <h1 className="text-3xl font-bold text-center text-slate-800">
          Complete Your Profile
        </h1>

        <p className="text-center text-slate-500 mt-2">
          Add your personal information to continue.
        </p>
        {errorMessage && (
          <div className="mt-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mt-6 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-green-700">
            {successMessage}
          </div>
        )}
        <div className="mt-8 flex flex-col items-center">
          <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-blue-500 shadow">
            <img
              src={
                imagePreview ||
                "https://ui-avatars.com/api/?name=User&background=2563eb&color=fff"
              }
              alt="Profile Preview"
              className="w-full h-full object-cover"
            />
          </div>

          <label className="mt-5 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition">
            Upload Photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChnage}
            />
          </label>
        </div>
        <div className="mt-8">
          <label className="block mb-2 font-medium text-slate-700">
            Gender
          </label>

          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="mt-6">
          <label className="block mb-2 font-medium text-slate-700">
            Date of Birth
          </label>

          <input
            type="date"
            value={dob}
            max={today}
            onChange={(e) => setDob(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
        >
          {loading ? "Saving....." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}

export default CompleteProfile;
