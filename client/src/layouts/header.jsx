import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

function Header() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://flowbite.com/docs/images/logo.svg"
              alt="Logo"
              className="w-8 h-8"
            />
            <span className="text-2xl font-bold text-blue-600">BlaBlaCar</span>
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="focus:outline-none"
            >
              <img
                src="https://placehold.co/100x100/E5E7EB/6B7280?text=U"
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover cursor-pointer"
              />
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-lg border">
                {isLoggedIn ? (
                  <>
                    <Link
                      to="/profile"
                      className="block px-4 py-3 hover:bg-gray-100"
                      onClick={() => setOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/add-licence"
                      className="block px-4 py-3 hover:bg-gray-100"
                      onClick={() => setOpen(false)}
                    >
                      Add Licence
                    </Link>
                    <Link
                      to="/add-vehicle"
                      className="block px-4 py-3 hover:bg-gray-100"
                      onClick={() => setOpen(false)}
                    >
                      Add Vehicle
                    </Link>
                    <Link
                      to="/my-vehicle"
                      className="block px-4 py-3 hover:bg-gray-100"
                      onClick={() => setOpen(false)}
                    >
                      My Vehicles
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 text-red-600"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-3 hover:bg-gray-100"
                      onClick={() => setOpen(false)}
                    >
                      Login
                    </Link>

                    <Link
                      to="/register"
                      className="block px-4 py-3 hover:bg-gray-100"
                      onClick={() => setOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Header;
