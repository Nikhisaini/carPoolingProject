import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600">403</h1>

        <h2 className="mt-4 text-2xl font-semibold text-foreground">
          Access Denied
        </h2>

        <p className="mt-2 text-muted-foreground">
          You don't have permission to access this page.
        </p>

        <Button className="mt-6" onClick={() => navigate("/")}>
          Go Home
        </Button>
      </div>
    </div>
  );
}

export default Unauthorized;
