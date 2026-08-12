import React, { useEffect, useRef, useState } from "react";
import api from "@/services/Api";
import {
  Car,
  Upload,
  ImageIcon,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  X,
  Hash,
  Tag,
  Clock,
  AlertTriangle,
} from "lucide-react";

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
import { cn } from "@/lib/utils";

const MAX_IMAGE_SIZE_MB = 5;
const MAX_VEHICLE_IMAGES = 6;
const CURRENT_YEAR = new Date().getFullYear();

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];

function validateImage(file) {
  if (!file) return "Please select an image.";

  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Only JPG, PNG, WEBP and AVIF images are allowed.";
  }

  if (file.size === 0) {
    return "Selected image is empty.";
  }

  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return `Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB.`;
  }

  return null;
}

function AddVehicle() {
  const [formData, setFormData] = useState({
    licenceCategoryId: "",
    model: "",
    brand: "",
    manufactureYear: "",
    color: "",
    registrationNumber: "",
    fuelType: "",
    seatingCapacity: "",
  });

  const [vehicleImages, setVehicleImages] = useState([]);
  const [rcFrontImage, setRcFrontImage] = useState(null);
  const [rcBackImage, setRcBackImage] = useState(null);
  const [insuranceImage, setInsuranceImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [licenceApproved, setLicenceApproved] = useState(false);
  const [checkingLicence, setCheckingLicence] = useState(true);
  const [licenceCategories, setLicenceCategories] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});

  const vehicleImagesRef = useRef(null);
  const rcFrontRef = useRef(null);
  const rcBackRef = useRef(null);
  const insuranceRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setErrorMessage("");
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setErrorMessage("");
  };

  useEffect(() => {
    const checkLicenceAndFetchData = async () => {
      try {
        setCheckingLicence(true);

        const licenceRes = await api.get("/licence/check-approved");

        if (!licenceRes.data.success) {
          setLicenceApproved(false);
          return;
        }

        setLicenceApproved(true);

        const [categoryRes, fuelRes] = await Promise.all([
          api.get("/licence-category"),
          api.get("/fuel-type/list"),
        ]);

        setLicenceCategories(categoryRes.data.data);
        setFuelTypes(fuelRes.data.data);
      } catch (error) {
        console.log("Licence Check Error", error);
        setLicenceApproved(false);
      } finally {
        setCheckingLicence(false);
      }
    };

    checkLicenceAndFetchData();
  }, []);

  const handleVehicleImages = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > MAX_VEHICLE_IMAGES) {
      setErrors((prev) => ({
        ...prev,
        vehicleImages: `You can upload up to ${MAX_VEHICLE_IMAGES} images.`,
      }));

      e.target.value = "";
      return;
    }

    for (const file of files) {
      const error = validateImage(file);

      if (error) {
        setErrors((prev) => ({
          ...prev,
          vehicleImages: `${file.name}: ${error}`,
        }));

        e.target.value = "";
        setVehicleImages([]);
        return;
      }
    }

    setErrors((prev) => ({
      ...prev,
      vehicleImages: "",
    }));

    setVehicleImages(files);
  };

  const handleSingleImage = (e, setter, key) => {
    const file = e.target.files[0];
    const error = validateImage(file);

    if (error) {
      setErrors((prev) => ({
        ...prev,
        [key]: error,
      }));

      e.target.value = "";
      setter(null);
      return;
    }

    setErrors((prev) => ({
      ...prev,
      [key]: "",
    }));

    setter(file);
  };

  const clearVehicleImages = () => {
    setVehicleImages([]);

    if (vehicleImagesRef.current) {
      vehicleImagesRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.licenceCategoryId) {
      newErrors.licenceCategoryId = "Select a vehicle type";
    }

    if (!formData.brand.trim()) {
      newErrors.brand = "Brand is required";
    } else if (formData.brand.trim().length < 2) {
      newErrors.brand = "Brand must be at least 2 characters";
    }

    if (!formData.model.trim()) {
      newErrors.model = "Model is required";
    }

    const year = Number(formData.manufactureYear);

    if (!formData.manufactureYear) {
      newErrors.manufactureYear = "Manufacture year is required";
    } else if (
      !Number.isInteger(year) ||
      year < 1980 ||
      year > CURRENT_YEAR + 1
    ) {
      newErrors.manufactureYear = `Enter a year between 1980 and ${
        CURRENT_YEAR + 1
      }`;
    }

    if (!formData.color.trim()) {
      newErrors.color = "Color is required";
    }

    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = "Registration number is required";
    } else if (!/^[A-Z0-9-]{4,15}$/i.test(formData.registrationNumber.trim())) {
      newErrors.registrationNumber = "Enter a valid registration number";
    }

    if (!formData.fuelType) {
      newErrors.fuelType = "Select a fuel type";
    }

    const seats = Number(formData.seatingCapacity);

    if (!formData.seatingCapacity) {
      newErrors.seatingCapacity = "Seating capacity is required";
    } else if (!Number.isInteger(seats) || seats < 1 || seats > 60) {
      newErrors.seatingCapacity = "Enter a valid seating capacity (1-60)";
    }

    if (vehicleImages.length === 0) {
      newErrors.vehicleImages = "Please upload at least one vehicle image";
    }

    if (!rcFrontImage) {
      newErrors.rcFrontImage = "RC front image is required";
    }

    if (!rcBackImage) {
      newErrors.rcBackImage = "RC back image is required";
    }

    if (!insuranceImage) {
      newErrors.insuranceImage = "Insurance image is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      data.append("licenceCategoryId", formData.licenceCategoryId);
      data.append("model", formData.model.trim());
      data.append("brand", formData.brand.trim());
      data.append("manufactureYear", formData.manufactureYear);
      data.append("color", formData.color.trim());
      data.append(
        "registrationNumber",
        formData.registrationNumber.trim().toUpperCase(),
      );
      data.append("fuelTypeId", formData.fuelType);
      data.append("seatingCapacity", formData.seatingCapacity);

      vehicleImages.forEach((image) => {
        data.append("vehicleImages", image);
      });

      data.append("rcFrontImage", rcFrontImage);
      data.append("rcBackImage", rcBackImage);
      data.append("insuranceImage", insuranceImage);

      const res = await api.post("/vehicle/add", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMessage(res.data.message);

      setFormData({
        licenceCategoryId: "",
        model: "",
        brand: "",
        manufactureYear: "",
        color: "",
        registrationNumber: "",
        fuelType: "",
        seatingCapacity: "",
      });

      setVehicleImages([]);
      setRcFrontImage(null);
      setRcBackImage(null);
      setInsuranceImage(null);
      setErrors({});

      if (vehicleImagesRef.current) {
        vehicleImagesRef.current.value = "";
      }

      if (rcFrontRef.current) {
        rcFrontRef.current.value = "";
      }

      if (rcBackRef.current) {
        rcBackRef.current.value = "";
      }

      if (insuranceRef.current) {
        insuranceRef.current.value = "";
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingLicence) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking licence approval...
        </div>
      </div>
    );
  }

  if (!licenceApproved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-background p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Licence approval pending
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Your driving licence is not approved yet. Please wait for admin
            approval before adding a vehicle.
          </p>

          <div className="mt-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            You can add your vehicle once your licence is approved.
          </div>
        </div>
      </div>
    );
  }

  const imageUploadFields = [
    {
      key: "rcFrontImage",
      label: "RC front image",
      file: rcFrontImage,
      onChange: (e) => handleSingleImage(e, setRcFrontImage, "rcFrontImage"),
      ref: rcFrontRef,
      icon: FileText,
    },
    {
      key: "rcBackImage",
      label: "RC back image",
      file: rcBackImage,
      onChange: (e) => handleSingleImage(e, setRcBackImage, "rcBackImage"),
      ref: rcBackRef,
      icon: FileText,
    },
    {
      key: "insuranceImage",
      label: "Insurance image",
      file: insuranceImage,
      onChange: (e) =>
        handleSingleImage(e, setInsuranceImage, "insuranceImage"),
      ref: insuranceRef,
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
            <div className="flex items-center gap-3 border-b border-border px-7 py-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <Car className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h1 className="text-lg font-semibold tracking-tight text-foreground">
                  Add your vehicle
                </h1>

                <p className="text-sm text-muted-foreground">
                  Add your vehicle details for verification.
                </p>
              </div>
            </div>

            <div className="px-7 py-6">
              {errorMessage && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {successMessage}
                </div>
              )}

              <section>
                <div className="mb-3 flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />

                  <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Vehicle details
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="licenceCategoryId" className="mb-1.5 block">
                      Vehicle type
                    </Label>

                    <Select
                      value={formData.licenceCategoryId}
                      onValueChange={(value) =>
                        handleSelectChange("licenceCategoryId", value)
                      }
                    >
                      <SelectTrigger id="licenceCategoryId" className="w-full">
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>

                      <SelectContent>
                        {licenceCategories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {errors.licenceCategoryId && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.licenceCategoryId}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="fuelType" className="mb-1.5 block">
                      Fuel type
                    </Label>

                    <Select
                      value={formData.fuelType}
                      onValueChange={(value) =>
                        handleSelectChange("fuelType", value)
                      }
                    >
                      <SelectTrigger id="fuelType" className="w-full">
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>

                      <SelectContent>
                        {fuelTypes.map((fuel) => (
                          <SelectItem key={fuel._id} value={fuel._id}>
                            {fuel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {errors.fuelType && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.fuelType}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="brand" className="mb-1.5 block">
                      Brand
                    </Label>

                    <Input
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="Hyundai"
                    />

                    {errors.brand && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.brand}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="model" className="mb-1.5 block">
                      Model
                    </Label>

                    <Input
                      id="model"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      placeholder="i20"
                    />

                    {errors.model && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.model}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="manufactureYear" className="mb-1.5 block">
                      Manufacture year
                    </Label>

                    <Input
                      id="manufactureYear"
                      type="number"
                      name="manufactureYear"
                      value={formData.manufactureYear}
                      onChange={handleChange}
                      placeholder="2022"
                      min={1980}
                      max={CURRENT_YEAR + 1}
                    />

                    {errors.manufactureYear && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.manufactureYear}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="color" className="mb-1.5 block">
                      Color
                    </Label>

                    <Input
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      placeholder="White"
                    />

                    {errors.color && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.color}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="registrationNumber"
                      className="mb-1.5 block"
                    >
                      Registration number
                    </Label>

                    <Input
                      id="registrationNumber"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      placeholder="PB03S5509"
                      className="uppercase"
                    />

                    {errors.registrationNumber && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.registrationNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="seatingCapacity" className="mb-1.5 block">
                      Seating capacity
                    </Label>

                    <Input
                      id="seatingCapacity"
                      type="number"
                      name="seatingCapacity"
                      value={formData.seatingCapacity}
                      onChange={handleChange}
                      placeholder="5"
                      min={1}
                      max={60}
                    />

                    {errors.seatingCapacity && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.seatingCapacity}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <div className="my-6 h-px bg-border" />

              <section>
                <div className="mb-3 flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />

                  <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Vehicle images
                  </h2>
                </div>

                <label
                  className={cn(
                    "group flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
                    vehicleImages.length > 0
                      ? "border-emerald-300 bg-emerald-50/40"
                      : "border-border bg-muted/20 hover:border-blue-400 hover:bg-blue-50/60",
                  )}
                >
                  <input
                    ref={vehicleImagesRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleVehicleImages}
                    className="hidden"
                  />

                  {vehicleImages.length > 0 ? (
                    <>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      </div>

                      <p className="text-sm font-medium text-emerald-700">
                        {vehicleImages.length} image
                        {vehicleImages.length !== 1 ? "s" : ""} selected
                      </p>

                      <span
                        role="button"
                        onClick={(e) => {
                          e.preventDefault();
                          clearVehicleImages();
                        }}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                        Clear all
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-blue-100">
                        <Upload className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-blue-600" />
                      </div>

                      <p className="text-sm font-medium text-foreground">
                        Upload vehicle images
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Up to {MAX_VEHICLE_IMAGES} images · JPG, PNG, WEBP · 5MB
                        each
                      </p>
                    </>
                  )}
                </label>

                {errors.vehicleImages && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.vehicleImages}
                  </p>
                )}
              </section>

              <div className="my-6 h-px bg-border" />

              <section>
                <div className="mb-3 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />

                  <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Documents
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {imageUploadFields.map((field) => {
                    const Icon = field.icon;

                    return (
                      <div key={field.key}>
                        <label
                          className={cn(
                            "group flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition-colors",
                            field.file
                              ? "border-emerald-300 bg-emerald-50/40"
                              : "border-border bg-muted/20 hover:border-blue-400 hover:bg-blue-50/60",
                          )}
                        >
                          <input
                            ref={field.ref}
                            type="file"
                            accept="image/*"
                            onChange={field.onChange}
                            className="hidden"
                          />

                          {field.file ? (
                            <>
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              </div>

                              <p className="max-w-[140px] truncate text-xs font-medium text-emerald-700">
                                {field.file.name}
                              </p>
                            </>
                          ) : (
                            <>
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-blue-100">
                                <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-blue-600" />
                              </div>

                              <p className="text-xs font-medium text-foreground">
                                {field.label}
                              </p>
                            </>
                          )}
                        </label>

                        {errors[field.key] && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors[field.key]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="border-t border-border bg-muted/20 px-7 py-5">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Add vehicle"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddVehicle;
