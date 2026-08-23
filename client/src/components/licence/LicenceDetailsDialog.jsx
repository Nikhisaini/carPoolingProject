import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  User,
  CreditCard,
  CalendarDays,
  Mail,
  Phone,
  XCircle,
  CheckCircle2,
  ImageIcon,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/services/Api";

const LicenceDetailsDialog = ({
  open,
  setOpen,
  licence,
  onStatusUpdate,
  onStatusChange,
}) => {
  const [actionLoading, setActionLoading] = useState(null);
  const [cashfreeVerified, setCashfreeVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(
    licence?.verificationResult || null,
  );

  const [verificationReason, setVerificationReason] = useState(
    licence?.verificationFailureReason || null,
  );

  useEffect(() => {
    setVerificationStatus(licence?.verificationResult || null);
    setVerificationReason(licence?.verificationFailureReason || null);
    setCashfreeVerified(licence?.verificationResult === "VALID");
  }, [licence]);

  if (!licence) {
    return null;
  }
  const user = licence.userId;
  const fullName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "Unknown User";

  const imageUrl = (image) => {
    if (!image) {
      return "";
    }

    const normalizedPath = image.replaceAll("\\", "/").replace(/^\/+/, "");
    return `http://localhost:8081/${normalizedPath}`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "Rejected":
        return "border-red-200 bg-red-50 text-red-700";
      default:
        return "border-amber-200 bg-amber-50 text-amber-700";
    }
  };
  const handleVerify = async () => {
    if (!licence?._id || actionLoading) return;

    try {
      setActionLoading("verify");
      const res = await api.put(`/admin/licence/${licence._id}/verify`);
      const verification = res.data.verification;
      const status = verification?.status;
      setVerificationStatus(status || "INVALID");

      if (status === "VALID") {
        setCashfreeVerified(true);
        setVerificationReason(null);

        if (onStatusUpdate) {
          onStatusUpdate({
            ...licence,
            verificationStatus: "Pending",
            verificationProvider: "Cashfree",
            verificationReferenceId: verification.referenceId || null,
            verificationFailureReason: null,
          });
        }
      } else {
        setCashfreeVerified(false);
        setVerificationReason(
          verification?.reason ||
            res.data.message ||
            "Driving Licence verification failed.",
        );
        if (onStatusUpdate) {
          onStatusUpdate({
            ...licence,
            verificationStatus: "Pending",
            verificationProvider: "Cashfree",
            verificationReferenceId: verification?.referenceId || null,
            verificationFailureReason: verification?.reason || res.data.message,
          });
        }
      }
    } catch (error) {
      console.error("Verify Licence Error:", error.response?.data || error);
      const verification = error.response?.data?.verification;
      setVerificationStatus(verification?.status || "ERROR");
      setCashfreeVerified(false);
      setVerificationReason(
        verification?.reason ||
          error.response?.data?.message ||
          "Failed to verify driving licence.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async () => {
    if (!licence?._id || actionLoading) return;
    try {
      setActionLoading("approve");
      const res = await api.put(`/admin/licence/${licence._id}/approve`);
      if (res.data.success) {
        if (onStatusUpdate) {
          onStatusUpdate({
            ...licence,
            verificationStatus: "Approved",
          });
        }
        if (onStatusChange) {
          onStatusChange(licence._id, "Approved");
        }
        setOpen(false);
      }
    } catch (error) {
      console.error("Approve Licence Error:", error.response?.data || error);
      alert(
        error.response?.data?.message || "Failed to approve driving licence.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!licence?._id || actionLoading) return;
    try {
      setActionLoading("reject");
      const res = await api.put(`/admin/licence/${licence._id}/reject`);
      if (res.data.success) {
        if (onStatusUpdate) {
          onStatusUpdate({
            ...licence,
            verificationStatus: "Rejected",
          });
        }
        if (onStatusChange) {
          onStatusChange(licence._id, "Rejected");
        }
        setOpen(false);
      }
    } catch (error) {
      console.error("Reject Licence Error:", error.response?.data || error);
      alert(
        error.response?.data?.message || "Failed to reject driving licence.",
      );
    } finally {
      setActionLoading(null);
    }
  };
  const currentStatus = licence.verificationStatus || "Pending";
  const isPending = currentStatus === "Pending";

  const existingVerificationResult = licence.verificationResult;
  const isAlreadyVerified = existingVerificationResult === "VALID";
  const isAlreadyInvalid = existingVerificationResult === "INVALID";
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex max-h-[92vh] w-[calc(100%-2rem)] max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-background p-0 text-foreground shadow-2xl">
        <DialogHeader className="shrink-0 border-b border-border bg-background px-7 py-5">
          <div className="flex items-center justify-between pr-10">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                  Licence Verification
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                  Review the applicant's submitted driving licence.
                </DialogDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`rounded-full px-3 py-1.5 font-medium ${getStatusClass(currentStatus)}`}
            >
              <span
                className={`mr-2 h-1.5 w-1.5 rounded-full ${currentStatus === "Approved" ? "bg-emerald-500" : currentStatus === "Rejected" ? "bg-red-500" : "bg-amber-500"}`}
              />
              {currentStatus}
            </Badge>
          </div>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/30 px-7 py-6">
          <div className="mx-auto max-w-6xl space-y-6">
            <section className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Applicant Information
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Licence holder details
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-lg font-semibold text-white">
                    {user?.profileImage ? (
                      <img
                        src={imageUrl(user.profileImage)}
                        alt={fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user?.firstName?.charAt(0)?.toUpperCase() || "U"
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{fullName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Licence Applicant
                    </p>
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:min-w-[420px]">
                  <div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Email
                      </p>
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {user?.email || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Phone
                      </p>
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {user?.phoneNumber || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </section>
            <section className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Licence Information
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Submitted licence details
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 p-6 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-muted/30 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Licence Number
                  </p>
                  <p className="mt-2 break-all text-base font-semibold tracking-wide text-foreground">
                    {licence.licenceNumber || "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Categories
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {licence.categories?.filter(Boolean).length > 0 ? (
                      licence.categories.filter(Boolean).map((category) => (
                        <Badge
                          key={category._id || category.name}
                          variant="secondary"
                          className="rounded-md border border-border bg-background px-2.5 py-1 text-foreground"
                        >
                          {category.name || "Unknown"}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No categories
                      </span>
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Verification Status
                  </p>
                  <div className="mt-3">
                    <Badge
                      variant="outline"
                      className={`rounded-full px-3 py-1 ${getStatusClass(currentStatus)}`}
                    >
                      {currentStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </section>
            <section className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Licence Documents
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Review both sides of the submitted licence
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-6 p-6 lg:grid-cols-2">
                <div className="overflow-hidden rounded-xl border border-border bg-background">
                  <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        Front Side
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Driving licence front image
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      Front
                    </Badge>
                  </div>
                  <div className="flex min-h-[360px] items-center justify-center bg-muted/30 p-5">
                    {licence.frontImage ? (
                      <img
                        src={imageUrl(licence.frontImage)}
                        alt="Driving licence front"
                        className="max-h-[500px] max-w-full rounded-lg object-contain shadow-md"
                        onError={(e) => {
                          console.error(
                            "Front image failed:",
                            e.currentTarget.src,
                          );
                        }}
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="mx-auto mb-3 h-10 w-10" />
                        <p className="text-sm">Front image unavailable</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-border bg-background">
                  <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        Back Side
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Driving licence back image
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      Back
                    </Badge>
                  </div>
                  <div className="flex min-h-[360px] items-center justify-center bg-muted/30 p-5">
                    {licence.backImage ? (
                      <img
                        src={imageUrl(licence.backImage)}
                        alt="Driving licence back"
                        className="max-h-[500px] max-w-full rounded-lg object-contain shadow-md"
                        onError={(e) => {
                          console.error(
                            "Back image failed:",
                            e.currentTarget.src,
                          );
                        }}
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="mx-auto mb-3 h-10 w-10" />
                        <p className="text-sm">Back image unavailable</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
            <div className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>
                Submitted{" "}
                {licence.createdAt
                  ? new Date(licence.createdAt).toLocaleString()
                  : "—"}
              </span>
            </div>
            <div className="sticky bottom-0 rounded-xl border border-border bg-background p-5 shadow-lg">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-foreground">
                    Verification Decision
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Review all information before making a decision.
                  </p>
                </div>
                <div className="flex gap-3">
                  {verificationStatus && (
                    <div className="flex max-w-md flex-col items-end pt-1.5 text-right">
                      <span
                        className={`text-sm font-semibold ${
                          verificationStatus === "VALID"
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {verificationStatus === "VALID"
                          ? "✓ Valid"
                          : "✕ Invalid"}
                      </span>
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReject}
                    disabled={actionLoading !== null || !isPending}
                    className="min-w-[120px] border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    {actionLoading === "reject" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    {actionLoading === "reject" ? "Rejecting..." : "Reject"}
                  </Button>
                  {!cashfreeVerified && !isAlreadyVerified ? (
                    <Button
                      type="button"
                      onClick={handleVerify}
                      disabled={actionLoading !== null || !isPending}
                      className="min-w-[120px] bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                    >
                      {actionLoading === "verify" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShieldCheck className="h-4 w-4" />
                      )}
                      {actionLoading === "verify" ? "Verifying..." : "Verify"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleApprove}
                      disabled={actionLoading !== null || !isPending}
                      className="min-w-[120px] bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                    >
                      {actionLoading === "approve" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      {actionLoading === "approve" ? "Approving..." : "Approve"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LicenceDetailsDialog;
