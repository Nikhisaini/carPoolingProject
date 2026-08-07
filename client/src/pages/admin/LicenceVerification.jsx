import React, { useState } from "react";

function LicenceVerification() {
  const [licences, setLicences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLicence, setSelectedLicence] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  return <div>working</div>;
}

export default LicenceVerification;
