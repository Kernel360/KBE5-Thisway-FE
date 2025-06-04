import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRole, getToken } from "@/utils/auth";

const RedirectByRole = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    const role = getUserRole(token);

    if (role === "ADMIN") {
      navigate("/admin/dashboard", { replace: true });
    } else if (role === "COMPANY_ADMIN" || role === "COMPANY_CHEF") {
      navigate("/company/dashboard", { replace: true });
    } else if (role === "MEMBER") {
      navigate("/user/dashboard", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return null;
};

export default RedirectByRole;
