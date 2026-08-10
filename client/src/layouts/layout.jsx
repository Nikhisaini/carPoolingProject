import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../layouts/header";
function layout() {
  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default layout;
