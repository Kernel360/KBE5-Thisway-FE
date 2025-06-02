import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import theme from "@/theme";
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
import AdminCompanyManagementPage from "@/pages/admin/AdminCompanyManagementPage";
import AdminUserManagementPage from "@/pages/admin/AdminUserManagementPage";
import AdminVehicleApprovalPage from "@/pages/admin/AdminVehicleApprovalPage";
import UserDashboardPage from "@/pages/user/UserDashboardPage";
import TripDetailViewPage from "@/pages/trip/TripDetailViewPage";
import CarRegistrationPage from "@/pages/car/CarRegistrationPage";

// TODO: NotFoundPage 컴포넌트 생성 필요
const NotFoundPage = () => <div>404 Not Found</div>;

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <StyledThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                <AuthLayout>
                  <LoginPage />
                </AuthLayout>
              }
            />
            <Route
              path="/password-reset"
              element={
                <AuthLayout>
                  <PasswordResetPage />
                </AuthLayout>
              }
            />
            <Route
              path="/password-reset/success"
              element={
                <AuthLayout>
                  <PasswordResetSuccessPage />
                </AuthLayout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <MainLayout>
                  <CompanyDashboardPage />
                </MainLayout>
              }
            />
            <Route
              path="/company/car-management"
              element={
                <MainLayout>
                  <CompanyCarManagementPage />
                </MainLayout>
              }
            />
            <Route
              path="/company/car-detail"
              element={
                <MainLayout>
                  <CompanyCarDetailPage />
                </MainLayout>
              }
            />
            <Route
              path="/company/user-management"
              element={
                <MainLayout>
                  <CompanyUserManagementPage />
                </MainLayout>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <MainLayout>
                  <AdminDashboardPage />
                </MainLayout>
              }
            />
            <Route
              path="/admin/company"
              element={
                <MainLayout>
                  <AdminCompanyManagementPage />
                </MainLayout>
              }
            />
            <Route
              path="/admin/user"
              element={
                <MainLayout>
                  <AdminUserManagementPage />
                </MainLayout>
              }
            />
            <Route
              path="/admin/vehicle-approval"
              element={
                <MainLayout>
                  <AdminVehicleApprovalPage />
                </MainLayout>
              }
            />
            <Route
              path="/user/dashboard"
              element={
                <MainLayout>
                  <UserDashboardPage />
                </MainLayout>
              }
            />
            <Route
              path="/trip-detail"
              element={
                <MainLayout>
                  <TripDetailViewPage />
                </MainLayout>
              }
            />
            <Route
              path="/car-registration"
              element={
                <MainLayout>
                  <CarRegistrationPage />
                </MainLayout>
              }
            />
            {/* TODO: login required */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </StyledThemeProvider>
    </MuiThemeProvider>
  );
}

export default App;
