export const ROUTES = {
  login: "/login",
  passwordReset: "/password-reset",
  passwordResetSuccess: "/password-reset/success",
  logout: "/logout",
  notFound: "*",
  root: "/",
  // 관리자
  admin: {
    dashboard: "/admin/dashboard",
    manage: "/admin/manage",
    statistics: "/admin/statistics",
  },
  // 회사(업체)
  company: {
    dashboard: "/company/dashboard",
    carManagement: "/company/car-management",
    carDetail: "/company/car-detail",
    userManagement: "/company/user-management",
    tripHistory: "/company/trip-history",
    carRegistration: "/company/car-registration",
    statistics: "/company/statistics",
    settings: "/company/settings",
  },
  // 일반 유저
  user: {
    dashboard: "/user/dashboard",
  },
  // 기타
  trip: {
    detail: "/company/trip-detail",
  },
  // 멤버
  member: {
    dashboard: "/member/dashboard",
    carReservation: "/member/car-reservation",
    usageHistory: "/member/usage-history",
    driveLog: "/member/drive-log",
    profile: "/member/profile",
    support: "/member/support",
  },
};
