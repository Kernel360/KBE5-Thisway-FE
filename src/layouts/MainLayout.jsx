import React from "react";
import Sidebar from "@/components/Sidebar";

const MainLayout = ({ children }) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
};

export default MainLayout;
