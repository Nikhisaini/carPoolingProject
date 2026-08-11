import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/services/Api";
import { CreditCard, Eye, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyLicence() {
  const navigate = useNavigate();
  const [licence, setLicence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const getLicence = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await api.get("/licence/my-licence");
      console.log("Licence API Response:", res.data);
      console.log("Categories:", res.data.licence?.categories);
      setLicence(res.data.licence);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to load licence",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getLicence();
  }, []);

  const getStatusClass = () => {
    if (licence?.verificationStatus === "Approved") {
      return "bg-green-100 text-green-700 border-green-200";
    }
    if (licence?.verificationStatus === "Rejected") {
      return "bg-red-100 text-red-700 border-red-200";
    }
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http")) {
      return image;
    }
    return `http://localhost:8081/${image}`;
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Card>
          <CardContent className="flex min-h-60 items-center justify-center">
            <p className="text-sm text-gray-500">Loading licence...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Licence</h1>
          <p className="text-sm text-gray-500">
            View and manage your driving licence
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">{errorMessage}</p>
        </div>
      )}

      {!licence ? (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>

            <h2 className="text-xl font-semibold text-gray-900">
              No licence found
            </h2>

            <p className="mt-2 max-w-md text-sm text-gray-500">
              You have not added your driving licence yet. Add your licence to
              continue.
            </p>

            <Button
              type="button"
              onClick={() => navigate("/add-licence")}
              className="mt-6 gap-2 rounded-xl bg-blue-600 px-6 text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Licence
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Driving Licence</CardTitle>

                <CardDescription className="mt-1">
                  Your registered driving licence details
                </CardDescription>
              </div>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass()}`}
              >
                {licence.verificationStatus}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Licence Number</p>
                <p className="mt-1 font-semibold uppercase text-gray-900">
                  {licence.licenceNumber}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Categories</p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {licence.categories?.map((category) => (
                    <span
                      key={category._id}
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <p className="mb-3 text-sm font-medium text-gray-700">
                Licence Documents
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setSelectedImage({
                      title: "Licence Front",
                      url: getImageUrl(licence.frontImage),
                    })
                  }
                  className="h-11 gap-2 rounded-xl"
                >
                  <Eye className="h-4 w-4" />
                  View Front
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setSelectedImage({
                      title: "Licence Back",
                      url: getImageUrl(licence.backImage),
                    })
                  }
                  className="h-11 gap-2 rounded-xl"
                >
                  <Eye className="h-4 w-4" />
                  View Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={!!selectedImage}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedImage(null);
          }
        }}
      >
        <DialogContent className="h-fit max-h-[90vh] max-w-xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>{selectedImage?.title}</DialogTitle>
          </DialogHeader>

          {selectedImage?.url && (
            <div className="flex max-h-[65vh] justify-center overflow-auto rounded-xl bg-gray-50 p-3">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="h-auto max-h-[55vh] max-w-[550px] rounded-lg object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MyLicence;
