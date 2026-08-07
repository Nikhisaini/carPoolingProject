import api from "@/services/Api";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const userId = location.state?.userId || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      return alert("Please enter OTP");
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/verify-otp", {
        userId,
        otp,
      });

      setSuccessMessage(res.data.message);
      navigate("/login");
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

  const handleResendOtp = async () => {
    try {
      const res = await api.post("/auth/resend-otp", {
        userId,
      });

      setSuccessMessage(res.data.message);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to resend OTP",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl">
            📧
          </div>

          <h2 className="mt-5 text-3xl font-bold text-gray-800">
            Verify Email
          </h2>

          <p className="mt-3 text-gray-500">
            We've sent a 6-digit verification code to your email address.
          </p>
        </div>
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
        <form onSubmit={handleVerifyOtp} className="mt-8 space-y-5">
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter OTP"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-4 text-center text-2xl tracking-[10px] font-semibold outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-white font-semibold shadow-lg transition hover:shadow-xl disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">Didn't receive the code?</p>

          <button
            onClick={handleResendOtp}
            className="mt-3 font-semibold text-blue-600 transition hover:text-blue-800"
          >
            Resend OTP
          </button>
        </div>

        <div className="mt-8 border-t pt-5">
          <button
            onClick={() => navigate("/register")}
            className="w-full text-center text-gray-600 transition hover:text-blue-600"
          >
            ← Back to Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;
