import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      // Nếu không có token, chuyển hướng đến trang đăng nhập
      navigate("/signin");
    }
  }, [navigate]);

  return children;
};

export default ProtectedRoute;