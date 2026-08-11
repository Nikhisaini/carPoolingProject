import { useEffect, useMemo, useState } from "react";
import { Eye, Search, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/services/Api";
import LicenceDetailsDialog from "@/components/licence/LicenceDetailsDialog";

const LicenceVerification = () => {
  const [licences, setLicences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLicence, setSelectedLicence] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const getLicences = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/licences");

      setLicences(response.data.licences || []);
    } catch (error) {
      console.error("Get licences error:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleStatusChange = (licenceId, newStatus) => {
    setLicences((prevLicences) =>
      prevLicences.map((licence) =>
        licence._id === licenceId
          ? {
              ...licence,
              verificationStatus: newStatus,
            }
          : licence,
      ),
    );
  };
  useEffect(() => {
    getLicences();
  }, []);

  const filteredLicences = useMemo(() => {
    return licences.filter((licence) => {
      const firstName = licence.userId?.firstName || "";
      const lastName = licence.userId?.lastName || "";
      const licenceNumber = licence.licenceNumber || "";

      const searchText =
        `${firstName} ${lastName} ${licenceNumber}`.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesStatus =
        status === "All" || licence.verificationStatus === status;

      return matchesSearch && matchesStatus;
    });
  }, [licences, search, status]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";

      case "Pending":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Licence Verification
              </h1>

              <p className="text-sm text-muted-foreground">
                Review and verify submitted driving licences.
              </p>
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredLicences.length} licence
          {filteredLicences.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search by name or licence number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[280px]">Applicant</TableHead>
              <TableHead>Licence Number</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    Loading licences...
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading && filteredLicences.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShieldCheck className="h-8 w-8 text-muted-foreground/50" />

                    <p className="font-medium">No licences found</p>

                    <p className="text-sm text-muted-foreground">
                      Try changing your search or status filter.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              filteredLicences.map((licence) => {
                const user = licence.userId;

                const fullName = user
                  ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                  : "Unknown User";

                return (
                  <TableRow
                    key={licence._id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {user?.profileImage ? (
                          <img
                            src={`http://localhost:8081/${user.profileImage}`}
                            alt={fullName}
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-background"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-600">
                            {fullName.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate font-medium">{fullName}</p>

                          <p className="truncate text-xs text-muted-foreground">
                            {user?.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="font-medium">
                      {licence.licenceNumber || "—"}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(licence.categories) &&
                        licence.categories.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {licence.categories.map((category) => (
                              <Badge
                                key={category._id}
                                variant="secondary"
                                className="font-normal"
                              >
                                {category.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusStyle(licence.verificationStatus)}
                      >
                        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                        {licence.verificationStatus || "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {licence.verificationResult === "VALID" ? (
                        <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Verified
                        </Badge>
                      ) : licence.verificationResult === "INVALID" ? (
                        <Badge className="border-red-200 bg-red-50 text-red-700">
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                          Unverified
                        </Badge>
                      ) : licence.verificationResult === "ERROR" ? (
                        <Badge className="border-red-200 bg-red-50 text-red-700">
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                          Unverified
                        </Badge>
                      ) : (
                        <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Not Verified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          setSelectedLicence(licence);
                          setOpenDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <LicenceDetailsDialog
          open={openDialog}
          setOpen={setOpenDialog}
          licence={selectedLicence}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
};

export default LicenceVerification;
