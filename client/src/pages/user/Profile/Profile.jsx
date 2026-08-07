import api from "@/services/Api";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getProfile = async () => {
    try {
      const res = await api.get("/profile");
      setUser(res.data.user);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  if (loading) {
    return <h2>Loading....</h2>;
  }

  const handleDelete = async () => {
    const ok = window.confirm("Are yoi sure you want to deltet your account");
    try {
      const res = await api.delete("/profile/delete");
      alert(res.data.message);
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 ">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        <div className="px-8 pb-8">
          <div className="-mt-16 flex flex-col md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <img
                src={
                  user?.profileImage
                    ? `http://localhost:8081/${user.profileImage}`
                    : "https://ui-avatars.com/api/?name=User&background=2563eb&color=fff"
                }
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
              />

              <div className="mt-4 md:mt-0">
                <h2 className="text-3xl font-bold text-gray-800">
                  {user?.firstName} {user?.lastName}
                </h2>

                <p className="text-gray-500">{user?.email}</p>

                {user?.isVerified ? (
                  <span className="inline-block mt-3 px-4 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                    Verified
                  </span>
                ) : (
                  <span className="inline-block mt-3 px-4 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                    NotVerified
                  </span>
                )}
              </div>
            </div>

            {!user?.profileCompleted ? (
              <Link
                to="/complete-profile"
                className="mt-6 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                Complete Profile
              </Link>
            ) : (
              <Link
                to="/edit-profile"
                className="mt-6 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                Edit Profile
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <div className="bg-gray-50 rounded-xl p-5 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">
                Personal Information
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">First Name</p>
                  <p className="font-medium">{user?.firstName}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Last Name</p>
                  <p className="font-medium">{user?.lastName}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{user?.gender || "Not Added"}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">
                    {user?.dob
                      ? new Date(user.dob).toLocaleDateString()
                      : "Not Added"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">
                Contact Information
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{user?.phoneNumber}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={handleDelete}
                  className="mt-6 md:mt-0 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
