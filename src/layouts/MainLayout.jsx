import React from "react";
import styled from "styled-components";
import Sidebar from "@/components/Sidebar";

const MainLayout = ({ children }) => {
  return (
    <Layout>
      <SkipLink href="#workspace-content">본문으로 건너뛰기</SkipLink>
      <Sidebar />
      <Main id="workspace-content" tabIndex={-1}>{children}</Main>
    </Layout>
  );
};

export default MainLayout;

const Layout = styled.div`
  display: flex;
  min-height: 100dvh;
  @media (max-width: 767px) { flex-direction: column; }
`;

const Main = styled.main`
  flex: 1; min-width: 0; width: 100%; background: ${({ theme }) => theme.palette.background.default};
`;
const SkipLink = styled.a`
  position: fixed; top: 8px; left: 8px; transform: translateY(-160%); z-index: 2000;
  padding: 12px 18px; background: #fff; color: #1D4ED8; border: 2px solid #2563eb; border-radius: 10px;
  &:focus { transform: translateY(0); }
`;
