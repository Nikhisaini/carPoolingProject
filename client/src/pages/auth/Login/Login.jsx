import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff, Car } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import api from "@/services/Api";
import { loginSuccess } from "@/redux/slices/authSlice";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ phoneNumber: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post("/auth/login", formData);
      dispatch(
        loginSuccess({
          token: res.data.token,
          user: res.data.user,
        }),
      );
      setSuccessMessage(res.data.message);
      navigate("/");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || error.message || "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Car className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">BlaBla</span>
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Login to continue to your account.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="phoneNumber" className="mb-1.5 block">
              Phone number
            </Label>
            <Input
              id="phoneNumber"
              type="text"
              name="phoneNumber"
              placeholder="98765 43210"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {/* <span
                onClick={() => navigate("/forgot-password")}
                className="cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </span> */}
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="cursor-pointer font-medium text-blue-600 hover:text-blue-700"
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
