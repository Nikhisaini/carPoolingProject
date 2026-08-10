import api from "@/services/Api";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Car,
  Upload,
  ImageIcon,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Hash,
  Tag,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const MAX_IMAGE_SIZE_MB = 5;
const CURRENT_YEAR = new Date().getFullYear();
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];

function validateImage(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Only JPG, PNG, WEBP and AVIF images are allowed.";
  }
  if (file.size === 0) return "Selected image is empty.";
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return `Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB.`;
  }
  return null;
}

function EditVehicle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [vehicleImages, setVehicleImages] = useState([]);
  const [rcFrontImage, setRcFrontImage] = useState(null);
  const [rcBackImage, setRcBackImage] = useState(null);
  const [insuranceImage, setInsuranceImage] = useState(null);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [errors, setErrors] = useState({});
  const [vehicleData, setVehicleData] = useState({
    vehicleTypeId: "",
    model: "",
    brand: "",
    manufactureYear: "",
    color: "",
    registrationNumber: "",
    fuelTypeId: "",
    seatingCapacity: "",
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setFetching(true);

        const [vehicleTypeRes, fuelTypeRes, vehicleRes] = await Promise.all([
          api.get("/vehicle-type/list"),
          api.get("/fuel-type/list"),
          api.get(`/vehicle/${id}`),
        ]);

        setVehicleTypes(vehicleTypeRes.data.data);
        setFuelTypes(fuelTypeRes.data.data);

        setVehicleData({
          vehicleTypeId: vehicleRes.data.vehicle.vehicleTypeId?._id,
          model: vehicleRes.data.vehicle.model,
          brand: vehicleRes.data.vehicle.brand,
          manufactureYear: vehicleRes.data.vehicle.manufactureYear,
          color: vehicleRes.data.vehicle.color,
          registrationNumber: vehicleRes.data.vehicle.registrationNumber,
          fuelTypeId: vehicleRes.data.vehicle.fuelTypeId?._id,
          seatingCapacity: vehicleRes.data.vehicle.seatingCapacity,
        });
      } catch (error) {
        const message = error.response?.data?.message || "Something went wrong";
        setErrorMessage(message);
      } finally {
        setFetching(false);
      }
    };

    fetchAll();
  }, [id]);

  const handleChange = (e) => {
    setVehicleData({
      ...vehicleData,
      [e.target.name]: e.target.value,
    });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setErrorMessage("");
  };

  const handleSelectChange = (name, value) => {
    setVehicleData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setErrorMessage("");
  };

  const handleVehicleImages = (e) => {
    const files = Array.from(e.target.files);
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
    setErrors((prev) => ({ ...prev, vehicleImages: "" }));
    setVehicleImages(files);
  };

  const handleSingleImage = (e, setter, key) => {
    const file = e.target.files[0];
    if (!file) return;
    const error = validateImage(file);
    if (error) {
      setErrors((prev) => ({ ...prev, [key]: error }));
      e.target.value = "";
      setter(null);
      return;
    }
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setter(file);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!vehicleData.vehicleTypeId) {
      newErrors.vehicleTypeId = "Select a vehicle type";
    }
    if (!vehicleData.brand?.trim()) {
      newErrors.brand = "Brand is required";
    } else if (vehicleData.brand.trim().length < 2) {
      newErrors.brand = "Brand must be at least 2 characters";
    }
    if (!vehicleData.model?.trim()) {
      newErrors.model = "Model is required";
    }

    const year = Number(vehicleData.manufactureYear);
    if (!vehicleData.manufactureYear) {
      newErrors.manufactureYear = "Manufacture year is required";
    } else if (
      !Number.isInteger(year) ||
      year < 1980 ||
      year > CURRENT_YEAR + 1
    ) {
      newErrors.manufactureYear = `Enter a year between 1980 and ${CURRENT_YEAR + 1}`;
    }

    if (!vehicleData.color?.trim()) {
      newErrors.color = "Color is required";
    }

    if (!vehicleData.registrationNumber?.trim()) {
      newErrors.registrationNumber = "Registration number is required";
    } else if (
      !/^[A-Z0-9-]{4,15}$/i.test(vehicleData.registrationNumber.trim())
    ) {
      newErrors.registrationNumber = "Enter a valid registration number";
    }

    if (!vehicleData.fuelTypeId) {
      newErrors.fuelTypeId = "Select a fuel type";
    }

    const seats = Number(vehicleData.seatingCapacity);
    if (!vehicleData.seatingCapacity) {
      newErrors.seatingCapacity = "Seating capacity is required";
    } else if (!Number.isInteger(seats) || seats < 1 || seats > 60) {
      newErrors.seatingCapacity = "Enter a valid seating capacity (1-60)";
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
      formData.append("vehicleTypeId", vehicleData.vehicleTypeId);
      formData.append("model", vehicleData.model);
      formData.append("brand", vehicleData.brand);
      formData.append("manufactureYear", vehicleData.manufactureYear);
      formData.append("color", vehicleData.color);
      formData.append("registrationNumber", vehicleData.registrationNumber);
      formData.append("fuelTypeId", vehicleData.fuelTypeId);
      formData.append("seatingCapacity", vehicleData.seatingCapacity);

      vehicleImages.forEach((image) => {
        formData.append("vehicleImages", image);
      });

      if (rcFrontImage) formData.append("rcFrontImage", rcFrontImage);
      if (rcBackImage) formData.append("rcBackImage", rcBackImage);
      if (insuranceImage) formData.append("insuranceImage", insuranceImage);

      const res = await api.put(`/vehicle/update/${id}`, formData);
      setSuccessMessage(res.data.message);
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const documentFields = [
    {
      key: "rcFrontImage",
      label: "RC front image",
      file: rcFrontImage,
      onChange: (e) => handleSingleImage(e, setRcFrontImage, "rcFrontImage"),
      icon: FileText,
    },
    {
      key: "rcBackImage",
      label: "RC back image",
      file: rcBackImage,
      onChange: (e) => handleSingleImage(e, setRcBackImage, "rcBackImage"),
      icon: FileText,
    },
    {
      key: "insuranceImage",
      label: "Insurance image",
      file: insuranceImage,
      onChange: (e) =>
        handleSingleImage(e, setInsuranceImage, "insuranceImage"),
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
                  Edit vehicle
                </h1>
                <p className="text-sm text-muted-foreground">
                  Update your vehicle details.
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

              {fetching ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <Skeleton className="h-3.5 w-20" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <section>
                    <div className="mb-3 flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Vehicle details
                      </h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="vehicleTypeId" className="mb-1.5 block">
                          Vehicle type
                        </Label>
                        <Select
                          value={vehicleData.vehicleTypeId}
                          onValueChange={(v) =>
                            handleSelectChange("vehicleTypeId", v)
                          }
                        >
                          <SelectTrigger id="vehicleTypeId" className="w-full">
                            <SelectValue placeholder="Select vehicle type">
                              {(value) =>
                                vehicleTypes.find((t) => t._id === value)
                                  ?.name || "Select vehicle type"
                              }
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {vehicleTypes.map((type) => (
                              <SelectItem key={type._id} value={type._id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.vehicleTypeId && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.vehicleTypeId}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="fuelTypeId" className="mb-1.5 block">
                          Fuel type
                        </Label>
                        <Select
                          value={vehicleData.fuelTypeId}
                          onValueChange={(v) =>
                            handleSelectChange("fuelTypeId", v)
                          }
                        >
                          <SelectTrigger id="fuelTypeId" className="w-full">
                            <SelectValue placeholder="Select fuel type">
                              {(value) =>
                                fuelTypes.find((f) => f._id === value)?.name ||
                                "Select fuel type"
                              }
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {fuelTypes.map((fuel) => (
                              <SelectItem key={fuel._id} value={fuel._id}>
                                {fuel.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.fuelTypeId && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.fuelTypeId}
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
                          value={vehicleData.brand}
                          onChange={handleChange}
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
                          value={vehicleData.model}
                          onChange={handleChange}
                        />
                        {errors.model && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.model}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="manufactureYear"
                          className="mb-1.5 block"
                        >
                          Manufacture year
                        </Label>
                        <Input
                          id="manufactureYear"
                          type="number"
                          name="manufactureYear"
                          value={vehicleData.manufactureYear}
                          onChange={handleChange}
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
                          value={vehicleData.color}
                          onChange={handleChange}
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
                          value={vehicleData.registrationNumber}
                          onChange={handleChange}
                          className="uppercase"
                        />
                        {errors.registrationNumber && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.registrationNumber}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="seatingCapacity"
                          className="mb-1.5 block"
                        >
                          Seating capacity
                        </Label>
                        <Input
                          id="seatingCapacity"
                          type="number"
                          name="seatingCapacity"
                          value={vehicleData.seatingCapacity}
                          onChange={handleChange}
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

                  {/* VEHICLE IMAGES */}
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
                            {vehicleImages.length} new image
                            {vehicleImages.length !== 1 ? "s" : ""} selected
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-blue-100">
                            <Upload className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-blue-600" />
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            Replace vehicle images
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Leave blank to keep current images · JPG, PNG, WEBP
                            · 5MB each
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

                  {/* DOCUMENTS */}
                  <section>
                    <div className="mb-3 flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Documents
                      </h2>
                    </div>

                    <p className="mb-3 text-xs text-muted-foreground">
                      Leave any of these blank to keep the current file on
                      record.
                    </p>

                    <div className="grid gap-4 sm:grid-cols-3">
                      {documentFields.map((field) => {
                        const Icon = field.icon;
                        return (
                          <div key={field.key}>
                            <label
                              className={cn(
                                "group flex min-h-[130px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition-colors",
                                field.file
                                  ? "border-emerald-300 bg-emerald-50/40"
                                  : "border-border bg-muted/20 hover:border-blue-400 hover:bg-blue-50/60",
                              )}
                            >
                              <input
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
                </>
              )}
            </div>

            {/* FOOTER */}
            <div className="flex gap-3 border-t border-border bg-muted/20 px-7 py-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || fetching}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update vehicle"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditVehicle;
