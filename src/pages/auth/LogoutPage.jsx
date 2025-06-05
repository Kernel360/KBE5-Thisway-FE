import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "@/store/userStore";

const LogoutPage = () => {
  const navigate = useNavigate();
  const resetUser = useUserStore((state) => state.resetUser);

  useEffect(() => {
    resetUser();
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }, [navigate, resetUser]);

  return null;
};

export default LogoutPage;
