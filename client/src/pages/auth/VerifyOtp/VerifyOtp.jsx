import api from "@/services/Api";
import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, Loader2, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OTP_LENGTH = 6;

function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const userId = location.state?.userId || "";
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef([]);

  const otp = otpDigits.join("");

  const setDigit = (index, value) => {
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleDigitChange = (index, e) => {
    const value = e.target.value.replace(/\D/g, "");

    if (!value) {
      setDigit(index, "");
      return;
    }
    const char = value.slice(-1);
    setDigit(index, char);
    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (otpDigits[index]) {
        setDigit(index, "");
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        setDigit(index - 1, "");
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;

    e.preventDefault();
    const chars = pasted.slice(0, OTP_LENGTH).split("");
    const next = Array(OTP_LENGTH).fill("");
    chars.forEach((char, i) => {
      next[i] = char;
    });
    setOtpDigits(next);

    const focusIndex = Math.min(chars.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otp.length !== OTP_LENGTH) {
      return alert("Please enter the 6-digit OTP");
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
      setResending(true);
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
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <Mail className="h-7 w-7 text-blue-600" />
          </div>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
            Verify your email
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            We've sent a 6-digit verification code to your email address.
          </p>
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6">
          <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={cn(
                  "h-14 w-12 rounded-lg border border-border bg-background text-center text-xl font-semibold text-foreground outline-none transition-colors",
                  "focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                  digit && "border-blue-300 bg-blue-50/50",
                )}
              />
            ))}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Didn't receive the code?
          </p>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending}
            className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            {resending ? "Resending..." : "Resend OTP"}
          </button>
        </div>

        <div className="mt-8 border-t border-border pt-5">
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="flex w-full items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to register
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;
