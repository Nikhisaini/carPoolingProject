import api from "@/services/Api";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Loader2, User as UserIcon } from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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

function CompleteProfile() {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});
  const today = new Date().toISOString().split("T")[0];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        image: "Please select a valid image file.",
      }));
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_IMAGE_SIZE_MB) {
      setErrors((prev) => ({
        ...prev,
        image: `Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB.`,
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, image: "" }));
    setProfileImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const calculateAge = (dobString) => {
    const dobDate = new Date(dobString);
    const now = new Date();
    let age = now.getFullYear() - dobDate.getFullYear();
    const monthDiff = now.getMonth() - dobDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && now.getDate() < dobDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!gender) {
      newErrors.gender = "Please select your gender";
    }

    if (!dob) {
      newErrors.dob = "Please select your date of birth";
    } else if (calculateAge(dob) < MIN_AGE) {
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
      const formData = new FormData();
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }
      formData.append("gender", gender);
      formData.append("dob", dob);
      const res = await api.put("/profile/update", formData);
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        {/* =====================================================
            HEADING
        ===================================================== */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Complete your profile
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Add a few more details to continue.
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* =====================================================
              AVATAR
          ===================================================== */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={imagePreview || undefined} alt="Profile" />
                <AvatarFallback>
                  <UserIcon className="h-8 w-8 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>

              <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-blue-600 text-white hover:bg-blue-700">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              JPG or PNG, up to {MAX_IMAGE_SIZE_MB}MB
            </p>
            {errors.image && (
              <p className="mt-1 text-xs text-red-600">{errors.image}</p>
            )}
          </div>

          {/* =====================================================
              FIELDS
          ===================================================== */}
          <div>
            <Label htmlFor="gender" className="mb-1.5 block">
              Gender
            </Label>
            <Select
              value={gender}
              onValueChange={(value) => {
                setGender(value);
                setErrors((prev) => ({ ...prev, gender: "" }));
                setErrorMessage("");
              }}
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
              value={dob}
              max={today}
              onChange={(e) => {
                setDob(e.target.value);
                setErrors((prev) => ({ ...prev, dob: "" }));
                setErrorMessage("");
              }}
            />
            {errors.dob && (
              <p className="mt-1 text-xs text-red-600">{errors.dob}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save profile"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default CompleteProfile;
