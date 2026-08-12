import api from "@/services/Api";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Loader2, Lock } from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MAX_IMAGE_SIZE_MB = 5;
const MIN_AGE = 18;

function EditProfile() {
  const navigate = useNavigate();
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
  const [errors, setErrors] = useState({});

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
    setErrors({ ...errors, [e.target.name]: "" });
    setErrorMessage("");
  };

  const handleGenderChange = (value) => {
    setFormData({ ...formData, gender: value });
    setErrors({ ...errors, gender: "" });
    setErrorMessage("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors({ ...errors, image: "Please select a valid image file." });
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_IMAGE_SIZE_MB) {
      setErrors({
        ...errors,
        image: `Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB.`,
      });
      return;
    }

    setErrors({ ...errors, image: "" });
    setProfileImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const calculateAge = (dobString) => {
    const dob = new Date(dobString);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    if (!formData.gender) {
      newErrors.gender = "Please select a gender";
    }

    if (!formData.dob) {
      newErrors.dob = "Please select your date of birth";
    } else if (calculateAge(formData.dob) < MIN_AGE) {
      newErrors.dob = `You must be at least ${MIN_AGE} years old`;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) return;

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

      navigate("/profile");
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

  const fullName =
    `${formData.firstName || ""} ${formData.lastName || ""}`.trim();

  return (
    <div className="min-h-screen bg-muted/30 py-10">
      <div className="mx-auto max-w-2xl px-4">
        <form onSubmit={handleSubmit}>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Edit profile
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Update your personal information.
            </p>
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={imagePreview || undefined} alt={fullName} />
                <AvatarFallback className="text-xl font-semibold">
                  {fullName ? fullName.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>

              <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-blue-600 text-white hover:bg-blue-700">
                <Camera className="h-3.5 w-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground">
                Profile photo
              </p>
              <p className="text-xs text-muted-foreground">
                JPG or PNG, up to {MAX_IMAGE_SIZE_MB}MB.
              </p>
              {errors.image && (
                <p className="mt-1 text-xs text-red-600">{errors.image}</p>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Personal information
            </h2>

            <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-background p-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName" className="mb-1.5 block">
                  First name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName" className="mb-1.5 block">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="gender" className="mb-1.5 block">
                  Gender
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={handleGenderChange}
                >
                  <SelectTrigger id="gender" className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="mt-1 text-xs text-red-600">{errors.gender}</p>
                )}
              </div>

              <div>
                <Label htmlFor="dob" className="mb-1.5 block">
                  Date of birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  max={today}
                />
                {errors.dob && (
                  <p className="mt-1 text-xs text-red-600">{errors.dob}</p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="email"
                  className="mb-1.5 flex items-center gap-1.5"
                >
                  Email
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
              </div>

              <div>
                <Label
                  htmlFor="phoneNumber"
                  className="mb-1.5 flex items-center gap-1.5"
                >
                  Phone
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </Label>
                <Input
                  id="phoneNumber"
                  type="text"
                  value={formData.phoneNumber}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/profile")}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
