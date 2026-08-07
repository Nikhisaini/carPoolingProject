import api from "@/services/Api";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function EditProfile() {
  const naviage = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    gender: "",
    dob: "",
  });

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const res = await api.get("/profile");
      const user = res.data.user;
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        gender: user.gender || "",
        dob: user.dob ? user.dob.split("T")[0] : "",
      });
      if (user.profileImage) {
        setImagePreview(`http://localhost:8081/${user.profileImage}`);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
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
    if (!formData.firstName.trim()) {
      setErrorMessage("First name is required.");
      return;
    }

    if (!formData.lastName.trim()) {
      setErrorMessage("Last name is required.");
      return;
    }

    if (!formData.gender) {
      setErrorMessage("Please select gender.");
      return;
    }

    if (!formData.dob) {
      setErrorMessage("Please select date of birth.");
      return;
    }
    try {
      setLoading(true);
      const data = new FormData();
      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("gender", formData.gender);
      data.append("dob", formData.dob);
      if (profileImage) {
        data.append("profileImage", profileImage);
      }

      const res = await api.put("/profile/update", data);
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
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

        <div className="px-8 pb-8">
          <div className="-mt-16 flex flex-col md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="relative">
                <img
                  src={
                    imagePreview ||
                    "https://ui-avatars.com/api/?name=User&background=2563eb&color=fff"
                  }
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />

                <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer">
                  📷
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChnage}
                  />
                </label>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-slate-800">
                  Edit Profile
                </h2>

                <p className="text-slate-500">
                  Update your personal information.
                </p>
                {errorMessage && (
                  <div className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-700">
                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="mt-4 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-green-700">
                    {successMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <div>
              <label className="block mb-2 font-medium">First Name</label>

              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Last Name</label>

              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Email</label>

              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full border rounded-xl px-4 py-3 bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Phone</label>

              <input
                type="text"
                value={formData.phoneNumber}
                disabled
                className="w-full border rounded-xl px-4 py-3 bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Gender</label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Date of Birth</label>

              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                max={today}
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-10">
            <button
              type="button"
              onClick={() => naviage("/profile")}
              className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold transition"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default EditProfile;
