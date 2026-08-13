import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Car,
  FileText,
  LogOut,
  ChevronDown,
  PlusCircle,
  Search,
  CarTaxiFront,
  Bookmark,
  Calendar,
} from "lucide-react";
import { logout } from "@/redux/slices/authSlice";
import api from "@/services/Api";

function Header() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) {
        setProfile(null);
        return;
      }
      if (user?.profileImage) {
        setProfile(user);
        return;
      }
      try {
        const response = await api.get("/profile");
        const profileData = response.data?.data || response.data?.user;
        if (profileData) {
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Header Profile Error:", error);
        setProfile(user || null);
      }
    };

    fetchProfile();
  }, [isAuthenticated, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setProfile(null);
    setOpen(false);
    navigate("/login");
  };

  const currentUser = profile || user;

  const firstName = currentUser?.firstName || "User";
  const lastName = currentUser?.lastName || "";

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`
    .toUpperCase()
    .trim();

  const profileImage = currentUser?.profileImage;

  const profileImageUrl = profileImage
    ? profileImage.startsWith("http")
      ? profileImage
      : `http://localhost:8081/${profileImage.replace(/^\/+/, "")}`
    : null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <Car />

          <span className="text-xl font-bold tracking-tight text-gray-900">
            YooHuCar
          </span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/search"
            title="Search Rides"
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 hover:text-blue-600"
          >
            <Search size={20} />
          </Link>

          <Link
            to="/publish-ride"
            className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-blue-600"
          >
            <PlusCircle size={18} />
            Publish Ride
          </Link>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1.5 transition hover:border-gray-300 hover:bg-gray-50 focus:outline-none"
          >
            {isAuthenticated ? (
              <>
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={`${firstName} ${lastName}`}
                    className="h-9 w-9 rounded-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                      event.currentTarget.nextElementSibling.style.display =
                        "flex";
                    }}
                  />
                ) : null}

                <div
                  className={`h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white ${
                    profileImageUrl ? "hidden" : "flex"
                  }`}
                >
                  {initials}
                </div>

                <span className="hidden max-w-24 truncate text-sm font-medium text-gray-800 sm:block">
                  {firstName}
                </span>
              </>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                <User size={19} />
              </div>
            )}

            <ChevronDown
              size={17}
              className={`text-gray-500 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
              {isAuthenticated ? (
                <>
                  <div className="border-b border-gray-100 bg-gray-50 px-4 py-4">
                    <div className="flex items-center gap-3">
                      {profileImageUrl ? (
                        <img
                          src={profileImageUrl}
                          alt={`${firstName} ${lastName}`}
                          className="h-11 w-11 shrink-0 rounded-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                            event.currentTarget.nextElementSibling.style.display =
                              "flex";
                          }}
                        />
                      ) : null}

                      <div
                        className={`h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white ${
                          profileImageUrl ? "hidden" : "flex"
                        }`}
                      >
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">
                          {firstName} {lastName}
                        </p>

                        <p className="truncate text-xs text-gray-500">
                          {currentUser?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    <User size={18} />
                    Profile
                  </Link>

                  <Link
                    to="/my-licence"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    <FileText size={18} />
                    Licence
                  </Link>

                  <Link
                    to="/my-vehicles"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    <Car size={18} />
                    Vehicles
                  </Link>

                  <Link
                    to="/my-rides"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    <CarTaxiFront size={18} />
                    Rides
                  </Link>
                  <Link
                    to="/my-bookings"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    <Calendar size={18} />
                    Bookings
                  </Link>

                  <div className="border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User size={18} />
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="block border-t border-gray-100 px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex border-t border-gray-100 px-5 py-2 md:hidden">
        <div className="flex w-full items-center justify-center gap-2">
          <Link
            to="/publish-ride"
            className="flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Publish Ride
          </Link>

          <Link
            to="/my-rides"
            className="flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            My Rides
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Header;
