import React from "react";
import styled from "styled-components";
import Sidebar from "@/components/Sidebar";

const MainLayout = ({ children }) => {
  return (
    <Layout>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
    </Layout>
  );
};

export default MainLayout;

const Layout = styled.div`
  display: flex;
  min-height: 100vh;
  @media (max-width: 767px) { flex-direction: column; }
`;
