import React from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { CssBaseline, GlobalStyles } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import StyledGlobalStyle from "@/theme/StyledGlobalStyle";
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import LoginPage from "@/pages/auth/LoginPage";
import PasswordResetPage from "@/pages/auth/PasswordResetPage";
import PasswordResetSuccessPage from "@/pages/auth/PasswordResetSuccessPage";
import CompanyDashboardPage from "@/pages/company/CompanyDashboardPage";
import CompanyCarManagementPage from "@/pages/company/CompanyCarManagementPage";
import CompanyCarDetailPage from "@/pages/company/CompanyCarDetailPage";
import CompanyUserManagementPage from "@/pages/company/CompanyUserManagementPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminUserManagementPage from "@/pages/admin/AdminUserManagementPage";
import globalStyles from "@/theme/globalStyles";
import TripDetailViewPage from "@/pages/trip/TripDetailViewPage";
import CarRegistrationPage from "@/pages/car/CarRegistrationPage";
import RedirectByRole from "@/pages/RedirectByRole";
import useUserStore from "@/store/userStore";
import { getToken } from "@/utils/auth";
import { useEffect } from "react";
import { isTokenExpired } from "@/utils/auth";
import LogoutPage from "@/pages/auth/LogoutPage";
import TripHistoryPage from "@/pages/trip/TripHistoryPage";
import CompanyStatisticsPage from "@/pages/company/CompanyStatisticsPage";
import CompanySettingsPage from "@/pages/company/CompanySettingsPage";
import AdminStatisticsPage from "@/pages/admin/AdminStatisticsPage";
import { ROUTES } from "@/routes";
import MemberDummyPage from "@/pages/member/MemberDummyPage";

// TODO: NotFoundPage 컴포넌트 생성 필요
const NotFoundPage = () => <div>404 Not Found</div>;

const routeList = [
  // Auth
  {
    path: ROUTES.login,
    element: (
      <AuthLayout>
        <LoginPage />
      </AuthLayout>
    ),
  },
  {
    path: ROUTES.passwordReset,
    element: (
      <AuthLayout>
        <PasswordResetPage />
      </AuthLayout>
    ),
  },
  {
    path: ROUTES.passwordResetSuccess,
    element: (
      <AuthLayout>
        <PasswordResetSuccessPage />
      </AuthLayout>
    ),
  },
  // Company
  {
    path: ROUTES.company.dashboard,
    element: (
      <MainLayout>
        <CompanyDashboardPage />
      </MainLayout>
    ),
  },
  {
    path: ROUTES.company.carManagement,
    element: (
      <MainLayout>
        <CompanyCarManagementPage />
      </MainLayout>
    ),
  },
  {
    path: ROUTES.company.carDetail,
    element: (
      <MainLayout>
        <CompanyCarDetailPage />
      </MainLayout>
    ),
  },
  {
    path: ROUTES.company.userManagement,
    element: (
      <MainLayout>
        <CompanyUserManagementPage />
      </MainLayout>
    ),
  },
  {
    path: ROUTES.company.tripHistory,
    element: (
      <MainLayout>
        <TripHistoryPage />
      </MainLayout>
    ),
  },
  {
    path: ROUTES.company.carRegistration,
    element: (
      <MainLayout>
        <CarRegistrationPage />
      </MainLayout>
    ),
  },
  {
    path: ROUTES.company.statistics,
    element: (
      <MainLayout>
        <CompanyStatisticsPage />
      </MainLayout>
    ),
  },
  {
    path: ROUTES.company.settings,
    element: (
      <MainLayout>
        <CompanySettingsPage />
      </MainLayout>
    ),
  },
  // Admin
  {
    path: ROUTES.admin.dashboard,
    element: (
      <MainLayout>
        <AdminDashboardPage />
      </MainLayout>
    ),
  },

  {
    path: ROUTES.admin.manage,
    element: (
      <MainLayout>
        <AdminUserManagementPage />
      </MainLayout>
    ),
  },
  {
    path: ROUTES.admin.statistics,
    element: (
      <MainLayout>
        <AdminStatisticsPage />
      </MainLayout>
    ),
  },
  // Trip detail
  {
    path: ROUTES.trip.detail,
    element: (
      <MainLayout>
        <TripDetailViewPage />
      </MainLayout>
    ),
  },
  // Member
  {
    path: ROUTES.member.dashboard,
    element: (
      <MainLayout>
        <MemberDummyPage pageName="내 대시보드" />
      </MainLayout>
    ),
  },
  {
    path: ROUTES.member.carReservation,
    element: (
      <MainLayout>
        <MemberDummyPage pageName="차량 예약" />
      </MainLayout>
    ),
  },
  {
    path: ROUTES.member.usageHistory,
    element: (
      <MainLayout>
        <MemberDummyPage pageName="내 이용 내역" />
      </MainLayout>
    ),
  },
  {
    path: ROUTES.member.driveLog,
    element: (
      <MainLayout>
        <MemberDummyPage pageName="운행 일지" />
      </MainLayout>
    ),
  },
  {
    path: ROUTES.member.profile,
    element: (
      <MainLayout>
        <MemberDummyPage pageName="내 정보 관리" />
      </MainLayout>
    ),
  },
  {
    path: ROUTES.member.support,
    element: (
      <MainLayout>
        <MemberDummyPage pageName="고객 센터" />
      </MainLayout>
    ),
  },
  // 기타
  { path: ROUTES.root, element: <RedirectByRole /> },
  { path: ROUTES.logout, element: <LogoutPage /> },
  { path: ROUTES.notFound, element: <NotFoundPage /> },
];

function App() {
  const setToken = useUserStore((state) => state.setToken);
  const location = useLocation();
  const navigate = useNavigate();
  const resetUser = useUserStore((state) => state.resetUser);
  const theme = useTheme();

  useEffect(() => {
    const token = getToken();
    if (token) {
      setToken(token);
    }
  }, [setToken]);

  useEffect(() => {
    const token = getToken();
    // 인증이 필요 없는 경로 예외처리
    const publicPaths = [
      "/login",
      "/password-reset",
      "/password-reset/success",
    ];
    if (publicPaths.includes(location.pathname)) return;

    if (!token || isTokenExpired(token)) {
      resetUser();
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
    }
  }, [location, navigate, resetUser]);

  return (
    <>
      <CssBaseline />
      <GlobalStyles styles={globalStyles(theme)} />
      <StyledGlobalStyle />
      <Routes>
        {routeList.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Routes>
    </>
  );
}

export default App;
