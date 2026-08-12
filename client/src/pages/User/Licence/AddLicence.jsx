import api from "@/services/Api";
import React, { useEffect, useRef, useState } from "react";
import {
  IdCard,
  Upload,
  CheckCircle2,
  Loader2,
  X,
  ImageIcon,
  Hash,
  Tag,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function AddLicence() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [licenceCategories, setLicenceCategories] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  const [formData, setFormData] = useState({
    licenceNumber: "",
    dob: "",
    categories: [],
  });

  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);

  useEffect(() => {
    getLicenceCategories();
  }, []);

  const getLicenceCategories = async () => {
    try {
      const res = await api.get("/licence-category");
      setLicenceCategories(res.data.data || []);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to load licence categories.",
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const toggleCategory = (id) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter((categoryId) => categoryId !== id)
        : [...prev.categories, id],
    }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const validateImage = (file) => {
    if (!file) {
      return "Please select an image.";
    }
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/avif",
    ];
    if (!allowedTypes.includes(file.type)) {
      return "Only JPG, JPEG, PNG, WEBP and AVIF images are allowed.";
    }
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return "Image size must not exceed 5 MB.";
    }
    if (file.size === 0) {
      return "Selected image is empty.";
    }
    return null;
  };

  const handleFrontImageChange = (e) => {
    const file = e.target.files?.[0];
    const error = validateImage(file);
    if (error) {
      setErrorMessage(error);
      e.target.value = "";
      setFrontImage(null);
      return;
    }
    setErrorMessage("");
    setSuccessMessage("");
    setFrontImage(file);
  };

  const handleBackImageChange = (e) => {
    const file = e.target.files?.[0];
    const error = validateImage(file);

    if (error) {
      setErrorMessage(error);
      e.target.value = "";
      setBackImage(null);
      return;
    }
    setErrorMessage("");
    setSuccessMessage("");
    setBackImage(file);
  };

  const handleLicenceNumberChange = (e) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 15);

    setFormData((prev) => ({
      ...prev,
      licenceNumber: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleDobChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      dob: e.target.value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  const clearFrontImage = () => {
    setFrontImage(null);
    if (frontInputRef.current) {
      frontInputRef.current.value = "";
    }
  };

  const clearBackImage = () => {
    setBackImage(null);
    if (backInputRef.current) {
      backInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.dob) {
      setErrorMessage("Date of birth is required.");
      return;
    }

    const selectedDob = new Date(`${formData.dob}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDob > today) {
      setErrorMessage("Date of birth cannot be in the future.");
      return;
    }
    if (!formData.licenceNumber.trim()) {
      setErrorMessage("Licence number is required.");
      return;
    }
    if (formData.categories.length === 0) {
      setErrorMessage("Please select at least one category.");
      return;
    }
    if (!frontImage) {
      setErrorMessage("Please upload front image.");
      return;
    }
    if (!backImage) {
      setErrorMessage("Please upload back image.");
      return;
    }
    const frontError = validateImage(frontImage);
    if (frontError) {
      setErrorMessage(frontError);
      return;
    }
    const backError = validateImage(backImage);
    if (backError) {
      setErrorMessage(backError);
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append("licenceNumber", formData.licenceNumber.trim());
      data.append("dob", formData.dob);
      formData.categories.forEach((categoryId) => {
        data.append("categories", categoryId);
      });
      data.append("frontImage", frontImage);
      data.append("backImage", backImage);

      const res = await api.post("/licence/add", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccessMessage(
        res.data.message || "Driving licence submitted successfully.",
      );
      setFormData({
        licenceNumber: "",
        dob: "",
        categories: [],
      });
      setFrontImage(null);
      setBackImage(null);

      if (frontInputRef.current) {
        frontInputRef.current.value = "";
      }

      if (backInputRef.current) {
        backInputRef.current.value = "";
      }
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
    <div className="min-h-screen bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
            <div className="flex items-center gap-3 border-b border-border px-7 py-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <IdCard className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h1 className="text-lg font-semibold tracking-tight text-foreground">
                  Driving licence verification
                </h1>

                <p className="text-sm text-muted-foreground">
                  Upload your driving licence for quick verification.
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
                    Licence details
                  </h2>
                </div>

                <Label htmlFor="licenceNumber" className="mb-1.5 block">
                  Licence number
                </Label>

                <Input
                  id="licenceNumber"
                  type="text"
                  name="licenceNumber"
                  value={formData.licenceNumber}
                  onChange={handleLicenceNumberChange}
                  placeholder="e.g. KA0120198900984"
                  maxLength={15}
                  autoComplete="off"
                  required
                />

                <div>
                  <Label htmlFor="dob" className="mb-1.5 pt-6 block">
                    Date of birth
                  </Label>

                  <Input
                    id="dob"
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleDobChange}
                    max={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </section>

              <div className="my-6 h-px bg-border" />

              <section>
                <div className="mb-3 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />

                  <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Vehicle categories
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  {licenceCategories.map((item) => {
                    const isSelected = formData.categories.includes(item._id);

                    return (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => toggleCategory(item._id)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                          isSelected
                            ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                            : "border-border bg-background text-foreground hover:border-blue-300 hover:bg-blue-50",
                        )}
                      >
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}

                        {item.type}
                      </button>
                    );
                  })}
                </div>

                {formData.categories.length === 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Select at least one category that applies to your licence.
                  </p>
                )}
              </section>

              <div className="my-6 h-px bg-border" />

              <section>
                <div className="mb-3 flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />

                  <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Document images
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label
                    className={cn(
                      "group flex min-h-[168px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
                      frontImage
                        ? "border-emerald-300 bg-emerald-50/40"
                        : "border-border bg-muted/20 hover:border-blue-400 hover:bg-blue-50/60",
                    )}
                  >
                    <input
                      type="file"
                      ref={frontInputRef}
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={handleFrontImageChange}
                      className="hidden"
                    />

                    {frontImage ? (
                      <>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>

                        <div>
                          <p className="max-w-[180px] truncate text-sm font-medium text-emerald-700">
                            {frontImage.name}
                          </p>

                          <span
                            role="button"
                            onClick={(e) => {
                              e.preventDefault();
                              clearFrontImage();
                            }}
                            className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                            Remove
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-blue-100">
                          <Upload className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-blue-600" />
                        </div>

                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Front image
                          </p>

                          <p className="mt-0.5 text-xs text-muted-foreground">
                            JPG, PNG, WEBP, AVIF · up to 5MB
                          </p>
                        </div>
                      </>
                    )}
                  </label>

                  <label
                    className={cn(
                      "group flex min-h-[168px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
                      backImage
                        ? "border-emerald-300 bg-emerald-50/40"
                        : "border-border bg-muted/20 hover:border-blue-400 hover:bg-blue-50/60",
                    )}
                  >
                    <input
                      type="file"
                      ref={backInputRef}
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={handleBackImageChange}
                      className="hidden"
                    />

                    {backImage ? (
                      <>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>

                        <div>
                          <p className="max-w-[180px] truncate text-sm font-medium text-emerald-700">
                            {backImage.name}
                          </p>

                          <span
                            role="button"
                            onClick={(e) => {
                              e.preventDefault();
                              clearBackImage();
                            }}
                            className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                            Remove
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-blue-100">
                          <ImageIcon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-blue-600" />
                        </div>

                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Back image
                          </p>

                          <p className="mt-0.5 text-xs text-muted-foreground">
                            JPG, PNG, WEBP, AVIF · up to 5MB
                          </p>
                        </div>
                      </>
                    )}
                  </label>
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
                  "Submit for verification"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddLicence;
